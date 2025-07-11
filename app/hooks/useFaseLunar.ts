import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  sincronizarFase,
  verificarMudancaFase,
} from "../services/perfilService";

interface FaseLunarData {
  fase: string;
  mensagem: string;
  deCache: boolean;
  carregando: boolean;
  erro: string | null;
}

interface FaseLunarCache {
  data: {
    fase: string;
    mensagem: string;
  };
  timestamp: number;
  expireAt: number;
}

// Constante para controle de cache
const CACHE_DURATION = 60000; // 1 minuto
const POLLING_INTERVAL = 30000; // 30 segundos

/**
 * Hook para gerenciar o estado da fase lunar do ciclo em tempo real
 * Realiza sincronização automática e observa mudanças
 */
export function useFaseLunar() {
  const [faseLunar, setFaseLunar] = useState<FaseLunarData>({
    fase: "",
    mensagem: "",
    deCache: false,
    carregando: true,
    erro: null,
  });

  const lastCheckRef = useRef<number>(0);
  const ignorePollRef = useRef<boolean>(false);

  // Função para carregar dados da fase com suporte a cache
  const carregarFase = useCallback(async (forceRefresh = false) => {
    try {
      // Verifica se já temos um cache válido
      if (!forceRefresh) {
        const cacheStr = await AsyncStorage.getItem("fase_lunar_cache");
        if (cacheStr) {
          try {
            const cache: FaseLunarCache = JSON.parse(cacheStr);
            const agora = Date.now();

            if (cache && cache.expireAt > agora) {
              console.log(
                "[useFaseLunar] Usando cache da fase lunar (válido por mais",
                Math.round((cache.expireAt - agora) / 1000),
                "segundos)"
              );

              setFaseLunar({
                fase: cache.data.fase,
                mensagem: cache.data.mensagem,
                deCache: true,
                carregando: false,
                erro: null,
              });
              return;
            }
          } catch (e) {
            console.error("[useFaseLunar] Erro ao parsear cache:", e);
          }
        }
      }

      // Se não temos cache ou forçou atualização, busca da API
      setFaseLunar((prev) => ({ ...prev, carregando: true, erro: null }));

      const dados = await sincronizarFase();

      // Salvar no cache
      const agora = Date.now();
      await AsyncStorage.setItem(
        "fase_lunar_cache",
        JSON.stringify({
          data: {
            fase: dados.fase,
            mensagem: dados.mensagem,
          },
          timestamp: agora,
          expireAt: agora + CACHE_DURATION,
        })
      );

      setFaseLunar({
        fase: dados.fase,
        mensagem: dados.mensagem,
        deCache: !!dados.de_cache,
        carregando: false,
        erro: null,
      });

      // Atualiza timestamp da última verificação
      lastCheckRef.current = Date.now();
    } catch (error) {
      console.error("[useFaseLunar] Erro ao carregar fase lunar:", error);
      setFaseLunar((prev) => ({
        ...prev,
        carregando: false,
        erro: "Não foi possível carregar os dados da fase",
      }));
    }
  }, []);

  // Função para verificar notificações de mudança de fase
  const verificarNotificacoes = useCallback(async () => {
    // Evitar chamadas muito frequentes
    const agora = Date.now();
    if (agora - lastCheckRef.current < 10000 || ignorePollRef.current) {
      return;
    }

    lastCheckRef.current = agora;

    try {
      const resultado = await verificarMudancaFase();

      if (resultado.mudou && resultado.fase) {
        // Se a fase mudou, atualiza o estado e o cache
        setFaseLunar((prev) => ({
          ...prev,
          fase: resultado.fase!,
          mensagem: resultado.mensagem!,
          deCache: false,
        }));

        // Atualiza o cache também
        await AsyncStorage.setItem(
          "fase_lunar_cache",
          JSON.stringify({
            data: {
              fase: resultado.fase,
              mensagem: resultado.mensagem,
            },
            timestamp: agora,
            expireAt: agora + CACHE_DURATION,
          })
        );
      }
    } catch (error) {
      console.error(
        "[useFaseLunar] Erro ao verificar notificações de fase:",
        error
      );
    }
  }, []);

  // Verifica mudanças quando o app volta para o primeiro plano
  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Quando o app volta ao primeiro plano, ignoramos o polling por um ciclo
        // e forçamos uma verificação imediata
        ignorePollRef.current = true;
        await verificarNotificacoes();
        await carregarFase(true);

        // Reativamos o polling após atualização
        setTimeout(() => {
          ignorePollRef.current = false;
        }, POLLING_INTERVAL);
      } else if (nextAppState === "background") {
        // Quando o app vai para o background, desativamos o polling
        ignorePollRef.current = true;
      }
    },
    [verificarNotificacoes, carregarFase]
  );

  // Inicialização e configuração dos listeners
  useEffect(() => {
    // Carrega a fase inicial (do cache ou API)
    carregarFase();

    // Configura verificação periódica de notificações com intervalo maior
    const intervalId = setInterval(() => {
      if (!ignorePollRef.current) {
        verificarNotificacoes();
      }
    }, POLLING_INTERVAL);

    // Configura listener para mudanças de estado do app
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [carregarFase, verificarNotificacoes, handleAppStateChange]);

  // Expõe os dados e funções do hook
  return {
    ...faseLunar,
    recarregar: () => carregarFase(true),
  };
}
