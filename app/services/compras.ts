/**
 * Compra da assinatura pelas lojas (App Store / Google Play).
 *
 * Aqui só acontece o que é do aparelho: abrir a loja, receber a compra e
 * avisar o servidor. Quem decide se a assinatura vale é o backend, que confere
 * o recibo junto à loja - por isso nada de liberar premium no app.
 *
 * Exige build de desenvolvimento ou de produção: compra in-app não funciona no
 * Expo Go, porque depende de código nativo.
 */
import { Platform } from "react-native";
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
} from "expo-iap";

import { api } from "./api";
import { COBRANCA_ATIVA } from "../config/monetizacao";

/** Os mesmos ids cadastrados nas lojas e em PRODUTOS_PADRAO no backend. */
export const PRODUTOS = {
  mensal: "ciclica_premium_mensal",
  anual: "ciclica_premium_anual",
} as const;

export type PlanoAssinatura = (typeof PRODUTOS)[keyof typeof PRODUTOS];

const SKUS: string[] = [PRODUTOS.mensal, PRODUTOS.anual];

let conectado = false;
let inscricoes: { remove: () => void }[] = [];

/**
 * Token que o servidor usa para conferir a compra: no Android é o
 * purchaseToken; no iOS, o transactionId, que é o `id` da transação.
 */
function tokenDaCompra(compra: Purchase): string | null {
  if (Platform.OS === "ios") return compra.id ?? compra.purchaseToken ?? null;
  return compra.purchaseToken ?? compra.id ?? null;
}

/**
 * Registra a compra no servidor e encerra a transação na loja.
 *
 * A transação só é finalizada depois do servidor confirmar: se o app cair no
 * meio, a loja reenvia a compra na próxima abertura e nada se perde.
 */
async function registrarNoServidor(compra: Purchase): Promise<boolean> {
  const token = tokenDaCompra(compra);
  if (!token) {
    console.error("Compra sem token; nada a registrar");
    return false;
  }

  try {
    await api.post("/assinatura/ativar", {
      plataforma: Platform.OS === "ios" ? "ios" : "android",
      token_compra: token,
    });
  } catch (erro: any) {
    // 409 = recibo de outra conta. Repetir não resolve, então a transação é
    // encerrada para a loja parar de reenviá-la.
    const status = erro?.response?.status;
    if (status !== 409) {
      console.error("Não foi possível registrar a compra:", status ?? erro);
      return false;
    }
  }

  await finishTransaction({ purchase: compra, isConsumable: false });
  return true;
}

/**
 * Abre a conexão com a loja e passa a ouvir as compras.
 *
 * As lojas entregam a compra por evento, não só no retorno do `requestPurchase`:
 * é assim que chega uma compra concluída depois de o app fechar, ou feita fora
 * dele. Chamar mais de uma vez não duplica nada.
 */
export async function conectarLoja(): Promise<boolean> {
  if (!COBRANCA_ATIVA || conectado) return conectado;

  try {
    await initConnection();
    conectado = true;
  } catch (erro) {
    console.warn("Loja indisponível no momento:", erro);
    return false;
  }

  inscricoes.push(
    purchaseUpdatedListener(async (compra) => {
      await registrarNoServidor(compra);
    })
  );
  inscricoes.push(
    purchaseErrorListener((erro) => {
      console.warn("Compra não concluída:", erro?.code ?? erro);
    })
  );

  return true;
}

export async function desconectarLoja(): Promise<void> {
  inscricoes.forEach((inscricao) => inscricao.remove());
  inscricoes = [];
  if (!conectado) return;
  conectado = false;
  await endConnection();
}

/** Planos com preço e período já formatados pela loja - nunca escritos no app. */
export async function planosDisponiveis() {
  if (!(await conectarLoja())) return [];
  return fetchProducts({ skus: SKUS, type: "subs" });
}

/**
 * Abre a compra do plano escolhido.
 *
 * Resolver aqui significa que a loja aceitou; a assinatura só vale depois que
 * o servidor confirmar o recibo, o que acontece no ouvinte de compras.
 */
export async function assinar(plano: PlanoAssinatura = PRODUTOS.mensal) {
  if (!(await conectarLoja())) {
    throw new Error("Não foi possível falar com a loja. Tente de novo em instantes.");
  }

  return requestPurchase({
    type: "subs",
    request: {
      apple: { sku: plano },
      google: { skus: [plano] },
    },
  });
}

/**
 * Reenvia ao servidor as compras que a loja ainda reconhece.
 *
 * É o "Restaurar compras" das lojas, e também conserta o caso de o pagamento
 * ter passado sem o servidor ter sido avisado.
 */
export async function restaurarCompras(): Promise<number> {
  if (!(await conectarLoja())) return 0;

  const compras = await getAvailablePurchases();
  let restauradas = 0;

  for (const compra of compras) {
    if (await registrarNoServidor(compra)) restauradas += 1;
  }

  return restauradas;
}
