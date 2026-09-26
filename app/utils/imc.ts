export const converterNumeroDecimal = (valor: string): number | null => {
  const normalizado = valor.trim().replace(/\s/g, "").replace(",", ".");

  if (!/^\d+(?:\.\d+)?$/.test(normalizado)) return null;

  const numero = Number(normalizado);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};

export const calcularImc = (altura: string, peso: string): number | null => {
  const alturaEmMetros = converterNumeroDecimal(altura);
  const pesoEmKg = converterNumeroDecimal(peso);

  if (alturaEmMetros === null || pesoEmKg === null) return null;

  return Number((pesoEmKg / (alturaEmMetros * alturaEmMetros)).toFixed(1));
};

