import type { ImageSourcePropType } from "react-native";

const normalizeExerciseName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

const exerciseImages: Record<string, ImageSourcePropType> = {
  "abdominal infra": require("../../assets/exercicio-abdominal-infra.png"),
  "afundo com step na frente": require("../../assets/exercicio-afundo-step.png"),
  "agachamento afundo": require("../../assets/exercicio-afundo.png"),
  "agachamento bulgaro": require("../../assets/exercicio-agachamento-bulgaro.png"),
  "agachamento livre": require("../../assets/exercicio-agachamento.png"),
  "agachamento terra sumo": require("../../assets/exercicio-agachamento-terra-sumo.png"),
  "alongamento de membros inferiores conforme anexo 2": require("../../assets/exercicio-alongamento-inferiores.png"),
  "alongamento de membros superiores conforme anexo 3": require("../../assets/exercicio-alongamento-superiores.png"),
  "banco romano": require("../../assets/exercicio-banco-romano.png"),
  "bicicleta caminhada": require("../../assets/exercicio-bicicleta-caminhada.png"),
  "cadeira abdutora": require("../../assets/exercicio-cadeira-abdutora.png"),
  "cadeira adutora": require("../../assets/exercicio-cadeira-adutora.png"),
  "cadeira extensora": require("../../assets/exercicio-cadeira-extensora.png"),
  "cadeira extensora flexao nordica invertida": require("../../assets/exercicio-cadeira-extensora-nordica.png"),
  "crucifixo invertido": require("../../assets/exercicio-crucifixo-invertido.png"),
  "crucifixo reto no cross over rotacao de tronco no cross over": require("../../assets/exercicio-crucifixo-crossover.png"),
  "desenvolvimento com halteres": require("../../assets/exercicio-desenvolvimento.png"),
  "elevacao frontal": require("../../assets/exercicio-elevacao-frontal.png"),
  "elevacao lateral": require("../../assets/exercicio-elevacao-lateral.png"),
  "elevacao lateral unilateral inclinada": require("../../assets/exercicio-elevacao-lateral-unilateral.png"),
  "elevacao pelvica": require("../../assets/exercicio-elevacao-pelvica.png"),
  "escada": require("../../assets/exercicio-escada.png"),
  "escada continua": require("../../assets/exercicio-escada-continua.png"),
  "esteira": require("../../assets/exercicio-esteira.png"),
  "exercicio": require("../../assets/exercicio-geral.png"),
  "flexao em decubito dorsal": require("../../assets/exercicio-flexao-decubito-dorsal.png"),
  "flexora deitada": require("../../assets/exercicio-flexora-deitada.png"),
  "flexora em pe": require("../../assets/exercicio-flexora-em-pe.png"),
  "flexora sentada": require("../../assets/exercicio-flexora-sentada.png"),
  "gluteo 4 apoios": require("../../assets/exercicio-gluteo-4-apoios.png"),
  "gluteo na polia abducao na polia": require("../../assets/exercicio-gluteo-polia.png"),
  "good morning": require("../../assets/exercicio-good-morning.png"),
  "hiit esteira": require("../../assets/exercicio-hiit-esteira.png"),
  "leg press avanco": require("../../assets/exercicio-leg-press-avanco.png"),
  "leg press agachamento com salto": require("../../assets/exercicio-leg-press.png"),
  "leg press panturrilha": require("../../assets/exercicio-leg-press-panturrilha.png"),
  "panturrilha na maquina": require("../../assets/exercicio-panturrilha-maquina.png"),
  "prancha isometrica": require("../../assets/exercicio-prancha-isometrica.png"),
  "pull down triceps corda face pull": require("../../assets/exercicio-pull-down-triceps-face-pull.png"),
  "pull down abdominal reto na polia": require("../../assets/exercicio-pull-down.png"),
  "puxada alta pronada": require("../../assets/exercicio-puxada-alta.png"),
  "rosca alternada": require("../../assets/exercicio-rosca-alternada.png"),
  "remada baixa triangulo": require("../../assets/exercicio-remada-baixa.png"),
  "serrote": require("../../assets/exercicio-serrote.png"),
  "step up": require("../../assets/exercicio-step-up.png"),
  "stiff": require("../../assets/exercicio-stiff.png"),
  "stiff unilateral": require("../../assets/exercicio-stiff-unilateral.png"),
  "supino reto com halter": require("../../assets/exercicio-supino-halter-solo.png"),
  "supino reto com halter abdominal infra deitada": require("../../assets/exercicio-supino-halter.png"),
  "triceps corda triceps frances com halter": require("../../assets/exercicio-triceps-corda-frances.png"),
  "triceps frances com halter": require("../../assets/exercicio-triceps-frances.png"),
  "triceps pulley biceps pulley": require("../../assets/exercicio-triceps-biceps-pulley.png"),
  "triceps testa com halter": require("../../assets/exercicio-triceps-testa.png"),
  "voador crucifixo invertido": require("../../assets/exercicio-voador-crucifixo.png"),
};

export function getExerciseImage(name: string): ImageSourcePropType | undefined {
  return exerciseImages[normalizeExerciseName(name)];
}
