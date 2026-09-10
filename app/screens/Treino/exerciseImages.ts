import type { ImageSourcePropType } from "react-native";

const normalizeExerciseName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

const exerciseImages: Record<string, ImageSourcePropType> = {
  "agachamento afundo": require("../../assets/exercicio-afundo.png"),
  "agachamento livre": require("../../assets/exercicio-agachamento.png"),
  "alongamento de membros superiores conforme anexo 3": require("../../assets/exercicio-alongamento-superiores.png"),
  "cadeira extensora": require("../../assets/exercicio-cadeira-extensora.png"),
  "crucifixo invertido": require("../../assets/exercicio-crucifixo-invertido.png"),
  "crucifixo reto no cross over rotacao de tronco no cross over": require("../../assets/exercicio-crucifixo-crossover.png"),
  "desenvolvimento com halteres": require("../../assets/exercicio-desenvolvimento.png"),
  "elevacao frontal": require("../../assets/exercicio-elevacao-frontal.png"),
  "elevacao lateral": require("../../assets/exercicio-elevacao-lateral.png"),
  "esteira": require("../../assets/exercicio-esteira.png"),
  "exercicio": require("../../assets/exercicio-geral.png"),
  "leg press agachamento com salto": require("../../assets/exercicio-leg-press.png"),
  "pull down abdominal reto na polia": require("../../assets/exercicio-pull-down.png"),
  "puxada alta pronada": require("../../assets/exercicio-puxada-alta.png"),
  "rosca alternada": require("../../assets/exercicio-rosca-alternada.png"),
  "serrote": require("../../assets/exercicio-serrote.png"),
  "supino reto com halter abdominal infra deitada": require("../../assets/exercicio-supino-halter.png"),
  "triceps frances com halter": require("../../assets/exercicio-triceps-frances.png"),
  "triceps testa com halter": require("../../assets/exercicio-triceps-testa.png"),
};

export function getExerciseImage(name: string): ImageSourcePropType | undefined {
  return exerciseImages[normalizeExerciseName(name)];
}
