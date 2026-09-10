import { createAudioPlayer, type AudioPlayer } from "expo-audio";

/**
 * Helpers de áudio dos temporizadores.
 *
 * Substituem o expo-av, removido a partir do SDK 54. No expo-audio o player é
 * criado de forma síncrona e não existe `replayAsync`: rebobinar é seekTo(0)
 * seguido de play().
 */
export function criarBipe(fonte: number): AudioPlayer {
  return createAudioPlayer(fonte);
}

/** Toca o som desde o início, mesmo que ainda esteja tocando. */
export async function tocarDoInicio(player: AudioPlayer | null): Promise<void> {
  if (!player) return;

  try {
    await player.seekTo(0);
    player.play();
  } catch (e) {
    console.warn("Erro ao tocar som", e);
  }
}

export type { AudioPlayer };
