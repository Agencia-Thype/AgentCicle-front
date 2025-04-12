export type FaseCiclo = "menstruacao" | "folicular" | "ovulatoria" | "lutea" | null;

/**
 * Retorna a fase do ciclo menstrual com base em uma data alvo,
 * a data da última menstruação e a duração média do ciclo.
 */
export function getFasePorData(
  dataAlvo: Date,
  dataMenstruacao: Date,
  duracaoCiclo: number = 28
): FaseCiclo {
  if (!dataAlvo || !dataMenstruacao || isNaN(duracaoCiclo)) return null;

  // Normaliza as datas para ignorar horário
  const normalizar = (data: Date) => new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const alvo = normalizar(dataAlvo);
  const inicio = normalizar(dataMenstruacao);

  // Dias desde o início do ciclo
  const diasDesdeInicio = Math.floor((alvo.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasDoCiclo = ((diasDesdeInicio % duracaoCiclo) + duracaoCiclo) % duracaoCiclo;

  // Distribuição proporcional das fases
  const diasMenstruacao = Math.round(duracaoCiclo * 0.18); // ~5 dias
  const diasFolicular = Math.round(duracaoCiclo * 0.32);   // ~9 dias
  const diasOvulatoria = Math.round(duracaoCiclo * 0.14);  // ~4 dias
  const diasLutea = duracaoCiclo - (diasMenstruacao + diasFolicular + diasOvulatoria);

  const fases = [
    { nome: "menstruacao", duracao: diasMenstruacao },
    { nome: "folicular", duracao: diasFolicular },
    { nome: "ovulatoria", duracao: diasOvulatoria },
    { nome: "lutea", duracao: diasLutea },
  ];

  // Determina em qual fase está o dia atual
  let acumulado = 0;
  for (const fase of fases) {
    if (diasDoCiclo >= acumulado && diasDoCiclo < acumulado + fase.duracao) {
      return fase.nome as FaseCiclo;
    }
    acumulado += fase.duracao;
  }

  return null;
}
