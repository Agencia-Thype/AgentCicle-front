// Alterar quando o protocolo terapêutico do backend mudar. Além de evitar uma
// resposta em cache, faz o Fast Refresh buscar os novos tempos sem reiniciar o app.
export const REVISAO_PROTOCOLO_KEGEL = 4;

/** Rota do treino de Kegel de um nível; a Home pré-carrega a do nível inicial. */
export const rotaTreinoKegel = (nivel: string) =>
  `/kegel/treino-dia?nivel=${nivel}&revisao=${REVISAO_PROTOCOLO_KEGEL}`;
