import React from "react";
import TestRenderer, { act } from "react-test-renderer";

import { useKegelEngine, type MotorKegel } from "../../hooks/useKegelEngine";
import { PREPARACAO_MS } from "../../screens/Kegel/kegelTimeline";
import type { ExercicioKegel } from "../../screens/Kegel/kegel.types";

/**
 * Testes do relógio do motor.
 *
 * O motor não usa nada do React Native — só hooks do React — então dá para
 * exercitá-lo com o renderer de teste e relógio falso, sem emulador.
 *
 * O que está sendo protegido: cronômetro correto, pausa que não perde tempo,
 * e ausência de desvio acumulado ao longo de dezenas de trocas de fase.
 */

// Sinaliza ao React que estamos num ambiente de teste, senão cada act()
// registra "testing environment is not configured to support act(...)".
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Exercício curto e previsível: 2 séries, 2 repetições, descanso de 10s. */
const exercicio: ExercicioKegel = {
  id: "teste-motor",
  nome: "Exercício de teste",
  nivel: "iniciante",
  objetivo: "teste",
  series: 2,
  descanso_segundos: 10,
  instrucoes: [
    {
      repeticoes: 2,
      fases: [
        { tipo: "contracao", duracao_segundos: 4, instrucao: "Contraia" },
        { tipo: "relaxamento", duracao_segundos: 2, instrucao: "Relaxe" },
      ],
    },
  ],
};

function montarMotor(aoConcluir?: () => void) {
  const motor = { atual: null as MotorKegel | null };

  function Sonda() {
    motor.atual = useKegelEngine(exercicio, { ativo: true, aoConcluir });
    return null;
  }

  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Sonda />);
  });

  return {
    get: () => motor.atual as MotorKegel,
    avancar: (ms: number) => act(() => { jest.advanceTimersByTime(ms); }),
    desmontar: () => act(() => renderer.unmount()),
  };
}

describe("Motor de execução do Kegel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("começa na preparação", () => {
    const m = montarMotor();

    expect(m.get().etapa?.estado).toBe("prepare");
    expect(m.get().restanteMs).toBe(PREPARACAO_MS);
    expect(m.get().progresso).toBe(0);

    m.desmontar();
  });

  it("conta o tempo restante da fase", () => {
    const m = montarMotor();
    m.avancar(PREPARACAO_MS); // sai da preparação

    expect(m.get().etapa?.estado).toBe("contract");
    expect(m.get().restanteMs).toBe(4000);

    m.avancar(1500);
    expect(m.get().restanteMs).toBe(2500);
    expect(m.get().progresso).toBeCloseTo(0.375, 3);

    m.desmontar();
  });

  it("avança sozinho quando a fase termina", () => {
    const m = montarMotor();
    m.avancar(PREPARACAO_MS + 4000);

    expect(m.get().etapa?.estado).toBe("release");
    expect(m.get().restanteMs).toBe(2000);

    m.desmontar();
  });

  it("congela na pausa e retoma de onde parou", () => {
    const m = montarMotor();
    m.avancar(PREPARACAO_MS + 1000);

    expect(m.get().restanteMs).toBe(3000);

    act(() => m.get().alternarPausa());
    expect(m.get().pausado).toBe(true);

    // Meio minuto parado não pode consumir a fase.
    m.avancar(30000);
    expect(m.get().restanteMs).toBe(3000);
    expect(m.get().etapa?.estado).toBe("contract");

    act(() => m.get().alternarPausa());
    expect(m.get().pausado).toBe(false);
    expect(m.get().restanteMs).toBe(3000);

    // E continua contando normalmente depois.
    m.avancar(1000);
    expect(m.get().restanteMs).toBe(2000);

    m.desmontar();
  });

  it("não acumula desvio ao longo de dezenas de trocas de fase", () => {
    const m = montarMotor();

    // 2 séries x 2 repetições x (4s + 2s) = 24s, mais 10s de descanso.
    // Depois da preparação e de 12s, deve estar exatamente no descanso.
    m.avancar(PREPARACAO_MS + 12000);
    expect(m.get().etapa?.estado).toBe("rest");
    expect(m.get().restanteMs).toBe(10000);

    // Mais 10s de descanso e 6s: segunda série, segunda fase da primeira rep.
    m.avancar(10000 + 4000);
    expect(m.get().etapa?.estado).toBe("release");
    expect(m.get().etapa?.serie).toBe(2);
    expect(m.get().etapa?.repeticao).toBe(1);
    expect(m.get().restanteMs).toBe(2000);

    m.desmontar();
  });

  it("pular etapa vai direto para a próxima", () => {
    const m = montarMotor();
    m.avancar(PREPARACAO_MS);

    expect(m.get().etapa?.estado).toBe("contract");

    act(() => m.get().pularEtapa());
    expect(m.get().etapa?.estado).toBe("release");
    expect(m.get().restanteMs).toBe(2000);

    m.desmontar();
  });

  it("conclui ao fim da última etapa, avisando uma única vez", () => {
    const aoConcluir = jest.fn();
    const m = montarMotor(aoConcluir);

    // Duração total: preparação + 2 séries x 12s + 10s de descanso.
    m.avancar(PREPARACAO_MS + 24000 + 10000);

    expect(m.get().concluido).toBe(true);
    expect(m.get().etapa).toBeNull();
    expect(aoConcluir).toHaveBeenCalledTimes(1);

    // Continuar rodando não dispara de novo.
    m.avancar(5000);
    expect(aoConcluir).toHaveBeenCalledTimes(1);

    m.desmontar();
  });

  it("reiniciar volta para a preparação", () => {
    const m = montarMotor();
    m.avancar(PREPARACAO_MS + 5000);
    expect(m.get().etapa?.estado).toBe("release");

    act(() => m.get().reiniciar());

    expect(m.get().etapa?.estado).toBe("prepare");
    expect(m.get().indice).toBe(0);
    expect(m.get().pausado).toBe(false);

    m.desmontar();
  });
});
