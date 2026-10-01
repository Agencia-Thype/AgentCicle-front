export type FaseCiclo = "menstruacao" | "folicular" | "ovulatoria" | "lutea" | null;

/** YYYY-MM-DD (com ou sem horário) -> Date à meia-noite local. `new Date(iso)`
 * leria como UTC e, no Brasil, cairia no dia anterior. */
export function dataLocalDeISO(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Dias corridos entre duas datas, ignorando o horário. */
function diasEntre(de: Date, ate: Date): number {
  const a = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const b = new Date(ate.getFullYear(), ate.getMonth(), ate.getDate());
  // round: um dia com mudança de horário de verão tem 23h ou 25h.
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Durações fora de 21-35 dias valem 28, como no backend. */
export function duracaoCicloValida(duracao?: number | null): number {
  return duracao && duracao >= 21 && duracao <= 35 ? duracao : 28;
}

/**
 * Onde a data alvo cai no ciclo: o dia 1 é o primeiro dia da menstruação e o
 * ciclo recomeça a cada `duracaoCiclo` dias.
 */
export function posicaoNoCiclo(
  dataAlvo: Date,
  dataMenstruacao: Date,
  duracaoCiclo: number = 28
): { dia: number; diasAteProximaMenstruacao: number } {
  const passados = diasEntre(dataMenstruacao, dataAlvo);
  const noCiclo = ((passados % duracaoCiclo) + duracaoCiclo) % duracaoCiclo;
  return { dia: noCiclo + 1, diasAteProximaMenstruacao: duracaoCiclo - noCiclo };
}

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
  const diasDesdeInicio = diasEntre(inicio, alvo);
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
