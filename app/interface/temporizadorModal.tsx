export interface TemporizadorModalProps {
    exercicio: {
      nome: string;
      repeticoes: number;
      duracao?: string;
      descanso?: string;
    };
    onComplete: () => void;
    onProximoExercicio: () => void;
    onSair: () => void;
  }