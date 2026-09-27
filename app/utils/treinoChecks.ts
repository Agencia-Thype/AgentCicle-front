import { TreinoExercicio } from "../interface/TreinoDoDiaInterface";

export type MarcadosHoje = {
  ja_salvo?: boolean;
  percentual?: number;
  exercicios_concluidos?: string[];
};

/** Converte o check-in de hoje (/treino-dia/marcados-hoje) nos checks da lista. */
export function checksDoTreino(
  exercicios: TreinoExercicio[],
  { percentual, exercicios_concluidos }: MarcadosHoje
): { [key: number]: boolean } {
  const checks: { [key: number]: boolean } = {};
  if (Array.isArray(exercicios_concluidos) && exercicios_concluidos.length) {
    // Marca exatamente os exercícios feitos, pelo nome.
    const feitos = new Set<string>(exercicios_concluidos);
    exercicios.forEach((ex, index) => {
      if (feitos.has(ex.exercicio)) checks[index] = true;
    });
  } else {
    // Check-ins de antes da migração só têm o percentual.
    const quantidadeMarcada = Math.round(((percentual || 0) / 100) * exercicios.length);
    for (let i = 0; i < quantidadeMarcada; i++) {
      checks[i] = true;
    }
  }
  return checks;
}
