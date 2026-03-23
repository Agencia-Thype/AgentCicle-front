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
import { useFonts } from "expo-font";
import { LobsterTwo_400Regular, LobsterTwo_700Bold } from "@expo-google-fonts/lobster-two";
import { View, ActivityIndicator } from "react-native";

function AppContent() {
  const { verificarStatus, status, podeUsarApp, ativarAssinatura, loading } =
    useAssinatura();
  const { isVisible, setIsVisible, message, showModal } = usePremiumModal();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        const hasToken = !!token;
        setIsAuthenticated(hasToken);
        if (hasToken) {
          try {
            await verificarStatus();
          } catch (error) {
            console.warn("Erro ao verificar status de assinatura:", error);
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar app:", error);
        setIsAuthenticated(false);
      }
    };
    initializeApp();
  }, []);

  if (status && isAuthenticated === true) {
    if (!podeUsarApp || (!status.trialAtivo && !status.assinaturaAtiva)) {
      return (
        <UpgradeScreen
          onUpgrade={() => ativarAssinatura(1)}
          isLoading={loading}
          status={status}
        />
      );
    }
  }

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
  const [fontsLoaded] = useFonts({
    LobsterTwo_400Regular,
    LobsterTwo_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1A0733", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#9260CE" size="large" />
      </View>
    );
  }

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

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, checkAuthState } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAuthState();
      setInitialized(true);
    };
    init();
  }, []);

  if (!initialized || isLoading) {
    return null;
  }

  return <AppContent />;
}
