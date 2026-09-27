import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebase";

/**
 * Nome de cache no aparelho separado por conta. Duas contas no mesmo celular
 * nunca leem os dados uma da outra, mesmo que o logout não passe pela limpeza
 * (ex.: token recusado pelo backend desloga direto).
 */
export function daConta(chave: string): string {
  return `${chave}:${auth.currentUser?.uid ?? "sem-conta"}`;
}

// Nomes usados antes de os caches serem separados por conta.
const CHAVES_SEM_CONTA = [
  "fase_lunar_cache",
  "home_pontuacao_cache",
  "user",
  "assinatura_status",
  "assinatura_status_cache",
  "@AgentCicle:perfil_cache",
  "@AgentCicle:fase_atual",
  "@AgentCicle:mensagem_fase",
  "@AgentCicle:ultima_sincronizacao",
  "@AgentCicle:notificacao_fase",
  "@AgentCicle:fase_ciclo_cache",
  "@AgentCicle:fase_detalhes_cache",
  "@AgentCicle:ia_mensagem_balao",
  "@AgentCicle:ia_mensagem_boas_vindas",
  "@AgentCicle:rotina_hoje",
  "@AgentCicle:rotina_itens",
];

/** Apaga os caches antigos, sem conta no nome, que ficaram de versões anteriores. */
export function limparCachesSemConta(): Promise<void> {
  return AsyncStorage.multiRemove(CHAVES_SEM_CONTA).catch(() => {});
}
