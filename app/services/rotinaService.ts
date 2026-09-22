import { api } from "./api";

/**
 * Rotina de cuidados: suplementos, vitaminas, medicamentos e hidratação.
 * Espelha as rotas /rotina do backend.
 */

export type CategoriaItem = "suplemento" | "medicamento" | "vitamina";
export type Frequencia = "todos_os_dias" | "dias_especificos";
export type StatusDose = "tomado" | "pendente" | "atrasado";

export interface ItemRotina {
  id: number;
  nome: string;
  categoria: CategoriaItem;
  dosagem: string | null;
  frequencia: Frequencia;
  /** 0 = domingo ... 6 = sábado (Date.getDay). */
  dias_semana: number[];
  /** "HH:MM", em ordem. */
  horarios: string[];
  /** YYYY-MM-DD */
  data_inicio: string;
  data_fim: string | null;
  observacoes: string | null;
  indicado_medico: boolean;
  lembrete_ativo: boolean;
  controle_estoque: boolean;
  estoque_atual: number | null;
  estoque_alerta: number | null;
  estoque_baixo: boolean;
}

export type ItemRotinaPayload = Omit<ItemRotina, "id" | "estoque_baixo">;

export interface DoseDoDia {
  item_id: number;
  nome: string;
  categoria: CategoriaItem;
  dosagem: string | null;
  horario: string;
  status: StatusDose;
  estoque_baixo: boolean;
}

export interface AguaDoDia {
  data: string;
  total_ml: number;
  meta_ml: number;
  faltam_ml: number;
  percentual: number;
  registros: { id: number; ml: number; hora: string | null }[];
  lembretes: string[];
  lembretes_ativos: boolean;
  meta_personalizada: boolean;
  meta_sugerida: { meta_ml: number; motivo: string };
  sequencia_dias: number;
}

export interface RotinaDoDia {
  data: string;
  doses: DoseDoDia[];
  total: number;
  tomadas: number;
  /** `minutos` até o horário; negativo quando está atrasada. */
  proxima: (DoseDoDia & { minutos: number }) | null;
  agua: AguaDoDia;
}

export interface DiaHistorico {
  data: string;
  doses_previstas: number;
  doses_tomadas: number;
  adesao: number | null;
  esquecidas: { item_id: number; nome: string; horario: string }[];
  agua_ml: number;
  bateu_meta_agua: boolean;
}

export interface HistoricoRotina {
  /** Do mais recente para o mais antigo. */
  dias: DiaHistorico[];
  itens: {
    item_id: number;
    nome: string;
    categoria: CategoriaItem;
    previstas: number;
    tomadas: number;
    adesao: number | null;
  }[];
  resumo: {
    adesao: number | null;
    doses_previstas: number;
    doses_tomadas: number;
    meta_agua_ml: number;
    dias_meta_agua: number;
    media_agua_ml: number;
  };
  sequencia_rotina: number;
  sequencia_agua: number;
}

export interface ConfigAgua {
  meta_ml: number;
  lembretes: string[];
  lembretes_ativos: boolean;
}

export const rotinaService = {
  hoje: async () => (await api.get<RotinaDoDia>("/rotina/hoje")).data,

  itens: async () => (await api.get<{ itens: ItemRotina[] }>("/rotina/itens")).data.itens,
  item: async (id: number) => (await api.get<ItemRotina>(`/rotina/itens/${id}`)).data,
  criarItem: async (dados: ItemRotinaPayload) =>
    (await api.post<ItemRotina>("/rotina/itens", dados)).data,
  atualizarItem: async (id: number, dados: ItemRotinaPayload) =>
    (await api.put<ItemRotina>(`/rotina/itens/${id}`, dados)).data,
  excluirItem: async (id: number) => {
    await api.delete(`/rotina/itens/${id}`);
  },

  marcarDose: async (itemId: number, horario: string) =>
    (await api.post<{ resumo: RotinaDoDia }>("/rotina/doses", { item_id: itemId, horario })).data
      .resumo,
  desfazerDose: async (itemId: number, horario: string) =>
    (
      await api.post<{ resumo: RotinaDoDia }>("/rotina/doses/desfazer", {
        item_id: itemId,
        horario,
      })
    ).data.resumo,

  agua: async () => (await api.get<AguaDoDia>("/rotina/agua")).data,
  registrarAgua: async (ml: number) => (await api.post<AguaDoDia>("/rotina/agua", { ml })).data,
  desfazerAgua: async (registroId: number) =>
    (await api.delete<AguaDoDia>(`/rotina/agua/${registroId}`)).data,
  configurarAgua: async (config: ConfigAgua) =>
    (await api.put<AguaDoDia>("/rotina/agua/config", config)).data,

  historico: async (dias = 7) =>
    (await api.get<HistoricoRotina>(`/rotina/historico?dias=${dias}`)).data,
};

/** Texto de erro da API. O 422 do FastAPI vem como lista de erros de validação. */
export function mensagemDeErro(error: any, padrao: string): string {
  const detalhe = error?.response?.data?.detail;
  if (typeof detalhe === "string") return detalhe;
  if (Array.isArray(detalhe) && detalhe[0]?.msg) {
    return String(detalhe[0].msg).replace(/^Value error, /, "");
  }
  return padrao;
}
