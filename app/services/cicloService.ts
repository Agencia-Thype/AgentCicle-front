// cicloService.ts

import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Chaves para armazenamento de cache
const CACHE_FASE_CICLO_KEY = "@AgentCicle:fase_ciclo_cache";
const CACHE_FASE_DETALHES_KEY = "@AgentCicle:fase_detalhes_cache";

export async function getFaseCiclo() {
  try {
    // Tentar obter do servidor
    const response = await api.get("/fase-ciclo");

    if (response.status >= 200 && response.status < 300) {
      // Salvar em cache se obtido com sucesso
      await AsyncStorage.setItem(
        CACHE_FASE_CICLO_KEY,
        JSON.stringify({
          data: response.data,
          timestamp: new Date().toISOString(),
        })
      );
      console.log("✅ Fase do ciclo obtida com sucesso e salva em cache");
      return response.data;
    } else {
      throw new Error(`Erro ${response.status} ao obter fase do ciclo`);
    }
  } catch (error) {
    console.error("Erro ao sincronizar fase:", error);

    // Tentar recuperar do cache
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_FASE_CICLO_KEY);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        console.log("🔄 Usando cache de fase devido a erro de conexão");
        return cache.data;
      }
    } catch (cacheError) {
      console.error("Erro ao recuperar cache de fase:", cacheError);
    }

    // Retornar uma fase padrão se não houver cache
    return {
      fase: "Desconhecida",
      dias_na_fase: 0,
      duracao_fase: 0,
      offline: true,
    };
  }
}

export async function getDetalhesFaseAtual() {
  try {
    // Tentar obter do servidor
    const response = await api.get("/fase-atual/detalhes");

    if (response.status >= 200 && response.status < 300) {
      // Salvar em cache se obtido com sucesso
      await AsyncStorage.setItem(
        CACHE_FASE_DETALHES_KEY,
        JSON.stringify({
          data: response.data,
          timestamp: new Date().toISOString(),
        })
      );
      console.log("✅ Detalhes da fase obtidos com sucesso e salvos em cache");
      return response.data;
    } else {
      throw new Error(`Erro ${response.status} ao obter detalhes da fase`);
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes da fase:", error);

    // Tentar recuperar do cache
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_FASE_DETALHES_KEY);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        console.log(
          "🔄 Usando cache de detalhes da fase devido a erro de conexão"
        );
        return cache.data;
      }
    } catch (cacheError) {
      console.error("Erro ao recuperar cache de detalhes da fase:", cacheError);
    }

    // Retornar dados padrão se não houver cache
    return {
      fase: "Desconhecida",
      descricao: "Informações não disponíveis no momento.",
      recomendacoes: {
        alimentacao: "Mantenha-se hidratada.",
        exercicio: "Faça exercícios leves conforme se sentir confortável.",
        bem_estar: "Pratique técnicas de relaxamento.",
      },
      offline: true,
    };
  }
}

export async function registrarMenstruacao(data_inicio: string) {
  const response = await api.post("/registrar-menstruacao", { data_inicio });
  return response.data;
}
