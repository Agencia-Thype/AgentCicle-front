/**
 * Gravações da voz guia do Kegel, uma por fala.
 *
 * Enquanto uma fala não tiver gravação, o app usa a síntese de voz do
 * aparelho. Para trocar pela voz humana: coloque o arquivo em
 * assets/sounds/voz/ e descomente a linha correspondente.
 *
 * Os arquivos devem ser curtos (menos de 1 segundo de fala, sem silêncio no
 * começo), porque as fases rápidas do protocolo duram 1 segundo.
 */
export const VOZES_GRAVADAS: Record<string, number> = {
  // Contrai: require("../assets/sounds/voz/contrai.mp3"),
  // Solta: require("../assets/sounds/voz/solta.mp3"),
  // Relaxa: require("../assets/sounds/voz/relaxa.mp3"),
  // Segura: require("../assets/sounds/voz/segura.mp3"),
  // "Mais forte": require("../assets/sounds/voz/mais_forte.mp3"),
  // "Muito bem!": require("../assets/sounds/voz/muito_bem.mp3"),
};
