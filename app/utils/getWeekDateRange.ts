/**
 * Segunda a domingo da semana atual, em datas locais (YYYY-MM-DD).
 *
 * As datas são montadas pelo calendário local, nunca por toISOString(): em
 * UTC-3, a partir das 21h o toISOString já está no dia seguinte e a semana
 * inteira escorregava um dia, tirando a segunda-feira do intervalo (o treino
 * feito nela sumia do progresso) e deslocando os checks entre os dias.
 */
export function getWeekDateRange(hoje: Date = new Date()): { inicio: string; fim: string } {
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda...
  const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;

  const segunda = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diasDesdeSegunda);
  const domingo = new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + 6);

  const formatar = (data: Date) =>
    [
      data.getFullYear(),
      String(data.getMonth() + 1).padStart(2, "0"),
      String(data.getDate()).padStart(2, "0"),
    ].join("-");

  return {
    inicio: formatar(segunda),
    fim: formatar(domingo),
  };
}
