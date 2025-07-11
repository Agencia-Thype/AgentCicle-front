import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { PremiumModalController } from "../utils/premiumModalController";

// Função para decodificar base64 em React Native
const base64ToUtf8 = (base64: string): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = "";
  let i = 0;

  while (i < base64.length) {
    const c0 = chars.indexOf(base64.charAt(i++));
    const c1 = chars.indexOf(base64.charAt(i++));
    const c2 = chars.indexOf(base64.charAt(i++));
    const c3 = chars.indexOf(base64.charAt(i++));

    const b0 = ((c0 & 0x3f) << 2) | ((c1 & 0x30) >> 4);
    const b1 = ((c1 & 0x0f) << 4) | ((c2 & 0x3c) >> 2);
    const b2 = ((c2 & 0x03) << 6) | (c3 & 0x3f);

    if (c2 === 64) {
      str += String.fromCharCode(b0);
    } else if (c3 === 64) {
      str += String.fromCharCode(b0, b1);
    } else {
      str += String.fromCharCode(b0, b1, b2);
    }
  }

  return str;
};

// Definir a URL base da API com base no ambiente e plataforma
const getBaseURL = () => {
  // Esta função agora retorna a URL mais apropriada com base na plataforma
  if (Platform.OS === "android") {
    // Para emuladores Android, a URL correta geralmente é 10.0.2.2 (equivalente a localhost na máquina host)
    return "http://10.0.2.2:8000";
  } else if (Platform.OS === "ios") {
    // No iOS Simulator, localhost funciona para acessar a máquina host
    return "http://localhost:8000";
  }

  // Para dispositivos físicos (use o IP real da sua máquina)
  // Você pode substituir este IP pelo IP real da sua máquina
  return "http://192.168.0.144:8000";
};

// Criar instância da API
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
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
const endpointsSemAuth = ["/login", "/register", "/validar-email", "/ping"];

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
      } else {
        // Para outros endpoints, o erro 401 pode indicar que precisamos fazer logout
        // Verificar se é um problema de token inválido
        const errorDetail = response.data?.detail || "";
        if (
          errorDetail.includes("Token inválido") ||
          errorDetail.includes("expirado") ||
          errorDetail.includes("assinatura")
        ) {
          console.warn(
            "Token JWT inválido ou expirado - Limpando armazenamento"
          );

          // Remover apenas o token sem fazer logout completo
          // para que o usuário possa fazer login novamente
          AsyncStorage.removeItem("auth_token").catch((err) => {
            console.error("Erro ao limpar token:", err);
          });
        }
      }
    }

    // Interceptar erro 403 (Forbidden) - pode ser relacionado à assinatura premium
    if (response.status === 403) {
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
        // Verificar se o usuário está logado antes de mostrar o modal
        AsyncStorage.getItem("auth_token")
          .then((token) => {
            if (token) {
              // Só mostra o modal se o usuário estiver autenticado
              PremiumModalController.showUpgradeModal(message);
            } else {
              // Se não estiver autenticado, apenas loga o erro
              console.log(
                "Usuário não autenticado, não exibindo modal premium"
              );
            }
          })
          .catch((error) => {
            console.error("Erro ao verificar token:", error);
          });
      }
    }

    // Propagamos o erro para ser tratado localmente
    return Promise.reject({
      response: response,
      message: `Erro ${response.status}: ${response.statusText}`,
    });
  },
  (error) => {
    // Erro de rede ou timeout
    if (error.code === "ECONNABORTED") {
      console.error("Timeout na requisição:", error.config.url);
    } else if (!error.response) {
      console.error("Erro de rede:", error.message);
    }

    return Promise.reject(error);
  }
);

// Função para verificar se o token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    if (!token) return true;

    // Obter a parte do payload do JWT (segunda parte)
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;

    // Decodificar o base64 usando nossa função compatível com React Native
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = base64ToUtf8(base64);
    const payload = JSON.parse(decodedPayload);

    // Verificar se o token possui uma data de expiração
    if (!payload.exp) return true;

    // Verificar se o token está expirado (exp é em segundos)
    const expiry = payload.exp * 1000; // converter para milissegundos
    return Date.now() >= expiry;
  } catch (error) {
    console.error("Erro ao verificar expiração do token:", error);
    return true; // Em caso de erro, considerar como expirado por segurança
  }
};

// Interceptor para incluir o token
api.interceptors.request.use(
  async (config) => {
    try {
      // Se for um endpoint que exige autenticação
      if (
        !endpointsSemAuth.some((endpoint) => config.url?.includes(endpoint))
      ) {
        const token = await AsyncStorage.getItem("auth_token");
        console.log("Interceptor - Token:", token ? "Existe" : "Não existe");

        // Se não tiver token ou o token estiver expirado e não for um endpoint público
        if (!token || isTokenExpired(token)) {
          console.warn(
            "Token inválido ou expirado para endpoint protegido:",
            config.url
          );

          // Se o token existir mas estiver expirado, removê-lo
          if (token && isTokenExpired(token)) {
            console.warn("Removendo token expirado do armazenamento");
            await AsyncStorage.removeItem("auth_token");
          }

          // Opção 1: Cancela a requisição
          const controller = new AbortController();
          controller.abort();
          return { ...config, signal: controller.signal };
        } else {
          // Imprimir mais detalhes sobre o token para ajudar no diagnóstico
          const tokenFirstPart = token.substring(0, 15);
          const tokenLastPart = token.substring(token.length - 15);
          console.log(
            `Token válido incluído na requisição: ${tokenFirstPart}...${tokenLastPart}`
          );
          console.log(`URL requisitada: ${config.url}`);

          // Garantir que o formato do token seja exatamente como o backend espera
          config.headers.Authorization = `Bearer ${token.trim()}`;

          // Verificar se o header foi definido corretamente
          console.log(
            "Authorization header:",
            config.headers.Authorization.substring(0, 25) + "..."
          );
        }
      } else {
        console.log("Endpoint público, não precisa de token");
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

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    console.log(`Resposta ${response.status} para ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `Erro ${error.response.status} em ${error.config?.url}:`,
        error.response.data
      );

      // Tratar erro de autenticação
      if (error.response.status === 401) {
        console.warn("Erro de autenticação - token pode ter expirado");
        // Aqui você pode adicionar lógica para redirecionar para a tela de login
      }
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
    } else {
      console.error("Erro de configuração:", error.message);
    }
    return Promise.reject(error);
  }
);
