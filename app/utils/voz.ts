import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

import type { EtapaKegel } from "../screens/Kegel/kegel.types";
import { VOZES_GRAVADAS } from "./vozesGravadas";

/**
 * Voz que acompanha o Kegel: fala o comando de cada fase ("Contrai", "Solta",
 * "Relaxa") para a usuária fazer o exercício de olhos fechados.
 *
 * Quando existe gravação para a fala (vozesGravadas.ts), toca a gravação - é a
 * voz humana de verdade. Sem gravação, usa a síntese de voz do aparelho,
 * escolhendo a voz pt-BR de melhor qualidade instalada.
 *
 * As falas são curtas de propósito: várias fases do protocolo duram 1s, e uma
 * frase longa invadiria a próxima.
 */

/** Um pouco mais lenta e sem agudo forçado: soa mais calma e menos robótica. */
const OPCOES_FALA: Speech.SpeechOptions = {
  language: "pt-BR",
  rate: 0.85,
  pitch: 1.0,
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

let audioPreparado = false;
let vozEscolhida: string | undefined;
const players = new Map<string, AudioPlayer>();
let playerTocando: AudioPlayer | null = null;

/**
 * Voz pt-BR de melhor qualidade do aparelho. As vozes "aprimoradas" do iOS
 * (e as de rede neural do Android) soam bem mais naturais que a padrão.
 */
async function escolherVoz(): Promise<void> {
  try {
    const vozes = await Speech.getAvailableVoicesAsync();
    const ptBr = vozes.filter((voz) => voz.language?.replace("_", "-").toLowerCase() === "pt-br");
    const melhor =
      ptBr.find((voz) => voz.quality === Speech.VoiceQuality.Enhanced) ??
      ptBr.find((voz) => /neural|network/i.test(voz.identifier));
    vozEscolhida = melhor?.identifier;
  } catch {
    // Sem lista de vozes: fica a voz padrão do idioma.
  }
}

/**
 * Prepara o áudio antes do exercício começar.
 *
 * No iOS o áudio do app obedece à chave de silencioso por padrão, e aí a voz
 * simplesmente não sai. A voz guia é o próprio exercício, então toca mesmo no
 * silencioso - abaixando (não parando) a música que estiver tocando.
 */
export async function prepararAudio(): Promise<void> {
  if (audioPreparado) return;

  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "duckOthers" });
  } catch (e) {
    console.warn("Erro ao configurar o áudio", e);
  }

  // Carregar as gravações agora evita atraso na primeira fala.
  for (const [texto, fonte] of Object.entries(VOZES_GRAVADAS)) {
    try {
      players.set(texto, createAudioPlayer(fonte));
    } catch (e) {
      console.warn(`Erro ao carregar a gravação "${texto}"`, e);
    }
  }

  await escolherVoz();
  audioPreparado = true;
}

/** Fala o texto, cortando a fala anterior para nunca atrasar em relação à fase. */
export function falar(texto: string | null): void {
  if (!texto) return;

  calar();

  const gravacao = players.get(texto);
  if (gravacao) {
    playerTocando = gravacao;
    gravacao
      .seekTo(0)
      .then(() => gravacao.play())
      .catch((e) => console.warn("Erro ao tocar a gravação", e));
    return;
  }

  try {
    Speech.speak(texto, { ...OPCOES_FALA, voice: vozEscolhida });
  } catch (e) {
    console.warn("Erro ao falar", e);
  }
}

export function calar(): void {
  try {
    playerTocando?.pause();
    playerTocando = null;
    Speech.stop();
  } catch {
    // Sem fala em andamento: nada a fazer.
  }
}
