import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { AssinaturaStatus } from "../services/assinaturaService";
import assinaturaService from "../services/assinaturaService";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AssinaturaContextData {
  status: AssinaturaStatus | null;
  loading: boolean;
  error: string | null;
  verificarStatus: (forceFetch?: boolean) => Promise<void>;
  ativarAssinatura: (duracaoMeses?: number) => Promise<void>;
  cancelarAssinatura: () => Promise<void>;
  temPermissaoPremium: boolean;
  podeUsarApp: boolean;
  estaNoPeriodoTrial: boolean;
}

interface AssinaturaProviderProps {
  children: ReactNode;
}

const AssinaturaContext = createContext<AssinaturaContextData>(
  {} as AssinaturaContextData
);

export function AssinaturaProvider({ children }: AssinaturaProviderProps) {
  const [status, setStatus] = useState<AssinaturaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valores derivados para simplificar uso na UI com verificações mais robustas
  // Usar preferencialmente o novo campo statusTipo, mas manter compatibilidade com campos antigos
  const temPermissaoPremium =
    status?.statusTipo === "premium" || status?.podeUsarPremium === true;
  const podeUsarApp =
    (status?.statusTipo &&
      status?.statusTipo !== "trial_expirado" &&
      status?.statusTipo !== "expirado") ||
    status?.podeUsarRecursosBasicos === true;
  const estaNoPeriodoTrial =
    status?.statusTipo === "trial" ||
    (status?.trialAtivo === true && status?.diasRestantesTrial > 0);

  // Função para validar e corrigir inconsistências no status
  const validarStatusAssinatura = (
    status: AssinaturaStatus
  ): AssinaturaStatus => {
    // Cria uma cópia para não modificar o objeto original
    const statusValidado = { ...status };

    // Regra 1: Usuário não pode ter trial e assinatura ativos simultaneamente
    // Assinatura tem precedência
    if (statusValidado.trialAtivo && statusValidado.assinaturaAtiva) {
      console.warn(
        "[AssinaturaContext] Inconsistência corrigida: trial e assinatura ativos simultaneamente - priorizando assinatura"
      );
      statusValidado.trialAtivo = false;
      statusValidado.diasRestantesTrial = 0;
    }

    // Regra 2: Se o trial não está ativo, dias restantes deve ser 0
    if (!statusValidado.trialAtivo && statusValidado.diasRestantesTrial > 0) {
      console.warn(
        "[AssinaturaContext] Inconsistência corrigida: trial inativo com dias restantes > 0"
      );
      statusValidado.diasRestantesTrial = 0;
    }

    // Regra 3: Garantir coerência nos recursos disponíveis
    // Usuário com assinatura ativa deve ter acesso premium
    if (statusValidado.assinaturaAtiva && !statusValidado.podeUsarPremium) {
      console.warn(
        "[AssinaturaContext] Inconsistência corrigida: assinatura ativa sem acesso premium"
      );
      statusValidado.podeUsarPremium = true;
      statusValidado.podeUsarRecursosBasicos = true;
    }

    // Regra 4: Se trial ativo, deve ter dias restantes > 0
    if (statusValidado.trialAtivo && statusValidado.diasRestantesTrial <= 0) {
      console.warn(
        "[AssinaturaContext] Inconsistência corrigida: trial ativo com 0 dias restantes"
      );
      statusValidado.diasRestantesTrial = 1; // Definir pelo menos 1 dia para evitar problemas na UI
    }

    // Regra 5: Se tem permissão premium, deve poder usar recursos básicos
    if (
      statusValidado.podeUsarPremium &&
      !statusValidado.podeUsarRecursosBasicos
    ) {
      console.warn(
        "[AssinaturaContext] Inconsistência corrigida: usuário com acesso premium sem acesso básico"
      );
      statusValidado.podeUsarRecursosBasicos = true;
    }

    return statusValidado;
  };

  // Constantes para controle de cache
  const CACHE_DURATION_DEFAULT = 86400000; // 24 horas (em milissegundos) como fallback
  const CACHE_DURATION_TRIAL = 86400000; // 24 horas para usuários em trial
  const CACHE_DURATION_PREMIUM = 604800000; // 7 dias para usuários premium
  const CACHE_KEY = "assinatura_status_cache";

  // Função para determinar a duração adequada do cache com base no status
  const calcularDuracaoCache = (status: AssinaturaStatus): number => {
    // Primeiro verifica se o backend forneceu um tempo válido de cache
    if (status.tempoValidoSegundos && status.tempoValidoSegundos > 0) {
      return status.tempoValidoSegundos * 1000; // Converter segundos para ms
    }

    // Se não tiver tempo fornecido pelo backend, usa a lógica de fallback
    if (status.assinaturaAtiva) {
      return CACHE_DURATION_PREMIUM; // 7 dias para assinantes
    } else if (status.trialAtivo) {
      return CACHE_DURATION_TRIAL; // 1 dia para usuários em trial
    }

    return CACHE_DURATION_DEFAULT; // Fallback para 1 dia
  };

  // Função para verificar se precisamos atualizar o status
  const precisaVerificarStatus = async (
    forceFetch = false
  ): Promise<boolean> => {
    // Registra a verificação para debug
    console.log(
      `[AssinaturaContext] Verificando necessidade de atualizar status (forçar=${forceFetch})`
    );

    // Se está forçando a atualização, sempre retorna true
    if (forceFetch) {
      console.log(`[AssinaturaContext] Forçando atualização, ignorando cache`);
      return true;
    }

    try {
      // Verifica se já temos um status em cache válido
      const agora = Date.now();
      const statusCacheStr = await AsyncStorage.getItem(CACHE_KEY);

      if (!statusCacheStr) {
        console.log(
          `[AssinaturaContext] Cache não encontrado, necessário verificar`
        );
        return true; // Se não tem cache, precisa verificar
      }

      const statusCache = JSON.parse(statusCacheStr);

      // Verifica data da última verificação para logging
      const ultimaVerificacao = statusCache.timestamp
        ? new Date(statusCache.timestamp).toLocaleString()
        : "desconhecida";
      console.log(
        `[AssinaturaContext] Última verificação: ${ultimaVerificacao}`
      );

      // Verifica se o backend forneceu um timestamp para próxima verificação
      if (statusCache.proximaVerificacao) {
        const dataProximaVerificacao = new Date(
          statusCache.proximaVerificacao
        ).getTime();
        if (agora < dataProximaVerificacao) {
          const tempoRestante = Math.round(
            (dataProximaVerificacao - agora) / 1000
          );
          console.log(
            `[AssinaturaContext] Cache válido por mais ${tempoRestante} segundos (até ${new Date(dataProximaVerificacao).toLocaleString()})`
          );
          return false; // Não precisa verificar ainda
        } else {
          console.log(
            `[AssinaturaContext] Cache expirou segundo proximaVerificacao do backend`
          );
        }
      }
      // Verifica pelo expireAt local
      else if (statusCache.expireAt && statusCache.expireAt > agora) {
        const tempoRestante = Math.round((statusCache.expireAt - agora) / 1000);
        console.log(
          `[AssinaturaContext] Cache válido por mais ${tempoRestante} segundos (expiração local)`
        );
        return false; // Não precisa verificar ainda
      } else {
        console.log(`[AssinaturaContext] Cache expirou segundo expireAt local`);
      }

      // Se chegou aqui, o cache está expirado
      return true;
    } catch (e) {
      console.error(
        "[AssinaturaContext] Erro ao verificar necessidade de atualização:",
        e
      );
      return true; // Em caso de erro, melhor verificar
    }
  };

  // Função principal para verificar status da assinatura
  const verificarStatus = async (forceFetch = false) => {
    console.log(
      `[AssinaturaContext] verificarStatus chamado (forçar=${forceFetch})`
    );

    // Capturar stack trace para diagnóstico
    const stackTrace = new Error().stack;
    console.log(
      `[AssinaturaContext] Chamada de verificarStatus a partir de:`,
      stackTrace?.split("\n").slice(2, 5).join("\n")
    );

    try {
      // Primeiro verifica se é necessário fazer a consulta
      const deveBuscarStatus = await precisaVerificarStatus(forceFetch);

      if (!deveBuscarStatus) {
        // Se não precisa verificar, carrega do cache
        const statusCacheStr = await AsyncStorage.getItem(CACHE_KEY);
        if (statusCacheStr) {
          const statusCache = JSON.parse(statusCacheStr);
          const statusValidado = validarStatusAssinatura(statusCache.data);
          setStatus(statusValidado);

          console.log(
            "[AssinaturaContext] Usando status em cache (ainda válido)"
          );

          // Log detalhado para ajudar a diagnosticar o problema
          console.log(
            `[AssinaturaContext] Detalhes do status em cache:`,
            JSON.stringify({
              trialAtivo: statusValidado.trialAtivo,
              assinaturaAtiva: statusValidado.assinaturaAtiva,
              statusTipo: statusValidado.statusTipo,
              tempoCache: statusCache.expireAt
                ? Math.round((statusCache.expireAt - Date.now()) / 1000) + "s"
                : "N/A",
            })
          );

          return;
        }
      }

      setLoading(true);
      setError(null);

      // Verificar se o usuário tem token antes de consultar
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.log(
          "[AssinaturaContext] Verificação de status ignorada - usuário não está logado"
        );
        setStatus(null);
        setLoading(false);
        return;
      }

      // Agora sim, fazer a consulta na API
      console.log(
        "[AssinaturaContext] Consultando status de assinatura da API"
      );

      try {
        const statusAtualizado = await assinaturaService.verificarStatus();
        const statusValidado = validarStatusAssinatura(statusAtualizado);

        // Salvar no estado
        setStatus(statusValidado);

        // Calcula a duração apropriada do cache
        const duracaoCache = calcularDuracaoCache(statusValidado);
        const agora = Date.now();
        const expireAt = agora + duracaoCache;

        // Formata data legível para log
        const expireDate = new Date(expireAt).toLocaleString();

        // Determina a próxima verificação
        // Usa o campo fornecido pelo backend ou calcula baseado na duração
        const proximaVerificacao = statusValidado.proximaVerificacao
          ? statusValidado.proximaVerificacao
          : new Date(expireAt).toISOString();

        // Cria objeto de cache
        const cacheObject = {
          data: statusValidado,
          timestamp: agora,
          expireAt: expireAt,
          proximaVerificacao: proximaVerificacao,
        };

        // Salvar status no AsyncStorage para uso offline
        await AsyncStorage.setItem(
          "assinatura_status",
          JSON.stringify(statusValidado)
        );
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));

        console.log(
          `[AssinaturaContext] Status atualizado com sucesso (válido até ${expireDate})`
        );

        if (statusValidado.assinaturaAtiva) {
          console.log("[AssinaturaContext] Usuário tem assinatura ATIVA");
        } else if (statusValidado.trialAtivo) {
          console.log(
            `[AssinaturaContext] Usuário em período TRIAL (${statusValidado.diasRestantesTrial} dias restantes)`
          );
        } else {
          console.log(
            "[AssinaturaContext] Usuário SEM assinatura ou trial ativos"
          );
        }
      } catch (apiError: any) {
        // Erros específicos de API
        if (apiError.response?.status === 401) {
          console.warn(
            "[AssinaturaContext] Token inválido na verificação de status - limpando token"
          );
          await AsyncStorage.removeItem("auth_token");
          setStatus(null);
          throw new Error("Token inválido ou expirado");
        } else {
          throw apiError; // Re-lança outros erros
        }
      }
    } catch (err) {
      setError("Erro ao verificar status de assinatura");
      console.error("[AssinaturaContext] Erro ao verificar status:", err);

      // Tente recuperar status salvo anteriormente
      try {
        const statusSalvo = await AsyncStorage.getItem("assinatura_status");
        if (statusSalvo) {
          const statusParsed = JSON.parse(statusSalvo);
          // Mesmo para status salvo, validar consistência
          setStatus(validarStatusAssinatura(statusParsed));
          console.log(
            "[AssinaturaContext] Status recuperado do armazenamento local após erro"
          );
        }
      } catch (e) {
        console.error("[AssinaturaContext] Erro ao recuperar status salvo:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const ativarAssinatura = async (duracaoMeses: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const resposta = await assinaturaService.ativarAssinatura(duracaoMeses);

      // Atualiza o status após ativação
      if (resposta.status) {
        const statusValidado = validarStatusAssinatura(resposta.status);
        setStatus(statusValidado);

        // Salvar no storage para uso offline
        await AsyncStorage.setItem(
          "assinatura_status",
          JSON.stringify(statusValidado)
        );

        // Atualizar o cache com nova data de validade
        const agora = Date.now();
        const duracaoCache = calcularDuracaoCache(statusValidado);
        const expireAt = agora + duracaoCache;

        // Determina próxima verificação
        const proximaVerificacao = statusValidado.proximaVerificacao
          ? statusValidado.proximaVerificacao
          : new Date(expireAt).toISOString();

        // Salvar com info de cache
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: statusValidado,
            timestamp: agora,
            expireAt: expireAt,
            proximaVerificacao: proximaVerificacao,
          })
        );

        console.log(
          "[AssinaturaContext] Assinatura ativada com sucesso:",
          JSON.stringify({
            assinaturaAtiva: statusValidado.assinaturaAtiva,
            podeUsarPremium: statusValidado.podeUsarPremium,
            proximaVerificacao: proximaVerificacao,
          })
        );
      } else {
        // Se resposta não trouxer status, forçar verificação
        await verificarStatus(true);
      }

      return resposta;
    } catch (err) {
      setError("Erro ao ativar assinatura");
      console.error("[AssinaturaContext] Erro ao ativar assinatura:", err);
      Alert.alert(
        "Erro",
        "Não foi possível ativar a assinatura. Tente novamente."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelarAssinatura = async () => {
    try {
      setLoading(true);
      setError(null);

      const resposta = await assinaturaService.cancelarAssinatura();

      // Atualiza o status após cancelamento
      if (resposta.status) {
        const statusValidado = validarStatusAssinatura(resposta.status);
        setStatus(statusValidado);

        // Salvar no storage para uso offline
        await AsyncStorage.setItem(
          "assinatura_status",
          JSON.stringify(statusValidado)
        );

        // Atualizar o cache com nova data de validade
        const agora = Date.now();
        const duracaoCache = calcularDuracaoCache(statusValidado);
        const expireAt = agora + duracaoCache;

        // Determina próxima verificação
        const proximaVerificacao = statusValidado.proximaVerificacao
          ? statusValidado.proximaVerificacao
          : new Date(expireAt).toISOString();

        // Salvar com info de cache
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: statusValidado,
            timestamp: agora,
            expireAt: expireAt,
            proximaVerificacao: proximaVerificacao,
          })
        );

        console.log(
          "[AssinaturaContext] Assinatura cancelada com sucesso:",
          JSON.stringify({
            assinaturaAtiva: statusValidado.assinaturaAtiva,
            podeUsarPremium: statusValidado.podeUsarPremium,
            proximaVerificacao: proximaVerificacao,
          })
        );
      } else {
        // Se resposta não trouxer status, forçar verificação
        await verificarStatus(true);
      }

      return resposta;
    } catch (err) {
      setError("Erro ao cancelar assinatura");
      console.error("[AssinaturaContext] Erro ao cancelar assinatura:", err);
      Alert.alert(
        "Erro",
        "Não foi possível cancelar a assinatura. Tente novamente."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carrega o status salvo ao inicializar o app, mas apenas se o usuário estiver autenticado
  useEffect(() => {
    const carregarStatusSalvo = async () => {
      try {
        // Primeiro verificar se o usuário está autenticado
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          console.log(
            "[AssinaturaContext] Usuário não está autenticado. Não carregando status salvo."
          );
          // Limpar qualquer status que possa estar no estado
          setStatus(null);
          return;
        }

        console.log(
          "[AssinaturaContext] Inicializando com verificação estratégica de status"
        );

        // Verificar se precisamos atualizar o status (com base no cache)
        const deveBuscarStatus = await precisaVerificarStatus(false);

        if (deveBuscarStatus) {
          console.log(
            "[AssinaturaContext] Verificação de status necessária na inicialização"
          );
          // Buscar status novo da API, apenas na inicialização, sem polling
          await verificarStatus(false);
          return;
        }

        // Se não precisamos buscar novo status, usar o cache
        console.log(
          "[AssinaturaContext] Usando status em cache na inicialização"
        );
        const statusCacheStr = await AsyncStorage.getItem(CACHE_KEY);

        if (statusCacheStr) {
          try {
            const statusCache = JSON.parse(statusCacheStr);
            const statusValidado = validarStatusAssinatura(statusCache.data);
            setStatus(statusValidado);

            // Calcular quando o cache expira
            const expireAt = statusCache.expireAt;
            const expireDate = new Date(expireAt).toLocaleString();

            console.log(
              `[AssinaturaContext] Status carregado do cache (válido até ${expireDate}):`,
              JSON.stringify({
                trialAtivo: statusValidado.trialAtivo,
                diasRestantes: statusValidado.diasRestantesTrial,
                assinaturaAtiva: statusValidado.assinaturaAtiva,
                podeUsarPremium: statusValidado.podeUsarPremium,
              })
            );
          } catch (parseError) {
            console.error(
              "[AssinaturaContext] Erro ao parsear cache de status:",
              parseError
            );
            // Se o cache estiver corrompido, remover e buscar da API
            await AsyncStorage.removeItem(CACHE_KEY);
            await verificarStatus(true);
          }
        } else {
          // Se não houver cache, buscar da API
          console.log(
            "[AssinaturaContext] Nenhum status em cache encontrado, buscando da API"
          );
          await verificarStatus(true);
        }
      } catch (e) {
        console.error("[AssinaturaContext] Erro ao inicializar status:", e);
      }
    };

    // Carregar status inicial - única verificação automática
    carregarStatusSalvo();

    // Não configuramos nenhum intervalo para polling
    // O status será verificado apenas em momentos estratégicos:
    // 1. Na inicialização do app (acima)
    // 2. Após login (através da chamada explícita à verificarStatus)
    // 3. Em telas que exigem status atualizado (chamada manual)
    // 4. Após transações de pagamento (chamada manual)
  }, []);

  return (
    <AssinaturaContext.Provider
      value={{
        status,
        loading,
        error,
        verificarStatus,
        ativarAssinatura,
        cancelarAssinatura,
        temPermissaoPremium,
        podeUsarApp,
        estaNoPeriodoTrial,
      }}
    >
      {children}
    </AssinaturaContext.Provider>
  );
}

export function useAssinatura() {
  const context = useContext(AssinaturaContext);

  if (!context) {
    throw new Error(
      "useAssinatura deve ser usado dentro de um AssinaturaProvider"
    );
  }

  return context;
}
