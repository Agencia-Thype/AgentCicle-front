import { api } from "./api";

/**
 * Verifica se o servidor está online e respondendo
 * @returns {Promise<boolean>} true se o servidor está online, false caso contrário
 */
export const verificarServidorOnline = async (): Promise<boolean> => {
  try {
    // Vamos testar a conexão usando fetch diretamente, que é mais simples
    // em vez de usar a instância API que pode ter configurações que complicam o teste
    const baseUrl = api.defaults.baseURL;
    console.log(`Testando conexão com: ${baseUrl}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Tentar apenas fazer uma requisição simples para verificar se o servidor responde
    // Usamos GET porque é mais compatível do que OPTIONS em muitos servidores
    const resposta = await fetch(
      `${baseUrl}/health` || `${baseUrl}/status` || `${baseUrl}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    // Se chegamos aqui, o servidor respondeu de alguma forma
    console.log(`Servidor respondeu com status ${resposta.status}`);
    return true;
  } catch (erro: any) {
    // Análise do erro para log
    if (erro.name === "AbortError") {
      console.log("Timeout ao tentar conectar ao servidor");
    } else {
      console.log(
        "Erro ao verificar servidor:",
        erro.message || "Erro desconhecido"
      );
    }

    // Última tentativa - tentar um endpoint diferente
    try {
      console.log("Tentando conexão alternativa...");
      const baseUrl = api.defaults.baseURL;
      const resposta = await fetch(`${baseUrl}/login`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      console.log(
        `Servidor respondeu na segunda tentativa: ${resposta.status}`
      );
      return true;
    } catch (e) {
      console.log("Servidor não está respondendo em nenhum endpoint");
      return false;
    }
  }
};

/**
 * Verifica se há conexão com a internet
 * @returns {Promise<boolean>} true se há conexão, false caso contrário
 */
export const verificarConexaoInternet = async (): Promise<boolean> => {
  try {
    // Cria um controlador de abort para implementar um timeout manual
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Tenta acessar um serviço externo confiável
    const resposta = await fetch("https://www.google.com", {
      method: "HEAD",
      signal: controller.signal,
    });

    // Limpa o timeout para evitar memory leaks
    clearTimeout(timeoutId);

    return resposta.ok;
  } catch (erro) {
    console.error("Erro ao verificar conexão com internet:", erro);
    return false;
  }
};

/**
 * Faz verificações completas de conectividade
 * @returns {Promise<{internet: boolean, servidor: boolean}>} Status da conexão
 */
export const verificarConectividade = async (): Promise<{
  internet: boolean;
  servidor: boolean;
}> => {
  const internet = await verificarConexaoInternet();
  const servidor = await verificarServidorOnline();

  return {
    internet,
    servidor,
  };
};
