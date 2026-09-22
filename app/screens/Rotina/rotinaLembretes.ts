import type { AguaDoDia, ItemRotina } from "../../services/rotinaService";

/**
 * Plano de lembretes da rotina: quais notificações devem existir, sem tocar no
 * expo-notifications (o agendamento fica em services/notificacoes.ts). Separado
 * assim para poder ser testado.
 *
 * As repetições do sistema (diária/semanal) não têm data de fim. Por isso item
 * que ainda não começou ou já terminou fica fora do plano, e o plano é refeito
 * sempre que o app abre ou a rotina muda.
 */

export type GatilhoLembrete =
  | { tipo: "diario"; hora: number; minuto: number }
  /** diaSemana: 0 = domingo ... 6 = sábado. */
  | { tipo: "semanal"; diaSemana: number; hora: number; minuto: number };

export interface Lembrete {
  /** Identificador estável: reagendar o mesmo lembrete não duplica. */
  id: string;
  titulo: string;
  corpo: string;
  gatilho: GatilhoLembrete;
}

export type ItemParaLembrete = Pick<
  ItemRotina,
  | "id"
  | "nome"
  | "dosagem"
  | "frequencia"
  | "dias_semana"
  | "horarios"
  | "data_inicio"
  | "data_fim"
  | "lembrete_ativo"
>;

export type AguaParaLembrete = Pick<AguaDoDia, "lembretes" | "lembretes_ativos">;

/** Todo identificador da rotina começa assim, para cancelar só o que é nosso. */
export const PREFIXO_LEMBRETE = "rotina-";

/**
 * O iOS guarda no máximo 64 notificações agendadas. Fica uma folga, e os
 * remédios têm prioridade sobre a água quando o limite aperta.
 */
export const LIMITE_LEMBRETES = 60;

function horaMinuto(horario: string): { hora: number; minuto: number } {
  const [hora, minuto] = horario.split(":").map(Number);
  return { hora, minuto };
}

export function planejarLembretes(
  itens: ItemParaLembrete[],
  agua: AguaParaLembrete | null,
  hoje: string
): Lembrete[] {
  const lembretes: Lembrete[] = [];

  for (const item of itens) {
    if (!item.lembrete_ativo) continue;
    if (item.data_inicio > hoje) continue;
    if (item.data_fim && item.data_fim < hoje) continue;

    for (const horario of item.horarios) {
      const { hora, minuto } = horaMinuto(horario);
      const base = {
        titulo: `Hora do seu cuidado: ${item.nome}`,
        corpo: item.dosagem ? `${item.dosagem} · ${horario}` : `Seu lembrete das ${horario}`,
      };

      if (item.frequencia === "dias_especificos") {
        for (const diaSemana of item.dias_semana) {
          lembretes.push({
            ...base,
            id: `${PREFIXO_LEMBRETE}item-${item.id}-${horario}-d${diaSemana}`,
            gatilho: { tipo: "semanal", diaSemana, hora, minuto },
          });
        }
      } else {
        lembretes.push({
          ...base,
          id: `${PREFIXO_LEMBRETE}item-${item.id}-${horario}`,
          gatilho: { tipo: "diario", hora, minuto },
        });
      }
    }
  }

  if (agua?.lembretes_ativos) {
    for (const horario of agua.lembretes) {
      lembretes.push({
        id: `${PREFIXO_LEMBRETE}agua-${horario}`,
        titulo: "Hora de beber água 💧",
        corpo: "Um copo agora ajuda você a chegar na meta do dia.",
        gatilho: { tipo: "diario", ...horaMinuto(horario) },
      });
    }
  }

  return lembretes.slice(0, LIMITE_LEMBRETES);
}
