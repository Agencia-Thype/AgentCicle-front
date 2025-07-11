// iaService.ts

import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFromCache, saveToCache } from "../utils/cacheHelper";
import {
  shouldWaitBeforeRetry,
  registerFailure,
  registerSuccess,
  getBackoffInfo,
} from "../utils/errorBackoff";

// Chaves para armazenamento de cache
const CACHE_MENSAGEM_BALAO_KEY = "@AgentCicle:ia_mensagem_balao";
const CACHE_MENSAGEM_BOAS_VINDAS_KEY = "@AgentCicle:ia_mensagem_boas_vindas";
const CACHE_TIMEOUT_IA = 10000; // 10 segundos para timeout de requisições IA
const CACHE_DURATION_IA = 3600000; // 1 hora de cache para mensagens da IA

// Chaves para identificar endpoints no sistema de backoff
const ENDPOINT_MENSAGEM_BALAO = "ia_mensagem_balao";
const ENDPOINT_MENSAGEM_BOAS_VINDAS = "ia_mensagem_boas_vindas";
const ENDPOINT_CONVERSA = "ia_conversa";

// Interface para o cache de mensagem da IA
interface IACacheData {
  mensagem: string;
  timestamp: string;
}

/**
 * Busca uma mensagem do serviço de IA
 * @param tipo Tipo da mensagem (balao, boas_vindas, etc)
 * @returns A mensagem da IA ou uma mensagem padrão em caso de erro
 */
export async function getMensagemIA(tipo: string): Promise<string> {
  try {
    // Adicionar logs mais descritivos
    console.log(
      `[IAService] Iniciando busca de mensagem de IA do tipo "${tipo}"`
    );

    const cacheKey =
      tipo === "balao"
        ? CACHE_MENSAGEM_BALAO_KEY
        : CACHE_MENSAGEM_BOAS_VINDAS_KEY;

    const endpointKey =
      tipo === "balao"
        ? ENDPOINT_MENSAGEM_BALAO
        : ENDPOINT_MENSAGEM_BOAS_VINDAS;

    // Primeiro, tente buscar do cache (independente de backoff)
    // Isso garante resposta rápida e evita múltiplas tentativas de carga
    try {
      const cachedData = await getFromCache<IACacheData>(cacheKey);
      if (cachedData && cachedData.mensagem) {
        console.log(`[IAService] Usando cache para mensagem de IA (${tipo})`);

        // Verificar se estamos em backoff
        const backoffInfo = getBackoffInfo(endpointKey);
        if (backoffInfo.inBackoff) {
          console.log(
            `[IAService] Em backoff para ${tipo} (${backoffInfo.remainingTimeMs}ms restantes). Retornando apenas cache.`
          );
          return cachedData.mensagem;
        }

        // Se não estamos em backoff, iniciar atualização em background
        // mas retornar o cache imediatamente para melhorar UX
        setTimeout(() => {
          try {
            // Chamada sem await para não bloquear a execução
            console.log(
              `[IAService] Iniciando atualização de cache em background para ${tipo}`
            );
            _atualizarCacheMensagem(tipo, cacheKey, endpointKey);
          } catch (e) {
            // Silenciar erros na atualização em background
          }
        }, 100);

        return cachedData.mensagem;
      }
    } catch (cacheMissError) {
      console.log(`[IAService] Cache miss para mensagem de IA (${tipo})`);
      // Continuar com a requisição normal
    }

    // Verificar se estamos em backoff para este endpoint
    const backoffInfo = getBackoffInfo(endpointKey);
    if (backoffInfo.inBackoff) {
      console.log(
        `[IAService] Em backoff para ${tipo} (${backoffInfo.remainingTimeMs}ms restantes). Usando mensagem padrão.`
      );
      return getMensagemPadrao(tipo);
    }

    // Se não estamos em backoff e o cache falhou, tentar obter dados atualizados
    return await _atualizarCacheMensagem(tipo, cacheKey, endpointKey);
  } catch (error) {
    console.error(
      `[IAService] Erro fatal ao buscar mensagem de IA (${tipo}):`,
      error
    );
    return getMensagemPadrao(tipo);
  }
}

/**
 * Função interna para atualizar o cache de mensagem da IA
 */
