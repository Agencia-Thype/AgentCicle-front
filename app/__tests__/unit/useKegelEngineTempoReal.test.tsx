import React from "react";
import TestRenderer, { act } from "react-test-renderer";

import { useKegelEngine, type MotorKegel } from "../../hooks/useKegelEngine";
import type { ExercicioKegel } from "../../screens/Kegel/kegel.types";

/**
 * Mede o motor com relógio de verdade, não com timers falsos.
 *
 * Os outros testes provam que a matemática está certa; este prova que um
 * segundo do motor é um segundo do mundo. Se o cronômetro estiver correndo
 * rápido, é aqui que aparece.
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const exercicio: ExercicioKegel = {
  id: "tempo-real",
  nome: "Medição de tempo real",
  nivel: "iniciante",
  objetivo: "teste",
  series: 1,
  descanso_segundos: 0,
  instrucoes: [
    {
      repeticoes: 1,
      fases: [
        { tipo: "contracao", duracao_segundos: 30, instrucao: "Contraia" },
      ],
    },
  ],
};

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Motor com relógio real", () => {
  it("consome um segundo de fase por segundo de relógio", async () => {
    const motor = { atual: null as MotorKegel | null };

    function Sonda() {
      motor.atual = useKegelEngine(exercicio, { ativo: true });
      return null;
    }

    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<Sonda />);
    });

    const inicioReal = Date.now();
    const restanteInicial = (motor.atual as MotorKegel).restanteMs;

    await act(async () => {
      await esperar(1200);
    });

    const decorridoReal = Date.now() - inicioReal;
    const consumido = restanteInicial - (motor.atual as MotorKegel).restanteMs;

    // O consumido tem de acompanhar o relógio de parede. A folga cobre o
    // intervalo do tique e o agendamento do próprio ambiente de teste.
    expect(consumido).toBeGreaterThan(decorridoReal - 200);
    expect(consumido).toBeLessThan(decorridoReal + 200);

    await act(async () => {
      renderer.unmount();
    });
  }, 10000);
});
