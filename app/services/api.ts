import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { PremiumModalController } from "../utils/premiumModalController";
import { COBRANCA_ATIVA } from "../config/monetizacao";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

// Definir a URL base da API com base no ambiente e plataforma
const getBaseURL = () => {
  // Verifica se existe variável de ambiente configurada
  const customUrl = process.env.EXPO_PUBLIC_API_URL;
  if (customUrl) {
    return customUrl;
  }

  // Esta função retorna a URL mais apropriada com base na plataforma
  if (Platform.OS === "android") {
    // Para emuladores Android, a URL correta geralmente é 10.0.2.2 (equivalente a localhost na máquina host)
    return "http://10.0.2.2:8000";
  } else if (Platform.OS === "ios") {
    // No iOS Simulator, localhost funciona para acessar a máquina host
    return "http://localhost:8000";
  }

  // Para dispositivos físicos - tenta variável de ambiente ou localhost como fallback
  return "http://localhost:8000";
};

// Criar instância da API
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 segundos de timeout (aumentado de 10s)
  // Adicionar headers comuns
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Configuração para melhor tratamento de erros
  validateStatus: function (status) {
    // Aceitar qualquer status para tratar erros de forma personalizada
    return true;
  },
});

// Lista de endpoints que podem ser acessados sem autenticação
const endpointsSemAuth = ["/ping"];

// Log de todas as requisições (para debug)
api.interceptors.request.use((config) => {
  console.log(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Interceptor para tratar respostas e erros comuns
api.interceptors.response.use(
  (response) => {
    // Status 2xx - Sucesso
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    // Status não 2xx - Tratamos como erro
    console.log(`Resposta ${response.status} para ${response.config.url}`);

    // Erros especiais
    if (response.status === 500) {
      console.error(`Erro 500 em ${response.config.url}: ${response.data}`);

      // Registrar detalhes adicionais para diagnóstico
      const requestInfo = {
        url: response.config.url,
        method: response.config.method,
        timestamp: new Date().toISOString(),
        errorDetail: response.data,
      };

      // Armazenar detalhes do erro para diagnóstico
      try {
        // Obter erros anteriores
        AsyncStorage.getItem("@AppErrors:500").then((existingErrors) => {
          let errors = [];
          if (existingErrors) {
            errors = JSON.parse(existingErrors);
            // Manter apenas os 10 erros mais recentes
            if (errors.length >= 10) {
              errors = errors.slice(-9);
            }
          }
          // Adicionar o erro atual
          errors.push(requestInfo);
          // Salvar de volta
          AsyncStorage.setItem("@AppErrors:500", JSON.stringify(errors));
        });
      } catch (e) {
        console.error("Erro ao salvar log de erro:", e);
      }
    }

    // Tratamento específico para erros de autenticação
    if (response.status === 401) {
      console.error(`Erro 401 em ${response.config.url}:`, response.data);
      console.warn("Erro de autenticação - token pode ter expirado");

      // Se for erro de autenticação no endpoint de status de assinatura,
      // isso pode ser normal durante a inicialização do app - não tratar como erro crítico
      if (response.config.url?.includes("/assinatura/status")) {
        console.log(
          "Ignorando erro 401 em verificação de status - usuário pode não estar logado"
        );
      } else if (!auth.currentUser) {
        // "Not authenticated" quer dizer que NÓS não mandamos o header, não que
        // o token foi rejeitado. Deslogar aqui não conserta nada e cria um
        // ciclo: sem usuário, toda requisição seguinte sai sem token e volta
        // 401, deslogando de novo.
        console.warn(
          "Requisição protegida enviada sem usuário autenticado:",
          response.config.url
        );
      } else {
        // Havia usuário e mesmo assim o backend recusou: o ID token foi de fato
        // rejeitado. Aí sim deslogar para forçar novo login.
        console.warn("Token do Firebase rejeitado pelo backend - deslogando");
        signOut(auth).catch((err) => {
          console.error("Erro ao deslogar:", err);
        });
      }
    }

    // Interceptar erro 403 (Forbidden) - pode ser relacionado à assinatura premium.
    // No modo gratuito o backend não bloqueia por assinatura, e a UI não pode
    // abrir modal de upgrade em hipótese alguma.
    if (COBRANCA_ATIVA && response.status === 403) {
      console.warn(`Acesso negado (403) para ${response.config.url}`);

      // Verifica primeiro se o erro 403 é relacionado à assinatura e não à autenticação
      const responseData = response.data || {};
      const message =
        responseData.detail || "Este recurso requer assinatura premium.";

      // Só exibe o modal se o usuário estiver logado e for um erro de assinatura
      const isAssinaturaError =
        message.includes("premium") ||
        message.includes("assina") ||
        message.includes("trial") ||
        message.includes("restrito") ||
        message.includes("plano");

      if (isAssinaturaError) {
        // Só mostra o modal se o usuário estiver autenticado
        if (auth.currentUser) {
          PremiumModalController.showUpgradeModal(message);
        } else {
          console.log("Usuário não autenticado, não exibindo modal premium");
        }
      }
    }

    // Propagamos o erro para ser tratado localmente
    return Promise.reject({
      response: response,
      message: `Erro ${response.status}: ${response.statusText}`,
    });
  },
  (error) => {
    // Requisição abortada de propósito (AbortController). Não é falha de rede e
    // não deve poluir o console como erro.
    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      console.warn("Requisição cancelada:", error.config?.url);
    } else if (error.code === "ECONNABORTED") {
      console.warn("API indisponível (timeout):", error.config?.url);
    } else if (!error.response) {
      // Backend local desligado ou temporariamente inacessível. A chamada ainda
      // é rejeitada para a tela tratar o fallback, mas não deve abrir o LogBox.
      console.warn("API indisponível:", error.config?.url || error.message);
    }

    return Promise.reject(error);
  }
);

// Interceptor para incluir o token do Firebase (renovado automaticamente pelo SDK)
api.interceptors.request.use(
  async (config) => {
    try {
      if (!endpointsSemAuth.some((endpoint) => config.url?.includes(endpoint))) {
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(
            "Nenhum usuário autenticado para endpoint protegido:",
            config.url
          );
        }
      }
      return config;
    } catch (error) {
      console.error("Erro no interceptor:", error);
      return config;
    }
  },
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Rotas que dependem do ciclo recusam contas sem data da menstruação salva
// (400 ou 404, conforme a rota). É o estado de toda conta nova até o Perfil
// ser preenchido - não deve ser tratado nem logado como falha.
const DETALHES_PERFIL_INCOMPLETO = [
  "sem dados completos do ciclo",
  "sem menstruação registrada",
  "menstruação não cadastrada",
];

export function ehPerfilIncompleto(error: any): boolean {
  const detalhe = error?.response?.data?.detail;
  return (
    typeof detalhe === "string" &&
    DETALHES_PERFIL_INCOMPLETO.some((trecho) => detalhe.includes(trecho))
  );
}
