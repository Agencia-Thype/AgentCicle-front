import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Chaves para armazenamento no AsyncStorage
const CACHE_FASE_KEY = "@AgentCicle:fase_atual";
const CACHE_MENSAGEM_KEY = "@AgentCicle:mensagem_fase";
const CACHE_ULTIMA_SYNC_KEY = "@AgentCicle:ultima_sincronizacao";
const NOTIFICACAO_FASE_KEY = "@AgentCicle:notificacao_fase";

// Chave para armazenamento do perfil no AsyncStorage
const CACHE_PERFIL_KEY = "@AgentCicle:perfil_cache";

export async function getPerfil() {
  try {
    // Tentar obter do servidor primeiro
    const response = await api.get("/perfil");

    // Se sucesso, armazenar em cache
    if (response.status >= 200 && response.status < 300) {
      await AsyncStorage.setItem(
        CACHE_PERFIL_KEY,
        JSON.stringify({
          data: response.data,
          timestamp: new Date().toISOString(),
        })
      );
      console.log("✅ Perfil obtido com sucesso e salvo em cache");
      return response.data;
    } else {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);

    // Tentar recuperar do cache se houver erro de servidor
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_PERFIL_KEY);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        const cacheAge =
          new Date().getTime() - new Date(cache.timestamp).getTime();
        const cacheAgeHours = cacheAge / (1000 * 60 * 60);

        // Verificar se o cache é recente (menos de 24 horas)
        if (cacheAgeHours < 24) {
          console.log("🔄 Usando cache de perfil devido a erro de conexão");
          console.log(`⏱️ Cache de ${cacheAgeHours.toFixed(1)} horas atrás`);
          return cache.data;
        } else {
          console.warn("⚠️ Cache de perfil expirado (mais de 24h)");
        }
      }
    } catch (cacheError) {
      console.error("Erro ao recuperar cache de perfil:", cacheError);
    }

    // Se chegou aqui, não foi possível nem obter do servidor nem usar cache
    // Retornar um perfil mínimo para não quebrar o app
    const defaultPerfil = {
      nome: "Usuário",
      email: "",
      altura: 0,
      peso_atual: 0,
      objetivo: "",
      fase_ciclo: "Desconhecida",
      duracao_ciclo: 28,
      data_primeira_menstruacao: new Date().toISOString(),
      offline: true, // Marcar como offline para informar ao app
    };

    console.warn("⚠️ Usando perfil padrão devido a falhas");
    return defaultPerfil;
  }
}

export async function updatePerfil(dados: {
  altura: number;
  peso_atual: number;
  objetivo: string;
  data_menstruacao: string;
  duracao_ciclo: number;
}) {
  try {
    const response = await api.put("/perfil", dados);

    // Verificar se houve alteração na fase
    if (response.data.fase_atualizada) {
      console.log(`✅ Fase atualizada: ${response.data.nova_fase}`);

      // Atualizar cache local
      await atualizarCacheFase(
        response.data.nova_fase,
        response.data.mensagem_fase
      );

      // No React Native não temos Custom Events como no navegador,
      // então usaremos AsyncStorage para comunicação entre componentes
      await notificarMudancaFase(
        response.data.nova_fase,
        response.data.mensagem_fase
      );
    }

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
}

/**
 * Armazena informações da fase atual no cache local (AsyncStorage)
 */
export async function atualizarCacheFase(
  fase: string,
  mensagem: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_FASE_KEY, fase);
    await AsyncStorage.setItem(CACHE_MENSAGEM_KEY, mensagem);
    await AsyncStorage.setItem(CACHE_ULTIMA_SYNC_KEY, new Date().toISOString());

    console.log("💾 Cache de fase atualizado:", { fase, mensagem });
  } catch (error) {
    console.error("Erro ao atualizar cache de fase:", error);
  }
}

/**
 * Notifica outros componentes sobre a mudança de fase
 * No React Native usamos AsyncStorage para simular um "event bus"
 */
