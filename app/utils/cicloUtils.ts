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

/** Duração ausente ou absurda (fora de 10-60 dias) vale 28, como no backend. */
export function duracaoCicloValida(duracao?: number | null): number {
  return duracao && duracao >= 10 && duracao <= 60 ? duracao : 28;
}

export const DURACAO_MENSTRUACAO_PADRAO = 5;
const DURACAO_FASE_LUTEA = 14;

/**
 * Limites das fases, em dias do ciclo contados a partir de 1. Mesma regra do
 * backend (dividir_ciclo_em_fases): a ovulação é estimada 14 dias antes da
 * próxima menstruação, então quem varia com a duração é a fase folicular.
 * A janela fértil vai de 5 dias antes da ovulação até 1 dia depois.
 */
export function dividirCiclo(
  duracaoCiclo: number = 28,
  duracaoMenstruacao: number = DURACAO_MENSTRUACAO_PADRAO
) {
  const duracao = duracaoCicloValida(duracaoCiclo);
  const menstruacaoFim = Math.max(1, Math.min(duracaoMenstruacao, duracao - 2));
  const ovulacao = Math.max(duracao - DURACAO_FASE_LUTEA, menstruacaoFim + 1);
  return {
    duracao,
    menstruacaoFim,
    ovulacao,
    janelaFertilInicio: Math.max(1, ovulacao - 5),
    janelaFertilFim: Math.min(duracao, ovulacao + 1),
  };
}

/** A data cai na janela fértil estimada do ciclo? */
export function ehDiaFertil(
  dataAlvo: Date,
  dataMenstruacao: Date,
  duracaoCiclo: number = 28,
  duracaoMenstruacao: number = DURACAO_MENSTRUACAO_PADRAO
): boolean {
  const ciclo = dividirCiclo(duracaoCiclo, duracaoMenstruacao);
  const { dia } = posicaoNoCiclo(dataAlvo, dataMenstruacao, ciclo.duracao);
  return dia >= ciclo.janelaFertilInicio && dia <= ciclo.janelaFertilFim;
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
  duracaoCiclo: number = 28,
  duracaoMenstruacao: number = DURACAO_MENSTRUACAO_PADRAO
): FaseCiclo {
  if (!dataAlvo || !dataMenstruacao || isNaN(duracaoCiclo)) return null;

  const ciclo = dividirCiclo(duracaoCiclo, duracaoMenstruacao);
  const { dia } = posicaoNoCiclo(dataAlvo, dataMenstruacao, ciclo.duracao);

  if (dia <= ciclo.menstruacaoFim) return "menstruacao";
  if (dia < ciclo.ovulacao) return "folicular";
  if (dia === ciclo.ovulacao) return "ovulatoria";
  return "lutea";
}
