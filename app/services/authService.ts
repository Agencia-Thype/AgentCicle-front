import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import Toast from "react-native-toast-message";

export async function login(
  email: string,
  senha: string
): Promise<{ access_token: string; primeiro_acesso?: boolean } | null> {
  try {
    console.log("Enviando requisição para /login com email:", email);

    // Adicionamos um manejo de erro específico para esse endpoint com erro 500
    const response = await api.post(
      "/login",
      { email, senha },
      {
        // Aumentamos o timeout para garantir que não seja muito rápido
        timeout: 10000,
      }
    );

    console.log("Resposta do servidor:", response.data);

    // Verificar se é o primeiro acesso
    const isPrimeiroAcesso = response.data.primeiro_acesso === true;

    // Se for primeiro acesso, armazenar essa informação
    if (isPrimeiroAcesso) {
      await AsyncStorage.setItem("primeiro_acesso", "true");
    }

    // Verificar se temos o token na resposta
    if (!response.data.access_token) {
      console.error("Token não encontrado na resposta:", response.data);
      Toast.show({
        type: "error",
        text1: "Erro no login",
        text2: "Token não encontrado na resposta.",
      });
      return null;
    }

    // Retornar os dados com a flag de primeiro acesso
    return {
      ...response.data,
      primeiro_acesso: isPrimeiroAcesso,
    };
  } catch (error: any) {
    // Log detalhado do erro
    console.error("Erro detalhado no login:");

    if (error.response) {
      console.error({
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Tratamento específico para erro 500 no login
      if (error.response.status === 500) {
        console.error("Erro 500 em /login:", error.response.data);

        // Verificar tipo de erro para dar feedback mais específico
        const erroDetail = error.response.data?.detail || '';
        let mensagemUsuario = "Erro interno no servidor. Tente novamente mais tarde.";
        let mensagemDetalhada = "";

        if (__DEV__) {
          // Em desenvolvimento, mostra detalhes do erro
          mensagemDetalhada = erroDetail;
        } else {
          // Em produção, mensagens mais amigáveis
          if (erroDetail.includes('database') || erroDetail.includes('connection')) {
            mensagemUsuario = "Erro de conexão com o banco de dados. Tente novamente em alguns instantes.";
          } else if (erroDetail.includes('email') || erroDetail.includes('smtp')) {
            mensagemUsuario = "Erro no serviço de email. Seu login foi processado, mas houve um problema ao enviar notificações.";
          }
        }

        Toast.show({
          type: "error",
          text1: "Erro no servidor",
          text2: mensagemDetalhada || mensagemUsuario,
        });
      } else {
        Toast.show({
          type: "error",
          text1: `Erro ${error.response.status} no login`,
          text2: error.response.data.detail || "E-mail ou senha inválidos.",
        });
      }
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "O servidor não respondeu. Verifique sua conexão.",
      });
    } else {
      console.error("Erro de configuração:", error.message);
      Toast.show({
        type: "error",
        text1: "Erro no login",
        text2: error.message,
      });
    }
    return null;
  }
}

export async function registerUser(data: {
  nome: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
}): Promise<any | null> {
  try {
    console.log("API Request:", data);
    const response = await api.post("/register", data);
    console.log("API Response:", response);

    // Aqui você tem várias opções:
    // 1. Retornar apenas response.data
    // 2. Retornar um objeto customizado
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    console.log("Erro detalhado no cadastro:", error);

    // Inspecionar o erro para diagnóstico
    if (error.response) {
      console.log("Resposta do servidor:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.log("Sem resposta do servidor:", error.request);
    } else {
      console.log("Erro na configuração:", error.message);
    }

    Toast.show({
      type: "error",
      text1: "Erro no cadastro",
      text2:
        error?.response?.data?.detail ||
        "Verifique os dados e tente novamente.",
    });

    // Retornamos um objeto que indica falha, mas não quebra o fluxo
    return {
      success: false,
      error: error?.response?.data?.detail || error.message,
    };
  }
}

export async function validarCodigo(
  email: string,
  codigo: string
): Promise<any | null> {
  try {
    const response = await api.post("/validar-email", {
      email,
      codigo,
    });
    return response.data;
  } catch (error: any) {
    console.log("Erro na validação do código:", error);
    Toast.show({
      type: "error",
      text1: "Código inválido",
      text2: "Verifique o código enviado para o seu e-mail.",
    });
    return null;
  }
}
