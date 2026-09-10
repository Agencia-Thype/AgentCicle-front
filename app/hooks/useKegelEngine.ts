import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EstadoDoMotor, EtapaKegel, ExercicioKegel } from "../screens/Kegel/kegel.types";
import { montarLinhaDoTempo } from "../screens/Kegel/kegelTimeline";

/**
 * Motor de execução do exercício de Kegel.
 *
 * Um único relógio manda em tudo: fase, cronômetro, contadores, animação da
 * Lunia e feedback. Nada de um timer para o texto e outro para a mascote — era
 * assim que dessincronizava.
 *
 * O tempo restante é derivado de timestamps reais, nunca de subtrações
 * acumuladas (`restante -= 100`). Uma travada de renderização atrasa o próximo
 * tick, mas não desloca o exercício: ao voltar, o cálculo já considera o tempo
 * que passou de verdade.
 */

/** Frequência do tick. Só define a suavidade da UI, não a precisão. */
const INTERVALO_TICK_MS = 50;

interface OpcoesMotor {
  /** Enquanto false o motor fica parado (modal fechado, por exemplo). */
  ativo: boolean;
  /** Chamado uma vez, quando a última etapa termina. */
  aoConcluir?: () => void;
  /** Chamado a cada troca de etapa — usado para som e vibração. */
  aoTrocarEtapa?: (etapa: EtapaKegel, anterior: EtapaKegel | null) => void;
}

export interface MotorKegel extends EstadoDoMotor {
  etapas: EtapaKegel[];
  alternarPausa: () => void;
  pularEtapa: () => void;
  reiniciar: () => void;
}

export function useKegelEngine(
  exercicio: ExercicioKegel,
  { ativo, aoConcluir, aoTrocarEtapa }: OpcoesMotor
): MotorKegel {
  const etapas = useMemo(() => montarLinhaDoTempo(exercicio), [exercicio]);

  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  /** Instante lógico em que a etapa atual começou. */
  const inicioEtapaRef = useRef(Date.now());
  /** Instante em que a pausa começou, para compensar na retomada. */
  const pausadoEmRef = useRef<number | null>(null);
  const concluiuRef = useRef(false);
  const etapaAnteriorRef = useRef<EtapaKegel | null>(null);

  const concluido = indice >= etapas.length;
  const etapa = concluido ? null : etapas[indice] ?? null;

  // ---------------------------------------------------------------- reinício
  const reiniciar = useCallback(() => {
    setIndice(0);
    setPausado(false);
    inicioEtapaRef.current = Date.now();
    pausadoEmRef.current = null;
    concluiuRef.current = false;
    etapaAnteriorRef.current = null;
    setAgora(Date.now());
  }, []);

  // Trocar de exercício recomeça do zero.
  useEffect(() => {
    reiniciar();
  }, [exercicio.id, reiniciar]);

  // ------------------------------------------------------------------- tique
  useEffect(() => {
    if (!ativo || pausado || concluido) return;

    const id = setInterval(() => setAgora(Date.now()), INTERVALO_TICK_MS);
    return () => clearInterval(id);
  }, [ativo, pausado, concluido]);

  // ------------------------------------------------------------------ pausa
  const alternarPausa = useCallback(() => {
    setPausado((estavaPausado) => {
      if (estavaPausado) {
        // Retomando: empurra o início da etapa pelo tempo que ficou parada,
        // para o cronômetro continuar de onde estava.
        const parouEm = pausadoEmRef.current;
        if (parouEm !== null) {
          inicioEtapaRef.current += Date.now() - parouEm;
          pausadoEmRef.current = null;
        }
        setAgora(Date.now());
        return false;
      }

      pausadoEmRef.current = Date.now();
      return true;
    });
  }, []);

  // ------------------------------------------------------------- progressão
  const avancar = useCallback((referenciaMs: number, sobraMs: number) => {
    // A referência tem de ser a mesma que calculou o decorrido. Usar Date.now()
    // aqui, enquanto o decorrido vem de `agora`, desloca o início da etapa em
    // até um tique — e o erro se acumula a cada troca de fase.
    inicioEtapaRef.current = referenciaMs - sobraMs;
    setIndice((atual) => atual + 1);
  }, []);

  useEffect(() => {
    if (!ativo || pausado || concluido || !etapa) return;

    const decorrido = agora - inicioEtapaRef.current;
    if (decorrido < etapa.duracaoMs) return;

    // O excedente entra na próxima etapa em vez de ser descartado: sem isso,
    // cada troca perderia alguns milissegundos e o exercício iria atrasando.
    avancar(agora, decorrido - etapa.duracaoMs);
  }, [agora, ativo, pausado, concluido, etapa, avancar]);

  const pularEtapa = useCallback(() => {
    if (concluido) return;
    const agoraReal = Date.now();
    pausadoEmRef.current = null;
    setPausado(false);
    setAgora(agoraReal);
    avancar(agoraReal, 0);
  }, [concluido, avancar]);

  // -------------------------------------------------- avisos de troca e fim
  useEffect(() => {
    if (!ativo || !etapa) return;
    if (etapaAnteriorRef.current === etapa) return;

    const anterior = etapaAnteriorRef.current;
    etapaAnteriorRef.current = etapa;
    aoTrocarEtapa?.(etapa, anterior);
  }, [etapa, ativo, aoTrocarEtapa]);

  useEffect(() => {
    if (!ativo || !concluido || concluiuRef.current) return;
    concluiuRef.current = true;
    aoConcluir?.();
  }, [concluido, ativo, aoConcluir]);

  // ------------------------------------------------------------- derivados
  const decorridoMs = pausado
    ? (pausadoEmRef.current ?? agora) - inicioEtapaRef.current
    : agora - inicioEtapaRef.current;

  const duracao = etapa?.duracaoMs ?? 0;
  const restanteMs = etapa ? Math.max(0, duracao - decorridoMs) : 0;
  const progresso = duracao > 0 ? Math.min(1, Math.max(0, decorridoMs / duracao)) : 0;

  return {
    etapa,
    etapas,
    progresso,
    restanteMs,
    indice,
    totalEtapas: etapas.length,
    pausado,
    concluido,
    alternarPausa,
    pularEtapa,
    reiniciar,
  };
}
