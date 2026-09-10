import protocolo from "../fixtures/kegelProtocolo.json";
import { montarLinhaDoTempo, PREPARACAO_MS } from "../../screens/Kegel/kegelTimeline";
import type { EstadoKegel, ExercicioKegel } from "../../screens/Kegel/kegel.types";

/**
 * Valida o motor contra o protocolo real, exportado de
 * app/data/kegel_exercises.py do backend — os 9 exercícios, não amostras
 * digitadas à mão.
 *
 * O que está sendo protegido: o motor não pode alterar tempo nenhum. Se
 * alguém mexer na linha do tempo e uma contração de 4s virar 3s, ou uma
 * repetição sumir, estes testes quebram.
 */

const niveis = protocolo as unknown as Record<string, ExercicioKegel[]>;
const todos: ExercicioKegel[] = Object.values(niveis).flat();

/** Soma, direto do protocolo, quantas fases o exercício inteiro tem. */
function etapasEsperadas(exercicio: ExercicioKegel): number {
  const porSerie = exercicio.instrucoes.reduce(
    (total, bloco) => total + bloco.fases.length * bloco.repeticoes,
    0
  );
  const descansos = exercicio.series - 1;
  return 1 + porSerie * exercicio.series + descansos;
}

/** Soma, direto do protocolo, a duração total em milissegundos. */
function duracaoEsperadaMs(exercicio: ExercicioKegel): number {
  const porSerie = exercicio.instrucoes.reduce(
    (total, bloco) =>
      total +
      bloco.repeticoes *
        bloco.fases.reduce((soma, fase) => soma + fase.duracao_segundos * 1000, 0),
    0
  );
  const descansos = (exercicio.series - 1) * exercicio.descanso_segundos * 1000;
  return PREPARACAO_MS + porSerie * exercicio.series + descansos;
}

const ESTADOS_VALIDOS: EstadoKegel[] = [
  "prepare",
  "contract",
  "hold",
  "boost",
  "release",
  "rest",
  "complete",
];

describe("Motor de Kegel contra o protocolo real do backend", () => {
  it("carrega os 9 exercícios dos 3 níveis", () => {
    expect(Object.keys(niveis).sort()).toEqual(["avancado", "iniciante", "intermediario"]);
    expect(todos).toHaveLength(9);
  });

  describe.each(todos.map((e) => [e.id, e] as const))("%s", (_id, exercicio) => {
    const etapas = montarLinhaDoTempo(exercicio);

    it("gera exatamente uma etapa por fase executada", () => {
      expect(etapas).toHaveLength(etapasEsperadas(exercicio));
    });

    it("soma a mesma duração total do protocolo", () => {
      const somado = etapas.reduce((total, etapa) => total + etapa.duracaoMs, 0);
      expect(somado).toBe(duracaoEsperadaMs(exercicio));
    });

    it("não cria etapa de duração zero", () => {
      expect(etapas.every((etapa) => etapa.duracaoMs > 0)).toBe(true);
    });

    it("descansa entre séries e nunca ao final", () => {
      const descansos = etapas.filter((etapa) => etapa.estado === "rest");
      expect(descansos).toHaveLength(exercicio.series - 1);
      expect(etapas[etapas.length - 1].estado).not.toBe("rest");
    });

    it("usa apenas estados conhecidos", () => {
      expect(etapas.every((etapa) => ESTADOS_VALIDOS.includes(etapa.estado))).toBe(true);
    });

    it("preserva cada duração de fase vinda do protocolo", () => {
      const duracoesDoProtocolo = new Set(
        exercicio.instrucoes.flatMap((bloco) =>
          bloco.fases.map((fase) => Math.round(fase.duracao_segundos * 1000))
        )
      );

      const doExercicio = etapas.filter(
        (etapa) => etapa.estado !== "prepare" && etapa.estado !== "rest"
      );

      expect(doExercicio.every((etapa) => duracoesDoProtocolo.has(etapa.duracaoMs))).toBe(true);
    });

    it("conta as repetições até o total do bloco", () => {
      exercicio.instrucoes.forEach((bloco, indice) => {
        const doBloco = etapas.filter(
          (etapa) => etapa.bloco === indice + 1 && etapa.estado !== "prepare" && etapa.estado !== "rest"
        );
        const repeticoesVistas = new Set(doBloco.map((etapa) => etapa.repeticao));

        expect(repeticoesVistas.size).toBe(bloco.repeticoes);
        expect(Math.max(...repeticoesVistas)).toBe(bloco.repeticoes);
      });
    });
  });

  it("traduz contracao_forte para boost mantendo a duração do protocolo", () => {
    const comBoost = todos.filter((exercicio) =>
      exercicio.instrucoes.some((bloco) =>
        bloco.fases.some((fase) => fase.tipo === "contracao_forte")
      )
    );

    // O protocolo tem a fase de "piscada a mais" no exercício 2 de cada nível.
    expect(comBoost).toHaveLength(3);

    comBoost.forEach((exercicio) => {
      const duracoesForte = exercicio.instrucoes
        .flatMap((bloco) => bloco.fases)
        .filter((fase) => fase.tipo === "contracao_forte")
        .map((fase) => Math.round(fase.duracao_segundos * 1000));

      const boosts = montarLinhaDoTempo(exercicio).filter((etapa) => etapa.estado === "boost");

      expect(boosts.length).toBeGreaterThan(0);
      expect(boosts.every((etapa) => duracoesForte.includes(etapa.duracaoMs))).toBe(true);
    });
  });
});
