import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const CACHE_HOJE = "@AgentCicle:rotina_hoje";
const CACHE_ITENS = "@AgentCicle:rotina_itens";
const CACHE_VALIDO_MS = 60_000;
let requisicaoHoje: Promise<RotinaDoDia> | null = null;

async function lerCache<T>(chave: string): Promise<{ data: T; timestamp: number } | null> {
  try {
    const valor = await AsyncStorage.getItem(chave);
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

async function salvarCache<T>(chave: string, data: T): Promise<T> {
  await AsyncStorage.setItem(chave, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

async function carregarHoje(forcar = false): Promise<RotinaDoDia> {
  const cache = await lerCache<RotinaDoDia>(CACHE_HOJE);
  if (!forcar && cache && Date.now() - cache.timestamp < CACHE_VALIDO_MS) return cache.data;
  if (requisicaoHoje) return requisicaoHoje;

  requisicaoHoje = api
    .get<RotinaDoDia>("/rotina/hoje")
    .then((resposta) => salvarCache(CACHE_HOJE, resposta.data))
    .catch((erro) => {
      if (cache) return cache.data;
      throw erro;
    })
    .finally(() => {
      requisicaoHoje = null;
    });
  return requisicaoHoje;
}

async function carregarItens(): Promise<ItemRotina[]> {
  const cache = await lerCache<ItemRotina[]>(CACHE_ITENS);
  try {
    const itens = (await api.get<{ itens: ItemRotina[] }>("/rotina/itens")).data.itens;
    return salvarCache(CACHE_ITENS, itens);
  } catch (erro) {
    if (cache) return cache.data;
    throw erro;
  }
}

async function atualizarItemNoCache(item: ItemRotina): Promise<void> {
  const cache = await lerCache<ItemRotina[]>(CACHE_ITENS);
  const itens = cache?.data ?? [];
  const atualizados = itens.some((atual) => atual.id === item.id)
    ? itens.map((atual) => (atual.id === item.id ? item : atual))
    : [...itens, item];
  await salvarCache(CACHE_ITENS, atualizados);
  await AsyncStorage.removeItem(CACHE_HOJE);
}

export const rotinaService = {
  hoje: carregarHoje,

  itens: carregarItens,
  item: async (id: number) => {
    try {
      const item = (await api.get<ItemRotina>(`/rotina/itens/${id}`)).data;
      await atualizarItemNoCache(item);
      return item;
    } catch (erro) {
      const cache = await lerCache<ItemRotina[]>(CACHE_ITENS);
      const item = cache?.data.find((atual) => atual.id === id);
      if (item) return item;
      throw erro;
    }
  },
  criarItem: async (dados: ItemRotinaPayload) => {
    const item = (await api.post<ItemRotina>("/rotina/itens", dados)).data;
    await atualizarItemNoCache(item);
    return item;
  },
  atualizarItem: async (id: number, dados: ItemRotinaPayload) => {
    const item = (await api.put<ItemRotina>(`/rotina/itens/${id}`, dados)).data;
    await atualizarItemNoCache(item);
    return item;
  },
  excluirItem: async (id: number) => {
    await api.delete(`/rotina/itens/${id}`);
    const cache = await lerCache<ItemRotina[]>(CACHE_ITENS);
    if (cache) await salvarCache(CACHE_ITENS, cache.data.filter((item) => item.id !== id));
    await AsyncStorage.removeItem(CACHE_HOJE);
  },

  marcarDose: async (itemId: number, horario: string) => {
    const resumo = (await api.post<{ resumo: RotinaDoDia }>("/rotina/doses", { item_id: itemId, horario })).data.resumo;
    return salvarCache(CACHE_HOJE, resumo);
  },
  desfazerDose: async (itemId: number, horario: string) => {
    const resumo = (
      await api.post<{ resumo: RotinaDoDia }>("/rotina/doses/desfazer", {
        item_id: itemId,
        horario,
      })
    ).data.resumo;
    return salvarCache(CACHE_HOJE, resumo);
  },

  agua: async () => (await api.get<AguaDoDia>("/rotina/agua")).data,
  registrarAgua: async (ml: number) => {
    const agua = (await api.post<AguaDoDia>("/rotina/agua", { ml })).data;
    const cache = await lerCache<RotinaDoDia>(CACHE_HOJE);
    if (cache) await salvarCache(CACHE_HOJE, { ...cache.data, agua });
    return agua;
  },
  desfazerAgua: async (registroId: number) => {
    const agua = (await api.delete<AguaDoDia>(`/rotina/agua/${registroId}`)).data;
    const cache = await lerCache<RotinaDoDia>(CACHE_HOJE);
    if (cache) await salvarCache(CACHE_HOJE, { ...cache.data, agua });
    return agua;
  },
  configurarAgua: async (config: ConfigAgua) => {
    const agua = (await api.put<AguaDoDia>("/rotina/agua/config", config)).data;
    const cache = await lerCache<RotinaDoDia>(CACHE_HOJE);
    if (cache) await salvarCache(CACHE_HOJE, { ...cache.data, agua });
    return agua;
  },

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
