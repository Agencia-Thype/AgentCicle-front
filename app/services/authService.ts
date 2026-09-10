import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  revokeAccessToken,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import Toast from "react-native-toast-message";
import { auth } from "./firebase";
import { api } from "./api";
import { iniciarLoginApple, type ResultadoApple } from "./appleAuth";

const APPLE_PROVIDER_ID = "apple.com";

function mensagemErroFirebase(codigo: string): string {
  switch (codigo) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Esse e-mail já está cadastrado.";
    case "auth/weak-password":
      return "Senha muito fraca. Use pelo menos 6 caracteres.";
    default:
      return "Não foi possível concluir. Tente novamente.";
  }
}

// Nome a gravar quando a sincronização dispara antes de o displayName existir:
// no cadastro por e-mail e no 1º login com Apple o onAuthStateChanged chega
// primeiro, e o backend não atualiza o nome de quem já foi criada.
let nomePendente: string | null = null;
let sincronizacao: { uid: string; promessa: Promise<void> } | null = null;

/**
 * Garante a linha da usuária no backend (POST /auth/sync) - sem ela todas as
 * rotas protegidas respondem 404. Precisa rodar em toda sessão, inclusive a
 * restaurada ao abrir o app, que não passa pela tela de login. Uma requisição
 * por usuária: chamadas concorrentes reaproveitam a mesma, falha libera retry.
 */
export function garantirPerfilSincronizado(): Promise<void> {
  const usuario = auth.currentUser;
  if (!usuario) return Promise.resolve();
  if (sincronizacao?.uid === usuario.uid) return sincronizacao.promessa;

  const nome = nomePendente || usuario.displayName || "Usuária";
  const promessa = api
    .post("/auth/sync", { nome }, { timeout: 10000 })
    .then(() => {
      nomePendente = null;
    })
    .catch((error) => {
      console.error("Erro ao sincronizar perfil com o backend:", error);
      if (sincronizacao?.promessa === promessa) sincronizacao = null;
    });

  sincronizacao = { uid: usuario.uid, promessa };
  return promessa;
}

export async function login(email: string, senha: string): Promise<User | null> {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    await garantirPerfilSincronizado();
    return credencial.user;
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Erro no login",
      text2: mensagemErroFirebase(error.code),
    });
    return null;
  }
}

export async function registerUser(data: {
  nome: string;
  email: string;
  senha: string;
}): Promise<User | null> {
  try {
    nomePendente = data.nome;
    const credencial = await createUserWithEmailAndPassword(auth, data.email, data.senha);
    await sendEmailVerification(credencial.user);
    await garantirPerfilSincronizado();
    return credencial.user;
  } catch (error: any) {
    nomePendente = null;
    Toast.show({
      type: "error",
      text1: "Erro no cadastro",
      text2: mensagemErroFirebase(error.code),
    });
    return null;
  }
}

export async function signInWithGoogleCredential(idToken: string): Promise<User | null> {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const resultado = await signInWithCredential(auth, credential);
    await garantirPerfilSincronizado();
    return resultado.user;
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Erro no login com Google",
      text2: mensagemErroFirebase(error.code),
    });
    return null;
  }
}

export async function signInWithAppleCredential(
  dados: ResultadoApple
): Promise<User | null> {
  try {
    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: dados.identityToken,
      rawNonce: dados.rawNonce,
    });

    // A Apple envia o nome só no primeiro login: é a única chance de guardá-lo.
    nomePendente = dados.nomeCompleto || null;
    const resultado = await signInWithCredential(auth, credential);

    if (dados.nomeCompleto && !resultado.user.displayName) {
      await updateProfile(resultado.user, { displayName: dados.nomeCompleto });
    }

    await garantirPerfilSincronizado();

    return resultado.user;
  } catch (error: any) {
    nomePendente = null;
    Toast.show({
      type: "error",
      text1: "Erro no login com Apple",
      text2: mensagemErroFirebase(error.code),
    });
    return null;
  }
}

export function contaUsaApple(): boolean {
  return (
    auth.currentUser?.providerData.some(
      (p) => p.providerId === APPLE_PROVIDER_ID
    ) ?? false
  );
}

/**
 * Revoga o token da Apple ao excluir a conta - exigência da Apple para apps que
 * oferecem Sign in with Apple. Sem isso o app é reprovado na revisão.
 *
 * Pede uma autenticação nova em vez de reaproveitar o código do login original:
 * o authorizationCode da Apple expira em poucos minutos, então um código
 * guardado desde o cadastro nunca funcionaria.
 *
 * Silencioso de propósito - a exclusão da conta não pode ficar presa aqui.
 */
export async function revogarTokenApple(): Promise<void> {
  if (!contaUsaApple()) return;

  try {
    const dados = await iniciarLoginApple();

    if (!dados?.authorizationCode) {
      console.warn("Revogação da Apple ignorada: sem authorizationCode");
      return;
    }

    await revokeAccessToken(auth, dados.authorizationCode);
  } catch (error) {
    console.warn("Não foi possível revogar o token da Apple:", error);
  }
}

export async function resetPassword(email: string): Promise<boolean> {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Erro ao enviar e-mail",
      text2: mensagemErroFirebase(error.code),
    });
    return false;
  }
}

export async function reenviarEmailVerificacao(): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    await sendEmailVerification(auth.currentUser);
    return true;
  } catch (error) {
    console.error("Erro ao reenviar e-mail de verificação:", error);
    return false;
  }
}

export async function emailFoiVerificado(): Promise<boolean> {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  return auth.currentUser.emailVerified;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
