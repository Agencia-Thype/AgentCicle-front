import { montarLinhaDoTempo, PREPARACAO_MS } from "../../screens/Kegel/kegelTimeline";
import type { ExercicioKegel } from "../../screens/Kegel/kegel.types";

/**
 * O protocolo terapêutico é definido no backend. Estes testes garantem que o
 * motor executa exatamente o que o servidor mandou: nenhuma duração inventada,
 * nenhuma repetição perdida, nenhum descanso extra.
 */

/** Exercício 1 do nível iniciante, igual ao de app/data/kegel_exercises.py. */
const exercicio1: ExercicioKegel = {
  id: "kegel_ini_ex1",
  nome: "Exercício 1: Resistência + Agilidade",
  nivel: "iniciante",
  objetivo: "resistência + agilidade",
  series: 3,
  descanso_segundos: 30,
  instrucoes: [
    {
      repeticoes: 5,
      fases: [
        { tipo: "contracao", duracao_segundos: 4, instrucao: "Contraia" },
        { tipo: "manter", duracao_segundos: 4, instrucao: "Mantenha a contração" },
        { tipo: "relaxamento", duracao_segundos: 5, instrucao: "Relaxe completamente" },
      ],
    },
    {
      repeticoes: 12,
      fases: [
        { tipo: "contracao", duracao_segundos: 1.5, instrucao: "Contraia" },
        { tipo: "relaxamento", duracao_segundos: 1.5, instrucao: "Solte" },
      ],
    },
  ],
};

/** Exercício 2 do iniciante: tem a fase de "contrair mais forte". */
const exercicio2: ExercicioKegel = {
  id: "kegel_ini_ex2",
  nome: "Exercício 2: Resistência + Hipertrofia",
  nivel: "iniciante",
  objetivo: "resistência + hipertrofia",
  series: 3,
  descanso_segundos: 30,
  instrucoes: [
    {
      repeticoes: 8,
      fases: [
        { tipo: "contracao", duracao_segundos: 3, instrucao: "Contraia" },
        { tipo: "manter", duracao_segundos: 3, instrucao: "Mantenha a contração" },
        { tipo: "contracao_forte", duracao_segundos: 1, instrucao: "Contraia mais forte" },
        { tipo: "relaxamento", duracao_segundos: 4, instrucao: "Relaxe" },
      ],
    },
  ],
};

describe("Linha do tempo do exercício de Kegel", () => {
  it("gera uma etapa por fase de cada repetição de cada série", () => {
    const etapas = montarLinhaDoTempo(exercicio1);

    // Por série: 5 repetições x 3 fases + 12 repetições x 2 fases = 39 etapas.
    // Três séries, dois descansos entre elas, mais a preparação inicial.
    expect(etapas).toHaveLength(1 + 39 * 3 + 2);
  });

  it("preserva as durações do protocolo, inclusive frações", () => {
    const etapas = montarLinhaDoTempo(exercicio1);
    const exercicioEmSi = etapas.filter((e) => e.estado !== "prepare" && e.estado !== "rest");

    const deQuatroSegundos = exercicioEmSi.filter((e) => e.duracaoMs === 4000);
    const deCincoSegundos = exercicioEmSi.filter((e) => e.duracaoMs === 5000);
    const deUmSegundoEMeio = exercicioEmSi.filter((e) => e.duracaoMs === 1500);

    // Contração + sustentação: 5 x 2 fases x 3 séries = 30 etapas de 4s.
    expect(deQuatroSegundos).toHaveLength(30);
    // Relaxamento principal: 5 repetições x 3 séries = 15 etapas de 5s.
    expect(deCincoSegundos).toHaveLength(15);
    // 12 repetições x 2 fases x 3 séries = 72 etapas de 1,5s.
    expect(deUmSegundoEMeio).toHaveLength(72);
    // Nenhuma outra duração aparece no meio do exercício.
    expect(deQuatroSegundos.length + deCincoSegundos.length + deUmSegundoEMeio.length).toBe(exercicioEmSi.length);
  });

  it("só descansa entre séries, nunca depois da última", () => {
    const etapas = montarLinhaDoTempo(exercicio1);
    const descansos = etapas.filter((e) => e.estado === "rest");

    expect(descansos).toHaveLength(2);
    expect(descansos.every((e) => e.duracaoMs === 30000)).toBe(true);
    expect(etapas[etapas.length - 1].estado).not.toBe("rest");
  });

  it("mapeia contracao_forte para o estado boost, com a duração do protocolo", () => {
    const etapas = montarLinhaDoTempo(exercicio2);
    const boosts = etapas.filter((e) => e.estado === "boost");

    // 8 repetições x 3 séries.
    expect(boosts).toHaveLength(24);
    expect(boosts.every((e) => e.duracaoMs === 1000)).toBe(true);
  });

  it("mantém as instruções do protocolo como rótulo da etapa", () => {
    const etapas = montarLinhaDoTempo(exercicio2);
    const primeiraContracao = etapas.find((e) => e.estado === "contract");

    expect(primeiraContracao?.rotulo).toBe("Contraia");

    const primeiraSustentacao = etapas.find((e) => e.estado === "hold");
    expect(primeiraSustentacao?.rotulo).toBe("Mantenha a contração");
  });

  it("numera séries e repetições para exibição", () => {
    const etapas = montarLinhaDoTempo(exercicio1);
    const doExercicio = etapas.filter((e) => e.estado !== "prepare" && e.estado !== "rest");

    expect(doExercicio[0].serie).toBe(1);
    expect(doExercicio[0].repeticao).toBe(1);
    expect(doExercicio[0].totalRepeticoes).toBe(5);

    const ultima = doExercicio[doExercicio.length - 1];
    expect(ultima.serie).toBe(3);
    expect(ultima.repeticao).toBe(12);
  });

  it("abre com a preparação, que é tempo de interface e não do protocolo", () => {
    const etapas = montarLinhaDoTempo(exercicio1);

    expect(etapas[0].estado).toBe("prepare");
    expect(etapas[0].duracaoMs).toBe(PREPARACAO_MS);
    expect(etapas.filter((e) => e.estado === "prepare")).toHaveLength(1);
  });
});