async function _atualizarCacheMensagem(
  tipo: string,
  cacheKey: string,
  endpointKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CACHE_TIMEOUT_IA);

  try {
    console.log(`[IAService] Buscando mensagem de IA (${tipo}) da API`);
    const response = await api.get(
      `/ia/mensagem-entrada?tipo=${tipo}&noCache=${Date.now()}`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Registrar sucesso no sistema de backoff
    registerSuccess(endpointKey);

    // Salvar em cache para uso futuro
    if (response.status >= 200 && response.status < 300) {
      const mensagem =
        response.data.mensagem || response.data.resposta || response.data;

      if (!mensagem || typeof mensagem !== "string") {
        console.warn(
          `[IAService] API retornou mensagem inválida: ${JSON.stringify(response.data)}`
        );
        throw new Error("Formato de mensagem inválido");
      }

      const cacheData: IACacheData = {
        mensagem,
        timestamp: new Date().toISOString(),
      };

      await saveToCache<IACacheData>(cacheKey, cacheData, CACHE_DURATION_IA);

      console.log(
        `[IAService] Mensagem de IA (${tipo}) obtida e salva em cache`
      );
      return mensagem;
    }

    throw new Error(
      `Resposta da API sem dados válidos (status ${response.status})`
    );
  } catch (reqError: any) {
    clearTimeout(timeoutId);

    // Registrar falha e calcular próximo tempo de espera
    const nextWaitTime = registerFailure(endpointKey);

    const statusCode = reqError?.response?.status || "desconhecido";
    console.warn(
      `[IAService] Erro ${statusCode} ao buscar mensagem de IA (${tipo}). Próxima tentativa em ${nextWaitTime}ms`
    );

    // Tentar mostrar detalhes úteis do erro para diagnóstico
    if (reqError?.response?.data) {
      console.warn(
        `[IAService] Detalhes do erro:`,
        JSON.stringify(reqError.response.data)
      );
    }

    // Buscar do cache se a requisição falhar
    try {
      const cachedData = await getFromCache<IACacheData>(cacheKey);
      if (cachedData) {
        console.log(
          `[IAService] Usando cache para mensagem de IA (${tipo}) após falha na API`
        );
        return cachedData.mensagem;
      }
    } catch (cacheError) {
      console.error("[IAService] Erro ao acessar cache de IA:", cacheError);
    }

    return getMensagemPadrao(tipo);
  }
}

/**
 * Retorna uma mensagem padrão para quando a IA não estiver disponível
 * Usa um conjunto de mensagens para dar variedade
 */
function getMensagemPadrao(tipo: string): string {
  // Mensagens padrão variadas para diferentes tipos
  const mensagensPadraoBala: string[] = [
    "Como posso ajudar você com seu ciclo hoje, {nome}?",
    "Olá {nome}! Estou aqui para acompanhar seu ciclo menstrual.",
    "Que bom te ver, {nome}! Como está se sentindo hoje?",
    "Lembre-se de registrar seus sintomas hoje, {nome}!",
    "Estou aqui para te ajudar a entender seu ciclo, {nome}.",
    "Está mantendo seus registros em dia, {nome}?",
    "Vamos acompanhar seu ciclo juntas, {nome}!",
  ];

  const mensagensPadraoBoasVindas: string[] = [
    "Olá! Sou a Lunia, sua assistente para acompanhar seu ciclo menstrual.",
    "Bem-vinda de volta! Como posso te ajudar hoje?",
    "Que bom te ver! Estou aqui para ajudar com seu ciclo menstrual.",
    "Olá! Sou a Lunia, sua parceira para entender melhor seu ciclo.",
    "Bem-vinda! Vamos manter seu acompanhamento em dia?",
  ];

  // Selecionar aleatoriamente uma mensagem do array apropriado
  if (tipo === "balao") {
    const index = Math.floor(Math.random() * mensagensPadraoBala.length);
    return mensagensPadraoBala[index];
  } else if (tipo === "boas_vindas") {
    const index = Math.floor(Math.random() * mensagensPadraoBoasVindas.length);
    return mensagensPadraoBoasVindas[index];
  }

  return "Estou aqui para ajudar você.";
}

/**
 * Envia uma mensagem para a IA e retorna a resposta
 * @param mensagem A mensagem do usuário
 * @returns A resposta da IA
 */
export async function enviarMensagemIA(mensagem: string): Promise<string> {
  try {
    // Verificar se estamos em backoff para este endpoint
    const backoffInfo = getBackoffInfo(ENDPOINT_CONVERSA);
    if (backoffInfo.inBackoff) {
      console.log(
        `[IAService] Em backoff para conversa (${backoffInfo.remainingTimeMs}ms restantes).`
      );
      return `Estou com dificuldades técnicas no momento. Por favor, tente novamente em ${Math.ceil(backoffInfo.remainingTimeMs / 1000)} segundos.`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    const response = await api.post(
      "/ia/conversa",
      { mensagem },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    // Registrar sucesso no sistema de backoff
    registerSuccess(ENDPOINT_CONVERSA);

    if (response.status >= 200 && response.status < 300) {
      return (
        response.data.resposta ||
        "Desculpe, não consegui processar sua mensagem."
      );
    } else {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error("[IAService] Erro ao conversar com IA:", error);

    // Registrar falha e calcular próximo tempo de espera
    const nextWaitTime = registerFailure(ENDPOINT_CONVERSA);
    console.log(
      `[IAService] Falha registrada para conversa. Próxima tentativa em ${nextWaitTime}ms`
    );

    if (error instanceof Error && error.message.includes("abort")) {
      return "Desculpe, estou demorando para responder. Poderia reformular sua pergunta?";
    }

    return "Estou com dificuldades para processar sua pergunta neste momento. Por favor, tente novamente mais tarde.";
  }
}
