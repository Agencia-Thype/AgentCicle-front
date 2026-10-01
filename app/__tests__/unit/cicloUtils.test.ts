import {
  dataLocalDeISO,
  dividirCiclo,
  duracaoCicloValida,
  ehDiaFertil,
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
      [10, 10],
      [60, 60],
      [9, 28],
      [61, 28],
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

  describe("dividirCiclo", () => {
    // Mesma tabela dos testes do backend (tests/test_ciclo.py).
    it.each([
      [21, 7],
      [22, 8],
      [24, 10],
      [26, 12],
      [28, 14],
      [30, 16],
      [32, 18],
      [35, 21],
    ])("ciclo de %s dias: menstruação 1-5, ovulação no dia %s", (duracao, ovulacao) => {
      const ciclo = dividirCiclo(duracao);
      expect(ciclo.menstruacaoFim).toBe(5);
      expect(ciclo.ovulacao).toBe(ovulacao);
    });

    it("janela fértil de 5 dias antes da ovulação a 1 depois", () => {
      const ciclo = dividirCiclo(28);
      expect([ciclo.janelaFertilInicio, ciclo.janelaFertilFim]).toEqual([9, 15]);
    });

    it("usa a duração da menstruação informada no Perfil", () => {
      expect(dividirCiclo(28, 7)).toMatchObject({ menstruacaoFim: 7, ovulacao: 14 });
      // 21 - 14 = dia 7, que ainda seria menstruação: a ovulação vai para o 8.
      expect(dividirCiclo(21, 7)).toMatchObject({ menstruacaoFim: 7, ovulacao: 8 });
    });

    it("ciclo curto não põe a ovulação dentro da menstruação", () => {
      expect(dividirCiclo(15).ovulacao).toBe(6);
    });
  });

  describe("getFasePorData", () => {
    const inicio = new Date(2026, 8, 1);
    const noDia = (dia: number, duracao: number) =>
      getFasePorData(new Date(2026, 8, dia), inicio, duracao);

    it.each([
      [1, "menstruacao"],
      [5, "menstruacao"],
      [6, "folicular"],
      [13, "folicular"],
      [14, "ovulatoria"],
      [15, "lutea"],
      [28, "lutea"],
    ])("ciclo de 28 dias, dia %s: %s", (dia, fase) => {
      expect(noDia(dia, 28)).toBe(fase);
    });

    it("ciclo de 21 dias tem um só dia de folicular", () => {
      expect([5, 6, 7, 8].map((dia) => noDia(dia, 21))).toEqual([
        "menstruacao",
        "folicular",
        "ovulatoria",
        "lutea",
      ]);
    });

    it("recomeça na menstruação conforme a duração", () => {
      expect(getFasePorData(new Date(2026, 9, 1), inicio, 30)).toBe("menstruacao");
      expect(getFasePorData(new Date(2026, 8, 29), inicio, 28)).toBe("menstruacao");
    });
  });

  describe("ehDiaFertil", () => {
    it("marca só os dias 9 a 15 num ciclo de 28", () => {
      const inicio = new Date(2026, 8, 1);
      const ferteis = Array.from({ length: 28 }, (_, i) => i + 1).filter((dia) =>
        ehDiaFertil(new Date(2026, 8, dia), inicio, 28)
      );
      expect(ferteis).toEqual([9, 10, 11, 12, 13, 14, 15]);
    });
  });
});