export async function notificarMudancaFase(
  fase: string,
  mensagem: string
): Promise<void> {
  try {
    // Criamos um objeto de notificação com timestamp para garantir que seja detectado como mudança
    const notificacao = {
      fase,
      mensagem,
      timestamp: new Date().toISOString(),
    };

    // Guardamos no AsyncStorage para que outros componentes possam verificar
    await AsyncStorage.setItem(
      NOTIFICACAO_FASE_KEY,
      JSON.stringify(notificacao)
    );

    console.log("🔔 Notificação de mudança de fase enviada:", notificacao);
  } catch (error) {
    console.error("Erro ao notificar mudança de fase:", error);
  }
}

/**
 * Sincroniza a fase do usuário com o servidor e atualiza o cache local
 */
export async function sincronizarFase(): Promise<any> {
  try {
    // Verifica quando foi a última sincronização
    const ultimaSync = await AsyncStorage.getItem(CACHE_ULTIMA_SYNC_KEY);
    const agora = new Date();

    // Se já sincronizou nas últimas 4 horas, usa o cache
    if (ultimaSync) {
      const ultimaSyncDate = new Date(ultimaSync);
      const diffHoras =
        (agora.getTime() - ultimaSyncDate.getTime()) / (1000 * 60 * 60);

      if (diffHoras < 4) {
        console.log("🕒 Usando cache de fase (última sync há menos de 4h)");
        const faseCache = await AsyncStorage.getItem(CACHE_FASE_KEY);
        const mensagemCache = await AsyncStorage.getItem(CACHE_MENSAGEM_KEY);

        if (faseCache && mensagemCache) {
          return {
            fase: faseCache,
            mensagem: mensagemCache,
            de_cache: true,
          };
        }
      }
    }

    // Busca a fase atual do servidor
    const response = await api.get("/fase-ciclo");
    const { fase, mensagem } = response.data;

    // Atualiza o cache com os dados do servidor
    await atualizarCacheFase(fase, mensagem);

    return {
      ...response.data,
      de_cache: false,
    };
  } catch (error) {
    console.error("Erro ao sincronizar fase:", error);

    // Em caso de erro de conectividade, tenta usar o cache
    try {
      const faseCache = await AsyncStorage.getItem(CACHE_FASE_KEY);
      const mensagemCache = await AsyncStorage.getItem(CACHE_MENSAGEM_KEY);

      if (faseCache && mensagemCache) {
        console.log("🔄 Usando cache de fase devido a erro de conexão");
        return {
          fase: faseCache,
          mensagem: mensagemCache,
          de_cache: true,
          erro_conexao: true,
        };
      }
    } catch (cacheError) {
      console.error(
        "Erro ao acessar cache após falha de sincronização:",
        cacheError
      );
    }

    throw error;
  }
}

/**
 * Verifica se houve notificação de mudança de fase
 * Útil para componentes que precisam reagir à mudança de fase
 */
export async function verificarMudancaFase(): Promise<{
  mudou: boolean;
  fase?: string;
  mensagem?: string;
  timestamp?: string;
}> {
  try {
    // Buscamos o estado atual da notificação
    const notificacaoString = await AsyncStorage.getItem(NOTIFICACAO_FASE_KEY);

    if (!notificacaoString) {
      return { mudou: false };
    }

    const notificacao = JSON.parse(notificacaoString);

    // Verificamos se já processamos esta notificação antes
    const ultimaProcessada = await AsyncStorage.getItem(
      "@AgentCicle:ultima_notificacao_processada"
    );

    if (ultimaProcessada === notificacao.timestamp) {
      return { mudou: false };
    }

    // Marca esta notificação como processada
    await AsyncStorage.setItem(
      "@AgentCicle:ultima_notificacao_processada",
      notificacao.timestamp
    );

    return {
      mudou: true,
      fase: notificacao.fase,
      mensagem: notificacao.mensagem,
      timestamp: notificacao.timestamp,
    };
  } catch (error) {
    console.error("Erro ao verificar mudança de fase:", error);
    return { mudou: false };
  }
}

export async function getFaseCiclo() {
  // Usamos a sincronização para garantir dados atualizados com fallback para cache
  return sincronizarFase();
}
