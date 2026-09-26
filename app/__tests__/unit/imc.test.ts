import { calcularImc, converterNumeroDecimal } from "../../utils/imc";

describe("cálculo de IMC do perfil", () => {
  it("calcula automaticamente com altura e peso inteiros", () => {
    expect(calcularImc("1,64", "60")).toBe(22.3);
  });

  it("aceita decimais com vírgula ou ponto", () => {
    expect(calcularImc("1.64", "60,5")).toBe(22.5);
    expect(converterNumeroDecimal(" 60.5 ")).toBe(60.5);
  });

  it("remove o resultado quando um dos campos está vazio ou inválido", () => {
    expect(calcularImc("", "60")).toBeNull();
    expect(calcularImc("1,64", "")).toBeNull();
    expect(calcularImc("abc", "60")).toBeNull();
  });
});
