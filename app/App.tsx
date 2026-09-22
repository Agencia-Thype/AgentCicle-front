import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Routes } from "./navigation";
import {
  AssinaturaProvider,
  useAssinatura,
} from "./contexts/AssinaturaContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PremiumModal from "./components/PremiumModal";
import { usePremiumModal } from "./utils/premiumModalController";
import UpgradeScreen from "./components/UpgradeScreen";
import { useFonts } from "expo-font";
import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from "@expo-google-fonts/dm-serif-display";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { View, ActivityIndicator } from "react-native";
import { palette } from "./theme/colors";
import { COBRANCA_ATIVA } from "./config/monetizacao";
import { configurarNotificacoes } from "./services/notificacoes";
import {
  assinar,
  conectarLoja,
  desconectarLoja,
  PRODUTOS,
  type PlanoAssinatura,
} from "./services/compras";

// Lembretes da rotina aparecem mesmo com o app aberto.
configurarNotificacoes();

function AppContent() {
  const { verificarStatus, status, podeUsarApp, loading } = useAssinatura();
  const { isVisible, setIsVisible, message } = usePremiumModal();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    verificarStatus().catch((error) => {
      console.warn("Erro ao verificar status de assinatura:", error);
    });
  }, [isAuthenticated]);

  /**
   * Conecta à loja quando a cobrança está ligada e há alguém logado.
   *
   * Além de preparar a compra, é o que recolhe pagamentos que ficaram no meio
   * do caminho: a loja reenvia a compra e o servidor é avisado sozinho.
   */
  useEffect(() => {
    if (!COBRANCA_ATIVA || !isAuthenticated) return;
    void conectarLoja();
    return () => {
      void desconectarLoja();
    };
  }, [isAuthenticated]);

  /**
   * Compra pela loja: StoreKit no iOS, Play Billing no Android. O recibo vai
   * para o servidor, que confere junto à loja antes de liberar o premium.
   */
  const comprarAssinatura = async (plano: PlanoAssinatura = PRODUTOS.mensal) => {
    await assinar(plano);
    // O premium só vale depois que o servidor confirma o recibo, no ouvinte de
    // compras; reconsultar traz o status já validado.
    await verificarStatus(true);
  };

  const handleUpgrade = async (plano: PlanoAssinatura = PRODUTOS.mensal) => {
    setIsVisible(false);
    try {
      await comprarAssinatura(plano);
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

  // No modo gratuito ninguém é barrado - e nenhuma tela de upgrade é montada.
  if (COBRANCA_ATIVA && status && isAuthenticated === true) {
    if (!podeUsarApp || (!status.trialAtivo && !status.assinaturaAtiva)) {
      return (
        <UpgradeScreen
          onUpgrade={handleUpgrade}
          isLoading={loading}
          status={status}
        />
      );
    }
  }

  return (
    <>
      <Routes />
      <Toast />
      {COBRANCA_ATIVA && (
        <PremiumModal
          visible={isVisible}
          onClose={() => setIsVisible(false)}
          onUpgrade={handleUpgrade}
          message={message}
        />
      )}
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bgDeep, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={palette.purple} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AssinaturaProvider>
            <AuthenticatedApp />
          </AssinaturaProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthenticatedApp() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <AppContent />;
}
