import { googleAuthConfig } from "../../services/googleAuthConfig";

/**
 * Regressão: o expo-auth-session escolhe o client ID pela plataforma e lança
 * "Client Id property `androidClientId` must be defined" em tempo de render se
 * ele for undefined. Isso derrubou a tela de login inteira no Android.
 */
describe("Configuração do login com Google", () => {
  it("define um client ID para todas as plataformas", () => {
    expect(typeof googleAuthConfig.androidClientId).toBe("string");
    expect(typeof googleAuthConfig.iosClientId).toBe("string");
    expect(typeof googleAuthConfig.webClientId).toBe("string");
  });

  it("nunca deixa um client ID vazio", () => {
    for (const [chave, valor] of Object.entries(googleAuthConfig)) {
      expect(`${chave}=${valor}`).not.toBe(`${chave}=`);
      expect(valor.length).toBeGreaterThan(0);
    }
  });
});
