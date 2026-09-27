jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined) },
}));
jest.mock("../../utils/premiumModalController", () => ({ PremiumModalController: { showUpgradeModal: jest.fn() } }));
jest.mock("../../config/monetizacao", () => ({ COBRANCA_ATIVA: false }));
jest.mock("firebase/auth", () => ({ signOut: jest.fn(async () => undefined) }));
jest.mock("../../services/firebase", () => ({ auth: { currentUser: null } }));

import { api } from "../../services/api";
import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";

/** Adaptador falso: registra o header enviado e responde 200. */
const enviados: (string | undefined)[] = [];
beforeEach(() => {
  enviados.length = 0;
  (signOut as jest.Mock).mockClear();
  api.defaults.adapter = async (config: any) => {
    enviados.push(config.headers?.Authorization);
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
});

const usuaria = (getIdToken: jest.Mock) => ((auth as any).currentUser = { getIdToken });

it("envia o token quando o Firebase entrega de primeira", async () => {
  usuaria(jest.fn(async () => "tok-1"));
  await api.delete("/usuario/me");
  expect(enviados).toEqual(["Bearer tok-1"]);
});

it("renova e envia quando a primeira tentativa falha", async () => {
  const getIdToken = jest.fn()
    .mockRejectedValueOnce(Object.assign(new Error("x"), { code: "auth/network-request-failed" }))
    .mockResolvedValueOnce("tok-renovado");
  usuaria(getIdToken);
  await api.get("/perfil");
  expect(getIdToken).toHaveBeenLastCalledWith(true);
  expect(enviados).toEqual(["Bearer tok-renovado"]);
});

it("sem token não envia o pedido e não desloga", async () => {
  usuaria(jest.fn(async () => { throw Object.assign(new Error("x"), { code: "auth/network-request-failed" }); }));
  await expect(api.delete("/usuario/me")).rejects.toMatchObject({
    message: expect.stringContaining("auth/network-request-failed"),
  });
  expect(enviados).toEqual([]);
  expect(signOut).not.toHaveBeenCalled();
});

it("respeita o token que quem chamou já mandou", async () => {
  const getIdToken = jest.fn(async () => "tok-interceptor");
  usuaria(getIdToken);
  await api.delete("/usuario/me", { headers: { Authorization: "Bearer tok-fresco" } });
  expect(enviados).toEqual(["Bearer tok-fresco"]);
  expect(getIdToken).not.toHaveBeenCalled();
});
