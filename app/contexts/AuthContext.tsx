import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Função para decodificar base64 em React Native
const base64ToUtf8 = (base64: string): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = "";
  let i = 0;

  while (i < base64.length) {
    const c0 = chars.indexOf(base64.charAt(i++));
    const c1 = chars.indexOf(base64.charAt(i++));
    const c2 = chars.indexOf(base64.charAt(i++));
    const c3 = chars.indexOf(base64.charAt(i++));

    const b0 = ((c0 & 0x3f) << 2) | ((c1 & 0x30) >> 4);
    const b1 = ((c1 & 0x0f) << 4) | ((c2 & 0x3c) >> 2);
    const b2 = ((c2 & 0x03) << 6) | (c3 & 0x3f);

    if (c2 === 64) {
      str += String.fromCharCode(b0);
    } else if (c3 === 64) {
      str += String.fromCharCode(b0, b1);
    } else {
      str += String.fromCharCode(b0, b1, b2);
    }
  }

  return str;
};

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar se o token JWT está expirado
  const isTokenExpired = (token: string): boolean => {
    try {
      if (!token) return true;

      // Obter a parte do payload do JWT (segunda parte)
      const base64Url = token.split(".")[1];
      if (!base64Url) return true;

      // Decodificar o base64
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      // Usar nossa função personalizada para decodificar base64 em React Native
      const decodedPayload = base64ToUtf8(base64);
      const payload = JSON.parse(decodedPayload);

      // Verificar se o token possui uma data de expiração
      if (!payload.exp) return true;

      // Verificar se o token está expirado (exp é em segundos)
      const expiry = payload.exp * 1000; // converter para milissegundos
      return Date.now() >= expiry;
    } catch (error) {
      console.error("Erro ao verificar expiração do token:", error);
      return true; // Em caso de erro, considerar como expirado por segurança
    }
  };

  const checkAuthState = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("auth_token");

      if (token) {
        // Verificar se o token é válido (não expirado)
        if (isTokenExpired(token)) {
          console.warn("Token expirado encontrado - fazendo logout");
          await logout(); // Remove o token expirado
          return false;
        }

        console.log(
          "Token válido encontrado no armazenamento",
          token.substring(0, 10) + "..."
        );
        setIsAuthenticated(true);
        return true;
      } else {
        console.log("Nenhum token encontrado, usuário não está autenticado");
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("assinatura_status");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Verificar estado de autenticação ao iniciar o app
  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        logout,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
