import { falaDaEtapa } from "../../utils/voz";
import type { EstadoKegel, EtapaKegel } from "../../screens/Kegel/kegel.types";

jest.mock("expo-speech", () => ({ speak: jest.fn(), stop: jest.fn() }));

function etapa(estado: EstadoKegel, rotulo = ""): EtapaKegel {
  return {
    estado,
    rotulo,
    duracaoMs: 1500,
    serie: 1,
    totalSeries: 1,
    bloco: 1,
    totalBlocos: 1,
    repeticao: 1,
    totalRepeticoes: 1,
  };
}

describe("falaDaEtapa", () => {
  it("fala o comando de cada fase do movimento", () => {
    expect(falaDaEtapa(etapa("contract"))).toBe("Contrai");
    expect(falaDaEtapa(etapa("release", "Solta"))).toBe("Solta");
    expect(falaDaEtapa(etapa("release", "Relaxe completamente"))).toBe("Relaxa");
    expect(falaDaEtapa(etapa("rest"))).toBe("Relaxa");
  });

  it("fica em silêncio na preparação", () => {
    expect(falaDaEtapa(etapa("prepare"))).toBeNull();
  });
});
