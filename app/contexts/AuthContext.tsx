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
import { garantirPerfilSincronizado } from "../services/authService";

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cria a linha no backend antes de liberar as telas autenticadas - a
      // sessão restaurada ao abrir o app não passa pela tela de login.
      if (firebaseUser) {
        await garantirPerfilSincronizado();
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
      await signOut(auth);
      await AsyncStorage.multiRemove([
        "assinatura_status",
        "primeiro_acesso",
        "@AgentCicle:perfil_cache",
        "@AgentCicle:rotina_hoje",
        "@AgentCicle:rotina_itens",
      ]);
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
