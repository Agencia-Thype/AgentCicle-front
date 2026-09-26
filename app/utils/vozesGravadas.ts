/**
 * Gravações da voz guia do Kegel, uma por fala.
 *
 * Voz "Dora" (pt-BR, feminina), gerada com o modelo Kokoro-82M (licença
 * Apache 2.0, uso comercial liberado), em velocidade 0.9. Uma fala sem
 * gravação aqui cai na síntese de voz do aparelho.
 *
 * Os arquivos devem ser curtos (menos de 1 segundo de fala, sem silêncio no
 * começo), porque as fases rápidas do protocolo duram 1 segundo.
 */
export const VOZES_GRAVADAS: Record<string, number> = {
  Contrai: require("../assets/sounds/voz/contrai.wav"),
  Solta: require("../assets/sounds/voz/solta.wav"),
  Relaxa: require("../assets/sounds/voz/relaxa.wav"),
  Segura: require("../assets/sounds/voz/segura.wav"),
  "Mais forte": require("../assets/sounds/voz/mais_forte.wav"),
  "Muito bem!": require("../assets/sounds/voz/muito_bem.wav"),
};
