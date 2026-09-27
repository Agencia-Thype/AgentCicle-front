import { api } from "./api";
import { CHAVES, salvarDoDia } from "./cacheDoDia";
import { REVISAO_PROTOCOLO_KEGEL, rotaTreinoKegel } from "../config/kegel";
import { checksDoTreino } from "../utils/treinoChecks";
import { getWeekDateRange } from "../utils/getWeekDateRange";
import { getPerfil } from "./perfilService";

/**
 * Busca em segundo plano os dados das telas principais e grava no aparelho,
 * no mesmo formato que cada tela lê ao abrir. Assim até a primeira abertura
 * do dia de Treino, Rotina, Água, Kegel, Calendário etc. é imediata: a tela
 * mostra o que já está salvo e só confirma com a rede por baixo. O Relatório
 * é premium e fica de fora; ele guarda só o que a própria tela buscou.
 *
 * Roda ao abrir a Home e quando o app volta para a frente. Falhas são
 * ignoradas: nesse caso a própria tela busca quando for aberta.
 */
const INTERVALO_MINIMO_MS = 5 * 60 * 1000;
let ultimoAquecimento = 0;

// Pedido de fundo: um 403 aqui não pode abrir o modal de assinatura.
const SILENCIOSO = { silencioso: true } as any;

function guardar(chave: string, rota: string) {
  return api.get(rota, SILENCIOSO).then((resposta) => salvarDoDia(chave, resposta.data));
}

async function aquecerTreino() {
  const [treino, marcados] = await Promise.all([
    api.get("/treino-dia", SILENCIOSO),
    api.get("/treino-dia/marcados-hoje", SILENCIOSO),
  ]);
  const exercicios = treino.data.exercicios || [];
  await salvarDoDia(CHAVES.treinoDia, {
    exercicios,
    fase: treino.data.fase,
    tipoTreino: treino.data.tipo_treino,
    checks: checksDoTreino(exercicios, marcados.data || {}),
    jaSalvoHoje: !!marcados.data?.ja_salvo,
  });
}

export async function aquecerTelas(forcar = false): Promise<void> {
  const agora = Date.now();
  if (!forcar && agora - ultimoAquecimento < INTERVALO_MINIMO_MS) return;
  ultimoAquecimento = agora;

  const { inicio, fim } = getWeekDateRange();
  await Promise.allSettled([
    aquecerTreino(),
    guardar(CHAVES.rotinaHoje, "/rotina/hoje"),
    guardar(CHAVES.rotinaAgua, "/rotina/agua"),
    guardar(CHAVES.kegelStatusNiveis, "/kegel/status-niveis"),
    // A tela do Kegel sempre abre no nível inicial e troca depois, se preciso.
    guardar(
      CHAVES.kegelTreino("iniciante", REVISAO_PROTOCOLO_KEGEL),
      rotaTreinoKegel("iniciante")
    ),
    guardar(CHAVES.faseCiclo, "/fase-ciclo"),
    guardar(CHAVES.faseDetalhes, "/fase-atual/detalhes"),
    guardar(
      CHAVES.progressoSemanal,
      `/treino-dia/progresso-semanal?inicio=${inicio}&fim=${fim}`
    ),
    guardar(CHAVES.historicoRotina(7), "/rotina/historico?dias=7"),
    getPerfil(), // grava no cache de perfil que a tela do Perfil lê
  ]);
}
