import { api } from "./api";

export interface AssinaturaStatus {
  trialAtivo: boolean;
  assinaturaAtiva: boolean;
  diasRestantesTrial: number;
  podeUsarRecursosBasicos: boolean;
  podeUsarPremium: boolean;
  podePontuar: boolean;
  mensagem: string;
  nome: string;
  email: string;
  dataFimTrial: string | null;
  dataFimAssinatura: string | null;
  // Campos adicionados conforme a documentação
  temAcesso?: boolean;
  verificadoEm?: string;
  proximaVerificacao?: string;
  tempoValidoSegundos?: number;
  ultimoLogin?: string;
  // Novos campos para estratégia de status
  jaTeveAssinatura?: boolean;
  statusTipo?: "trial" | "premium" | "expirado" | "trial_expirado";
}

export const assinaturaService = {
  /**
   * Verifica o status atual do usuário (trial/assinatura)
   */
  verificarStatus: async (): Promise<AssinaturaStatus> => {
    try {
      console.log(
        "[AssinaturaService] Chamando endpoint de status de assinatura..."
      );

      // Tenta usar o endpoint otimizado primeiro
      let response;
      try {
        response = await api.get("/assinatura/status-login");
        console.log("[AssinaturaService] Usando endpoint otimizado /assinatura/status-login");
      } catch (endpointError: any) {
        // Se o endpoint otimizado não existir (404), cai para o antigo
        if (endpointError.response?.status === 404) {
          console.warn("[AssinaturaService] Endpoint otimizado não disponível, usando /assinatura/status");
          response = await api.get("/assinatura/status");
        } else {
          // Se for outro erro, propaga
          throw endpointError;
        }
      }

      if (response.status !== 200) {
        throw new Error(
          `Erro ${response.status}: ${response.data?.detail || "Erro desconhecido"}`
        );
      }

      console.log(
        "[AssinaturaService] Resposta do status recebida com sucesso:",
        response.status
      );

      // Processar dados de resposta
      const statusData = response.data;

      // Adicionar timestamp atual se o backend não forneceu
      if (!statusData.verificadoEm) {
        statusData.verificadoEm = new Date().toISOString();
      }

      // Calcular próxima verificação se não fornecida pelo backend
      if (!statusData.proximaVerificacao) {
        const tempoValido =
          statusData.tempoValidoSegundos ||
          (statusData.trialAtivo ? 86400 : 604800); // 1 dia para trial, 7 dias para assinantes

        const proximaVerificacao = new Date();
        proximaVerificacao.setSeconds(
          proximaVerificacao.getSeconds() + tempoValido
        );
        statusData.proximaVerificacao = proximaVerificacao.toISOString();
      }

      // Extrair cabeçalho de cache, se disponível
      const cacheControl = response.headers?.["cache-control"];
      if (cacheControl) {
        console.log(
          "[AssinaturaService] Cabeçalho Cache-Control recebido:",
          cacheControl
        );

        // Extrair max-age do cabeçalho Cache-Control se presente
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
        if (maxAgeMatch && maxAgeMatch[1]) {
          statusData.tempoValidoSegundos = parseInt(maxAgeMatch[1], 10);
          console.log(
            `[AssinaturaService] Tempo de cache: ${statusData.tempoValidoSegundos}s`
          );
        }
      }

      // Log detalhado para diagnóstico
      console.log(
        "[AssinaturaService] Status detalhado processado:",
        JSON.stringify({
          trialAtivo: statusData.trialAtivo,
          assinaturaAtiva: statusData.assinaturaAtiva,
          diasRestantesTrial: statusData.diasRestantesTrial,
          proximaVerificacao: statusData.proximaVerificacao,
          tempoValido: statusData.tempoValidoSegundos,
        })
      );

      return statusData;
    } catch (error: any) {
      console.error(
        "[AssinaturaService] Erro ao verificar status de assinatura:",
        error.response?.status || error.message
      );

      // Propagar o erro para ser tratado pelo chamador
      throw error;
    }
  },

  /**
   * Ativa a assinatura premium para o usuário
   * @param duracaoMeses Duração da assinatura em meses
   */
  ativarAssinatura: async (duracaoMeses: number = 1) => {
    const response = await api.post("/assinatura/ativar", {
      duracao_meses: duracaoMeses,
    });
    return response.data;
  },

  /**
   * Cancela a assinatura premium do usuário
   */
  cancelarAssinatura: async () => {
    const response = await api.post("/assinatura/cancelar");
    return response.data;
  },
};

// A interface AssinaturaStatus já está sendo exportada no topo do arquivo
export default assinaturaService;
