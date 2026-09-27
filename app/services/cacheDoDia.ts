import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebase";

/**
 * Última resposta de uma tela, guardada por usuária e por dia.
 *
 * As telas logadas abrem mostrando o que viram da última vez hoje e atualizam
 * em segundo plano, em vez de travar num spinner esperando a rede. O dado de
 * outro dia é descartado: dose, água e treino de ontem não servem para hoje.
 */
const PREFIXO = "@AgentCicle:tela:";

function hojeLocal(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function chaveCompleta(chave: string): string | null {
  const uid = auth.currentUser?.uid;
  return uid ? `${PREFIXO}${uid}:${chave}` : null;
}

async function ler<T>(chave: string, soDeHoje: boolean): Promise<T | null> {
  const completa = chaveCompleta(chave);
  if (!completa) return null;
  try {
    const valor = await AsyncStorage.getItem(completa);
    if (!valor) return null;
    const salvo = JSON.parse(valor);
    if (soDeHoje && salvo?.dia !== hojeLocal()) return null;
    return (salvo?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

/** Última resposta salva hoje (dados que zeram a cada dia: doses, água, treino). */
export const lerDoDia = <T,>(chave: string) => ler<T>(chave, true);

/**
 * Última resposta salva, de qualquer dia. Para dados que não zeram na virada
 * do dia, como o progresso do Kegel, que é acumulado por nível.
 */
export const lerUltimo = <T,>(chave: string) => ler<T>(chave, false);

export async function salvarDoDia<T>(chave: string, data: T): Promise<void> {
  const completa = chaveCompleta(chave);
  if (!completa) return;
  try {
    await AsyncStorage.setItem(completa, JSON.stringify({ dia: hojeLocal(), data }));
  } catch {
    // Cache é só conveniência; falhar aqui não pode quebrar a tela.
  }
}

/** Chaves usadas pelas telas e pelo aquecimento; precisam ser as mesmas. */
export const CHAVES = {
  rotinaHoje: "rotina_hoje",
  rotinaAgua: "rotina_agua",
  treinoDia: "treino_dia",
  kegelStatusNiveis: "kegel_status_niveis",
  kegelTreino: (nivel: string, revisao: number) => `kegel_treino:${nivel}:${revisao}`,
  faseCiclo: "fase_ciclo",
  faseDetalhes: "fase_detalhes",
  progressoSemanal: "progresso_semanal",
  relatorioMensal: (mes: string) => `relatorio_mensal:${mes}`,
  historicoRotina: (dias: number) => `historico_rotina:${dias}`,
};
