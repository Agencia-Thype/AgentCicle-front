/**
 * Flag de monetização do app.
 *
 * Enquanto for `false` o app é publicado totalmente gratuito e a UI não pode
 * exibir preço, banner de trial, tela de upgrade ou botão de assinar. Um app
 * sem paywall não precisa de compra in-app; um app que menciona preço fora do
 * StoreKit / Play Billing é reprovado (App Store 3.1.1 / Google Play Payments).
 *
 * Para ligar depois: definir EXPO_PUBLIC_COBRANCA_ATIVA=true aqui e
 * COBRANCA_ATIVA=true no backend, com a validação de recibo implementada.
 */
export const COBRANCA_ATIVA =
  process.env.EXPO_PUBLIC_COBRANCA_ATIVA?.trim().toLowerCase() === "true";
