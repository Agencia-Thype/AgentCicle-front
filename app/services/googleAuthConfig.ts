import { Platform } from "react-native";

/**
 * Configuração do login com Google.
 *
 * O `expo-auth-session` escolhe o client ID pela plataforma — `androidClientId`
 * no Android, `iosClientId` no iOS, `webClientId` no restante — e **lança um
 * erro em tempo de render** se o ID da plataforma atual não estiver definido.
 * Por isso a config precisa estar sempre completa, mesmo sem credenciais reais.
 *
 * Cada plataforma exige um client ID OAuth próprio, criado no Google Cloud
 * Console (APIs & Services -> Credentials):
 *
 *   - Android: tipo "Android", com o package `com.agentcicle.app` e a impressão
 *     digital SHA-1 do certificado de assinatura (o EAS mostra a dele em
 *     `eas credentials`);
 *   - iOS: tipo "iOS", com o bundle ID `com.agentcicle.app`;
 *   - Web: tipo "Web application" — é o gerado automaticamente pelo Firebase ao
 *     ativar o provedor Google.
 */

const PLACEHOLDER = "not-configured.apps.googleusercontent.com";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Sempre com as três chaves preenchidas, para o hook nunca lançar. */
export const googleAuthConfig = {
  webClientId: webClientId || PLACEHOLDER,
  androidClientId: androidClientId || PLACEHOLDER,
  iosClientId: iosClientId || PLACEHOLDER,
};

/**
 * Só é `true` quando o client ID da plataforma em uso existe de verdade. O botão
 * fica desabilitado caso contrário, em vez de abrir um fluxo que falharia.
 */
export const googleConfigurado =
  Platform.select({
    android: !!androidClientId,
    ios: !!iosClientId,
    default: !!webClientId,
  }) ?? false;
