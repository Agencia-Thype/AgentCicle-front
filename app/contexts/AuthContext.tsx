import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../services/firebase";
import { daConta, limparCachesSemConta } from "../services/chaveDaConta";
import { limparCacheFase } from "../services/perfilService";
import {
  garantirPerfilSincronizado,
  jaSincronizadaNesteAparelho,
} from "../services/authService";

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  logout: () => Promise<void>;
  /** Revalida a sessão e força a renovação do token. */
  checkAuthState: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    limparCachesSemConta();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cria a linha no backend antes de liberar as telas autenticadas - a
      // sessão restaurada ao abrir o app não passa pela tela de login. Só a
      // primeira vez neste aparelho precisa esperar; nas outras a linha já
      // existe e o app abre na hora, com a sincronização rodando por baixo.
      if (firebaseUser) {
        const sincronizacao = garantirPerfilSincronizado();
        if (!(await jaSincronizadaNesteAparelho(firebaseUser.uid))) {
          await sincronizacao;
        }
      }
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkAuthState = async (): Promise<boolean> => {
    const atual = auth.currentUser;
    if (!atual) return false;

    try {
      await atual.reload();
      await atual.getIdToken(true); // força a renovação do token
      return true;
    } catch (error) {
      console.warn("Não foi possível revalidar a sessão:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Os caches já são separados por conta; apagar os de quem sai é só
      // higiene. As chaves levam o uid, então saem antes do signOut.
      const chavesDaConta = [
        "assinatura_status",
        "assinatura_status_cache",
        "@AgentCicle:perfil_cache",
        "@AgentCicle:rotina_hoje",
        "@AgentCicle:rotina_itens",
        "fase_lunar_cache",
        "home_pontuacao_cache",
      ].map(daConta);
      await limparCacheFase();
      await signOut(auth);
      await AsyncStorage.multiRemove([...chavesDaConta, "primeiro_acesso"]);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        logout,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
