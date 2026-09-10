/**
 * Tipos do motor de execução de Kegel.
 *
 * O protocolo terapêutico (níveis, exercícios, séries, repetições e durações)
 * vive no backend, em app/data/kegel_exercises.py. Aqui só existe o que o
 * motor precisa para executar o que o servidor manda — nada de tempos
 * duplicados no cliente.
 */

// ---------------------------------------------------------------------------
// Formato vindo da API (GET /kegel/treino-dia)
// ---------------------------------------------------------------------------

export interface FaseKegel {
  /** "contracao" | "contracao_forte" | "relaxamento" */
  tipo: string;
  /** Aceita frações: o protocolo usa 1.5s em vários blocos. */
  duracao_segundos: number;
  instrucao: string;
}

export interface SerieKegel {
  repeticoes: number;
  fases: FaseKegel[];
}

export interface ExercicioKegel {
  id: string;
  nome: string;
  nivel: string;
  objetivo: string;
  /** Quantidade de séries (o exercício inteiro se repete N vezes). */
  series: number;
  descanso_segundos: number;
  /** Blocos: cada um com suas repetições e fases. */
  instrucoes: SerieKegel[];
}

// ---------------------------------------------------------------------------
// Estados do motor
// ---------------------------------------------------------------------------

export type EstadoKegel =
  | "prepare"
  | "contract"
  | "hold"
  | "boost"
  | "release"
  | "rest"
  | "complete";

/**
 * Uma etapa já achatada: o motor percorre uma lista linear destas, sem
 * precisar saber de séries, blocos ou repetições durante a execução.
 */
export interface EtapaKegel {
  estado: EstadoKegel;
  duracaoMs: number;
  /** Texto exibido — vem da instrução do protocolo quando existe. */
  rotulo: string;

  serie: number;
  totalSeries: number;
  bloco: number;
  totalBlocos: number;
  repeticao: number;
  totalRepeticoes: number;
}

export interface EstadoDoMotor {
  etapa: EtapaKegel | null;
  /** Andamento da etapa atual, de 0 a 1. */
  progresso: number;
  restanteMs: number;
  indice: number;
  totalEtapas: number;
  pausado: boolean;
  concluido: boolean;
}
