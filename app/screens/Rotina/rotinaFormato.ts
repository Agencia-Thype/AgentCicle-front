import type { CategoriaItem, ItemRotina } from "../../services/rotinaService";

/**
 * Formatação da rotina de cuidados. Sem React e sem dependências nativas, para
 * ser testável isoladamente.
 */

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const DIAS_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];
export const DIAS_SEMANA_NOME = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const DIAS_SEMANA_ABREVIADO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const CATEGORIAS: Record<CategoriaItem, { rotulo: string; icone: string }> = {
  suplemento: { rotulo: "Suplemento", icone: "pill" },
  medicamento: { rotulo: "Medicamento", icone: "medical-bag" },
  vitamina: { rotulo: "Vitamina", icone: "leaf" },
};

/** Data local do aparelho em YYYY-MM-DD (toISOString usaria UTC e viraria o dia às 21h). */
export function dataLocalISO(data: Date = new Date()): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** YYYY-MM-DD -> Date à meia-noite local. */
export function dataDeISO(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "14/07/2025" */
export function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "Hoje, 14 de julho" ou "14 de julho". */
export function dataPorExtenso(iso: string, hoje: string = dataLocalISO()): string {
  const data = dataDeISO(iso);
  const texto = `${data.getDate()} de ${MESES[data.getMonth()]}`;
  return iso === hoje ? `Hoje, ${texto}` : texto;
}

/** "HH:MM" de um Date. */
export function horaDeDate(data: Date): string {
  return `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
}

/** 800 -> "800 ml"; 1400 -> "1,4 L"; 2000 -> "2 L". */
export function formatarLitros(ml: number): string {
  if (ml < 1000) return `${ml} ml`;
  const litros = Math.round(ml / 100) / 10;
  return `${String(litros).replace(".", ",")} L`;
}

/** Rótulo do card "próximo": "Próximo em 20 min", "Atrasado há 15 min". */
export function textoMinutos(minutos: number): string {
  if (minutos < 0) {
    const atraso = -minutos;
    return atraso < 60 ? `Atrasado há ${atraso} min` : `Atrasado há ${Math.floor(atraso / 60)}h`;
  }
  if (minutos === 0) return "Agora";
  if (minutos < 60) return `Próximo em ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `Próximo em ${horas}h ${resto}min` : `Próximo em ${horas}h`;
}

/** Entre 18h e 5h o ícone da dose é a lua; no resto do dia, o sol. */
export function ehNoite(horario: string): boolean {
  const hora = Number(horario.split(":")[0]);
  return hora >= 18 || hora < 5;
}

/** "Todos os dias · 08:00, 21:00" ou "Seg, Qua · 08:00". */
export function resumoDoItem(
  item: Pick<ItemRotina, "frequencia" | "dias_semana" | "horarios">
): string {
  const dias =
    item.frequencia === "dias_especificos"
      ? item.dias_semana.map((dia) => DIAS_SEMANA_ABREVIADO[dia]).join(", ")
      : "Todos os dias";
  return `${dias} · ${item.horarios.join(", ")}`;
}
