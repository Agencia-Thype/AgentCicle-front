import {
  LIMITE_LEMBRETES,
  planejarLembretes,
  type ItemParaLembrete,
} from "../../screens/Rotina/rotinaLembretes";
import {
  dataLocalISO,
  dataPorExtenso,
  ehNoite,
  formatarLitros,
  resumoDoItem,
  textoMinutos,
} from "../../screens/Rotina/rotinaFormato";

const HOJE = "2026-09-11";

const omega: ItemParaLembrete = {
  id: 1,
  nome: "Ômega 3",
  dosagem: "1 cápsula",
  frequencia: "todos_os_dias",
  dias_semana: [],
  horarios: ["08:00", "21:30"],
  data_inicio: "2026-09-01",
  data_fim: null,
  lembrete_ativo: true,
};

describe("planejarLembretes", () => {
  it("agenda um lembrete diário por horário", () => {
    const plano = planejarLembretes([omega], null, HOJE);

    expect(plano.map((l) => l.gatilho)).toEqual([
      { tipo: "diario", hora: 8, minuto: 0 },
      { tipo: "diario", hora: 21, minuto: 30 },
    ]);
    expect(plano[0].titulo).toContain("Ômega 3");
    expect(plano[0].corpo).toBe("1 cápsula · 08:00");
    expect(new Set(plano.map((l) => l.id)).size).toBe(2);
  });

  it("em dias específicos, agenda um lembrete semanal por dia", () => {
    const item = { ...omega, frequencia: "dias_especificos" as const, dias_semana: [1, 3], horarios: ["08:00"] };

    expect(planejarLembretes([item], null, HOJE).map((l) => l.gatilho)).toEqual([
      { tipo: "semanal", diaSemana: 1, hora: 8, minuto: 0 },
      { tipo: "semanal", diaSemana: 3, hora: 8, minuto: 0 },
    ]);
  });

  it("deixa de fora lembrete desligado, item que não começou e item encerrado", () => {
    const itens = [
      { ...omega, id: 2, lembrete_ativo: false },
      { ...omega, id: 3, data_inicio: "2026-09-12" },
      { ...omega, id: 4, data_fim: "2026-09-10" },
    ];
    expect(planejarLembretes(itens, null, HOJE)).toEqual([]);

    // Termina hoje: o lembrete de hoje ainda vale.
    expect(planejarLembretes([{ ...omega, data_fim: HOJE }], null, HOJE)).toHaveLength(2);
  });

  it("inclui os lembretes de água só quando ligados", () => {
    const agua = { lembretes: ["09:00", "14:00"], lembretes_ativos: true };

    const plano = planejarLembretes([], agua, HOJE);
    expect(plano.map((l) => l.id)).toEqual(["rotina-agua-09:00", "rotina-agua-14:00"]);
    expect(planejarLembretes([], { ...agua, lembretes_ativos: false }, HOJE)).toEqual([]);
  });

  it("respeita o limite de agendamentos, priorizando os itens sobre a água", () => {
    const itens = Array.from({ length: 70 }, (_, i) => ({ ...omega, id: i + 1, horarios: ["08:00"] }));
    const plano = planejarLembretes(itens, { lembretes: ["09:00"], lembretes_ativos: true }, HOJE);

    expect(plano).toHaveLength(LIMITE_LEMBRETES);
    expect(plano.every((l) => l.id.startsWith("rotina-item-"))).toBe(true);
  });
});

describe("formatação da rotina", () => {
  it("formata litros", () => {
    expect(formatarLitros(800)).toBe("800 ml");
    expect(formatarLitros(1400)).toBe("1,4 L");
    expect(formatarLitros(2000)).toBe("2 L");
  });

  it("descreve o tempo até a próxima dose", () => {
    expect(textoMinutos(20)).toBe("Próximo em 20 min");
    expect(textoMinutos(75)).toBe("Próximo em 1h 15min");
    expect(textoMinutos(120)).toBe("Próximo em 2h");
    expect(textoMinutos(0)).toBe("Agora");
    expect(textoMinutos(-15)).toBe("Atrasado há 15 min");
  });

  it("escreve datas por extenso e no fuso do aparelho", () => {
    expect(dataPorExtenso("2026-07-14", "2026-07-14")).toBe("Hoje, 14 de julho");
    expect(dataPorExtenso("2026-07-13", "2026-07-14")).toBe("13 de julho");
    expect(dataLocalISO(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("resume a frequência do item", () => {
    expect(resumoDoItem(omega)).toBe("Todos os dias · 08:00, 21:30");
    expect(
      resumoDoItem({ frequencia: "dias_especificos", dias_semana: [1, 3], horarios: ["08:00"] })
    ).toBe("Seg, Qua · 08:00");
  });

  it("distingue horários da noite", () => {
    expect(ehNoite("21:00")).toBe(true);
    expect(ehNoite("04:30")).toBe(true);
    expect(ehNoite("08:00")).toBe(false);
  });
});
