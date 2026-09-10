import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

/**
 * Sign in with Apple.
 *
 * Obrigatório pela diretriz 4.8 da App Store: apps que oferecem login social de
 * terceiros (aqui, o Google) precisam oferecer também o da Apple. Só existe no
 * iOS - no Android o botão não deve nem aparecer.
 */

export type ResultadoApple = {
  identityToken: string;
  /**
   * O nonce em texto puro. A Apple recebe o hash SHA-256 e o embute no token;
   * o Firebase recebe o original e compara. É o que impede replay do token.
   */
  rawNonce: string;
  /** Necessário para revogar o token quando a usuária excluir a conta. */
  authorizationCode: string | null;
  /** A Apple só envia o nome no PRIMEIRO login. Depois disso vem sempre null. */
  nomeCompleto: string | null;
};

export async function appleDisponivel(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

function gerarNonceCru(): string {
  const bytes = Crypto.getRandomBytes(32);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Abre a folha nativa da Apple. Devolve null quando a usuária cancela.
 */
export async function iniciarLoginApple(): Promise<ResultadoApple | null> {
  const rawNonce = gerarNonceCru();
  const nonceHasheado = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  try {
    const credencial = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: nonceHasheado,
    });

    if (!credencial.identityToken) {
      return null;
    }

    const nome = [credencial.fullName?.givenName, credencial.fullName?.familyName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      identityToken: credencial.identityToken,
      rawNonce,
      authorizationCode: credencial.authorizationCode,
      nomeCompleto: nome || null,
    };
  } catch (error: any) {
    // Cancelar não é erro: a usuária apenas fechou a folha.
    if (error?.code === "ERR_REQUEST_CANCELED") {
      return null;
    }
    throw error;
  }
}
