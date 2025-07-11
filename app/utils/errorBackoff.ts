/**
 * Utilitário para implementação de exponential backoff
 * para requisições que falham repetidamente
 */

// Mapa para armazenar estado de backoff para diferentes endpoints
const backoffStateMap = new Map<string, BackoffState>();

// Interface para o estado de backoff
interface BackoffState {
  attemptCount: number;
  lastAttemptTime: number;
  nextWaitTime: number;
  inCooldown: boolean;
}

// Constantes para o backoff
const BASE_WAIT_MS = 2000; // 2 segundos
const MAX_WAIT_MS = 60000; // 1 minuto
const RESET_AFTER_MS = 300000; // 5 minutos

/**
 * Verifica se uma requisição deve ser tentada ou aguardar
 * baseado na estratégia de exponential backoff
 * @param endpointKey Identificador único do endpoint
 * @returns true se deve esperar, false se pode tentar
 */
export function shouldWaitBeforeRetry(endpointKey: string): boolean {
  const now = Date.now();
  let state = backoffStateMap.get(endpointKey);

  // Se não existe estado ou já passou muito tempo, resetar
  if (!state || now - state.lastAttemptTime > RESET_AFTER_MS) {
    backoffStateMap.set(endpointKey, {
      attemptCount: 0,
      lastAttemptTime: 0,
      nextWaitTime: 0,
      inCooldown: false,
    });
    return false; // Pode tentar imediatamente
  }

  // Se estiver no período de cooldown, verificar se já passou
  if (state.inCooldown) {
    // Verifica se o tempo de espera já passou
    if (now - state.lastAttemptTime >= state.nextWaitTime) {
      state.inCooldown = false;
      return false; // Pode tentar novamente
    }

    return true; // Ainda deve aguardar
  }

  return false;
}

/**
 * Registra uma falha na requisição e calcula o próximo tempo de espera
 * @param endpointKey Identificador único do endpoint
 */
export function registerFailure(endpointKey: string): number {
  const now = Date.now();
  let state = backoffStateMap.get(endpointKey) || {
    attemptCount: 0,
    lastAttemptTime: 0,
    nextWaitTime: BASE_WAIT_MS,
    inCooldown: false,
  };

  // Incrementa contagem de tentativas
  state.attemptCount++;

  // Calcula o próximo tempo de espera usando exponential backoff
  // Formula: tempo_base * 2^tentativa, limitado ao máximo
  state.nextWaitTime = Math.min(
    BASE_WAIT_MS * Math.pow(2, state.attemptCount - 1),
    MAX_WAIT_MS
  );

  state.lastAttemptTime = now;
  state.inCooldown = true;

  // Atualiza o estado
  backoffStateMap.set(endpointKey, state);

  return state.nextWaitTime;
}

/**
 * Registra um sucesso na requisição, resetando o contador de backoff
 * @param endpointKey Identificador único do endpoint
 */
export function registerSuccess(endpointKey: string): void {
  backoffStateMap.set(endpointKey, {
    attemptCount: 0,
    lastAttemptTime: Date.now(),
    nextWaitTime: 0,
    inCooldown: false,
  });
}

/**
 * Obtém o tempo de espera atual para um endpoint
 * @param endpointKey Identificador único do endpoint
 * @returns Tempo de espera em ms ou 0 se não houver
 */
export function getCurrentBackoffDelay(endpointKey: string): number {
  const state = backoffStateMap.get(endpointKey);
  if (!state || !state.inCooldown) {
    return 0;
  }

  const now = Date.now();
  const timeElapsed = now - state.lastAttemptTime;
  const remainingTime = Math.max(0, state.nextWaitTime - timeElapsed);

  return remainingTime;
}

/**
 * Retorna informações sobre o estado de backoff
 * @param endpointKey Identificador único do endpoint
 * @returns Informações sobre o estado de backoff
 */
export function getBackoffInfo(endpointKey: string): {
  inBackoff: boolean;
  remainingTimeMs: number;
  attempts: number;
} {
  const state = backoffStateMap.get(endpointKey);
  if (!state) {
    return { inBackoff: false, remainingTimeMs: 0, attempts: 0 };
  }

  const now = Date.now();
  const timeElapsed = now - state.lastAttemptTime;
  const remainingTime = Math.max(0, state.nextWaitTime - timeElapsed);

  return {
    inBackoff: state.inCooldown,
    remainingTimeMs: state.inCooldown ? remainingTime : 0,
    attempts: state.attemptCount,
  };
}
