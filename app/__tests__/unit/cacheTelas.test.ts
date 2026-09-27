jest.mock("@react-native-async-storage/async-storage", () => {
  const dados = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => dados.get(k) ?? null),
      setItem: jest.fn(async (k: string, v: string) => void dados.set(k, v)),
      clear: () => dados.clear(),
    },
  };
});
jest.mock("../../services/firebase", () => ({ auth: { currentUser: { uid: "u1" } } }));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../services/firebase";
import { lerDoDia, lerUltimo, salvarDoDia } from "../../services/cacheDoDia";
import { checksDoTreino } from "../../utils/treinoChecks";

describe("cacheDoDia", () => {
  beforeEach(() => {
    (AsyncStorage as any).clear();
    (auth as any).currentUser = { uid: "u1" };
    jest.useRealTimers();
  });

  it("devolve o que foi salvo hoje", async () => {
    await salvarDoDia("rotina", { total: 3 });
    expect(await lerDoDia("rotina")).toEqual({ total: 3 });
  });

  it("descarta dado de outro dia em lerDoDia, mas não em lerUltimo", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-26T10:00:00"));
    await salvarDoDia("kegel", { nivel: "iniciante" });
    jest.setSystemTime(new Date("2026-09-27T10:00:00"));
    expect(await lerDoDia("kegel")).toBeNull();
    expect(await lerUltimo("kegel")).toEqual({ nivel: "iniciante" });
  });

  it("separa por usuária", async () => {
    await salvarDoDia("rotina", { dona: "u1" });
    (auth as any).currentUser = { uid: "u2" };
    expect(await lerDoDia("rotina")).toBeNull();
  });

  it("sem usuária logada não lê nem grava", async () => {
    (auth as any).currentUser = null;
    await salvarDoDia("rotina", { x: 1 });
    expect(await lerDoDia("rotina")).toBeNull();
  });
});

describe("checksDoTreino", () => {
  const exercicios = [
    { exercicio: "Agachamento" },
    { exercicio: "Prancha" },
    { exercicio: "Ponte" },
    { exercicio: "Remada" },
  ] as any;

  it("marca pelos nomes concluídos", () => {
    expect(checksDoTreino(exercicios, { exercicios_concluidos: ["Prancha", "Remada"] }))
      .toEqual({ 1: true, 3: true });
  });

  it("check-in antigo usa só o percentual", () => {
    expect(checksDoTreino(exercicios, { percentual: 50 })).toEqual({ 0: true, 1: true });
  });

  it("sem check-in não marca nada", () => {
    expect(checksDoTreino(exercicios, {})).toEqual({});
  });
});

import { getWeekDateRange } from "../../utils/getWeekDateRange";

describe("getWeekDateRange", () => {
  it("quinta à noite ainda é a semana de segunda a domingo", () => {
    expect(getWeekDateRange(new Date(2026, 8, 24, 21, 30))).toEqual({
      inicio: "2026-09-21",
      fim: "2026-09-27",
    });
  });

  it("domingo às 23h pertence à semana que começou na segunda anterior", () => {
    expect(getWeekDateRange(new Date(2026, 8, 27, 23, 0))).toEqual({
      inicio: "2026-09-21",
      fim: "2026-09-27",
    });
  });

  it("segunda de manhã abre a semana nova, atravessando o mês", () => {
    expect(getWeekDateRange(new Date(2026, 8, 28, 0, 5))).toEqual({
      inicio: "2026-09-28",
      fim: "2026-10-04",
    });
  });
});
