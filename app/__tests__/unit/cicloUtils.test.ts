import {
  dataLocalDeISO,
  duracaoCicloValida,
  getFasePorData,
  posicaoNoCiclo,
} from "../../utils/cicloUtils";

describe("cicloUtils", () => {
  describe("dataLocalDeISO", () => {
    it("mantém o dia do calendário, sem deslocar pelo fuso", () => {
      const data = dataLocalDeISO("2026-10-01");
      expect([data.getFullYear(), data.getMonth(), data.getDate()]).toEqual([2026, 9, 1]);
    });

    it("ignora o horário que vier junto", () => {
      expect(dataLocalDeISO("2026-10-01T00:00:00").getDate()).toBe(1);
    });
  });

  describe("duracaoCicloValida", () => {
    it.each([
      [30, 30],
      [21, 21],
      [35, 35],
      [20, 28],
      [36, 28],
      [null, 28],
      [undefined, 28],
    ])("%s -> %s", (entrada, esperado) => {
      expect(duracaoCicloValida(entrada)).toBe(esperado);
    });
  });

  describe("posicaoNoCiclo", () => {
    const inicio = new Date(2026, 8, 1);

    it("o primeiro dia da menstruação é o dia 1", () => {
      expect(posicaoNoCiclo(inicio, inicio, 28)).toEqual({
        dia: 1,
        diasAteProximaMenstruacao: 28,
      });
    });

    it("usa a duração do ciclo informada", () => {
      // 29 dias depois: num ciclo de 30 é o último dia; num de 28, já recomeçou.
      const alvo = new Date(2026, 8, 30);
      expect(posicaoNoCiclo(alvo, inicio, 30)).toEqual({
        dia: 30,
        diasAteProximaMenstruacao: 1,
      });
      expect(posicaoNoCiclo(alvo, inicio, 28)).toEqual({
        dia: 2,
        diasAteProximaMenstruacao: 27,
      });
    });

    it("não depende do horário do dia", () => {
      const noite = new Date(2026, 8, 5, 23, 59);
      expect(posicaoNoCiclo(noite, inicio, 28).dia).toBe(5);
    });
  });

  describe("getFasePorData", () => {
    it("pinta o início de cada ciclo como menstruação, conforme a duração", () => {
      const inicio = new Date(2026, 8, 1);
      expect(getFasePorData(new Date(2026, 9, 1), inicio, 30)).toBe("menstruacao");
      expect(getFasePorData(new Date(2026, 9, 1), inicio, 28)).not.toBeNull();
      expect(getFasePorData(new Date(2026, 8, 29), inicio, 28)).toBe("menstruacao");
    });
  });
});
