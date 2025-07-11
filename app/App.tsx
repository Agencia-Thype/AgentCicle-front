import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Routes } from "./navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AssinaturaProvider,
  useAssinatura,
} from "./contexts/AssinaturaContext";
import PremiumModal from "./components/PremiumModal";
import { usePremiumModal } from "./utils/premiumModalController";
import UpgradeScreen from "./components/UpgradeScreen";

// Componente principal que consome o contexto de assinatura
function AppContent() {
  const { verificarStatus, status, podeUsarApp, ativarAssinatura, loading } =
    useAssinatura();
  const { isVisible, setIsVisible, message, showModal } = usePremiumModal();

  // Verificar o status na inicialização do app apenas se o usuário já estiver logado
  useEffect(() => {
    const checkAuthAndStatus = async () => {
      try {
        // Primeiro verificar se o token existe
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          // Só verificar status se o usuário estiver logado
          await verificarStatus();
          console.log("Verificação de status realizada após confirmar token");
        } else {
          console.log("Usuário não está logado, pulando verificação de status");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      }
    };

    checkAuthAndStatus();
  }, []);

  // Mostrar tela de upgrade em diferentes cenários
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        setIsAuthenticated(!!token);
        console.log(
          "Estado de autenticação:",
          !!token ? "Autenticado" : "Não autenticado"
        );
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  // Apenas mostrar a tela de upgrade se tivermos certeza que o usuário está autenticado
  if (status && isAuthenticated === true) {
    console.log(
      "Status atual da assinatura (usuário autenticado):",
      JSON.stringify(status)
    );

    // Caso 1: Usuário autenticado não pode usar o app (trial expirado sem assinatura)
    if (!podeUsarApp || (!status.trialAtivo && !status.assinaturaAtiva)) {
      console.log("Exibindo tela de upgrade - acesso bloqueado");
      return (
        <UpgradeScreen
          onUpgrade={() => ativarAssinatura(1)}
          isLoading={loading}
          status={status}
        />
      );
    }

    // Caso 2: Trial está quase expirando (restam 2 dias ou menos)
    // Opcional: Mostrar tela não-bloqueante para incentivar assinatura quando trial está acabando
    if (status.trialAtivo && status.diasRestantesTrial <= 2) {
      console.log(
        "Trial está acabando:",
        status.diasRestantesTrial,
        "dias restantes"
      );
      // Se quiser implementar uma tela não-bloqueante para alertar o usuário,
      // pode ser feito aqui, ou usar apenas o banner na Home
    }
  }

  // Modal de premium (mostrado quando tenta acessar recursos premium)
  const handleUpgrade = async () => {
    setIsVisible(false);
    try {
      await ativarAssinatura(1);
      Toast.show({
        type: "success",
        text1: "Assinatura ativada!",
        text2: "Você agora tem acesso a todos os recursos premium.",
      });
    } catch (error) {
      console.error("Erro ao ativar assinatura:", error);
      Toast.show({
        type: "error",
        text1: "Falha ao ativar assinatura",
        text2: "Tente novamente mais tarde.",
      });
    }
  };

  return (
    <>
      <Routes />
      <Toast />
      <PremiumModal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        onUpgrade={handleUpgrade}
        message={message}
      />
    </>
  );
}

import { AuthProvider, useAuth } from "./contexts/AuthContext";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AssinaturaProvider>
          <AuthenticatedApp />
        </AssinaturaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Componente que verifica autenticação antes de renderizar o conteúdo
function AuthenticatedApp() {
  const { isAuthenticated, isLoading, checkAuthState } = useAuth();
  const [initialized, setInitialized] = useState(false);

  // Verificar estado de autenticação ao iniciar
  useEffect(() => {
    const init = async () => {
      await checkAuthState();
      setInitialized(true);
    };
    init();
  }, []);

  // Enquanto verifica autenticação, não mostrar nada
  if (!initialized || isLoading) {
    return null;
  }

  // Uma vez inicializado, renderizar o conteúdo apropriado
  return <AppContent />;
}
