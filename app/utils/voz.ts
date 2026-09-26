import * as Speech from "expo-speech";

import type { EtapaKegel } from "../screens/Kegel/kegel.types";

/**
 * Voz que acompanha o Kegel: fala o comando de cada fase ("Contrai", "Solta",
 * "Relaxa") para a usuária fazer o exercício de olhos fechados.
 *
 * Usa a voz pt-BR do próprio aparelho. As falas são curtas de propósito:
 * várias fases do protocolo duram 1,5s, e uma frase longa invadiria a próxima.
 */

const OPCOES_FALA: Speech.SpeechOptions = {
  language: "pt-BR",
  rate: 0.95,
  pitch: 1.05,
};

/** O que a voz diz ao entrar em cada etapa, ou null quando fica em silêncio. */
export function falaDaEtapa(etapa: EtapaKegel): string | null {
  switch (etapa.estado) {
    case "contract":
      return "Contrai";
    case "hold":
      return "Segura";
    case "boost":
      return "Mais forte";
    case "release":
      // O protocolo distingue "soltar" (entre contrações) de "relaxar".
      return etapa.rotulo.toLocaleLowerCase().includes("solta") ? "Solta" : "Relaxa";
    case "rest":
      return "Relaxa";
    case "complete":
      return "Muito bem!";
    default:
      return null;
  }
}

/** Fala o texto, cortando a fala anterior para nunca atrasar em relação à fase. */
export function falar(texto: string | null): void {
  if (!texto) return;

  try {
    Speech.stop();
    Speech.speak(texto, OPCOES_FALA);
  } catch (e) {
    console.warn("Erro ao falar", e);
  }
}

export function calar(): void {
  try {
    Speech.stop();
  } catch {
    // Sem fala em andamento: nada a fazer.
  }
}
