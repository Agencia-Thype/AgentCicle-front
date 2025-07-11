import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Utilitário para gerenciar cache de requisições API de forma padronizada
 */

// Duração padrão do cache (30 segundos)
export const DEFAULT_CACHE_DURATION = 30000;

// Interface para objetos de cache
export interface CachedData<T> {
  data: T;
  timestamp: number;
  expireAt: number;
}

/**
 * Tenta obter dados do cache
 * @param cacheKey Chave para buscar no AsyncStorage
 * @returns Dados do cache se válidos, null se expirado ou inexistente
 */
export async function getFromCache<T>(cacheKey: string): Promise<T | null> {
  try {
    const cacheStr = await AsyncStorage.getItem(cacheKey);
    if (!cacheStr) return null;

    const cache = JSON.parse(cacheStr) as CachedData<T>;
    const agora = Date.now();

    if (cache && cache.expireAt > agora) {
      // Log do tempo restante de cache válido
      const segundosRestantes = Math.round((cache.expireAt - agora) / 1000);
      console.log(
        `[CacheHelper] Cache válido para ${cacheKey} (expira em ${segundosRestantes}s)`
      );
      return cache.data;
    }

    console.log(`[CacheHelper] Cache expirado para ${cacheKey}`);
    return null;
  } catch (e) {
    console.error(`[CacheHelper] Erro ao buscar cache para ${cacheKey}:`, e);
    return null;
  }
}

/**
 * Salva dados no cache
 * @param cacheKey Chave para salvar no AsyncStorage
 * @param data Dados a serem armazenados
 * @param duration Duração do cache em ms (padrão: 30s)
 */
export async function saveToCache<T>(
  cacheKey: string,
  data: T,
  duration: number = DEFAULT_CACHE_DURATION
): Promise<void> {
  try {
    const agora = Date.now();
    const cacheObj: CachedData<T> = {
      data,
      timestamp: agora,
      expireAt: agora + duration,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheObj));
    console.log(
      `[CacheHelper] Dados salvos em cache para ${cacheKey} (válido por ${duration / 1000}s)`
    );
  } catch (e) {
    console.error(`[CacheHelper] Erro ao salvar cache para ${cacheKey}:`, e);
  }
}

/**
 * Verifica se um intervalo mínimo foi respeitado desde a última chamada
 * @param lastCheck Timestamp da última chamada
 * @param minInterval Intervalo mínimo em ms
 * @returns true se o intervalo foi respeitado, false caso contrário
 */
export function shouldSkipRequest(
  lastCheck: number,
  minInterval: number = 5000
): boolean {
  const agora = Date.now();
  return agora - lastCheck < minInterval;
}

/**
 * Limpa um item específico do cache
 * @param cacheKey Chave para limpar do AsyncStorage
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey);
    console.log(`[CacheHelper] Cache invalidado para ${cacheKey}`);
  } catch (e) {
    console.error(`[CacheHelper] Erro ao invalidar cache para ${cacheKey}:`, e);
  }
}
