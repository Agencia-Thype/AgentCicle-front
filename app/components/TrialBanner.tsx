import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAssinatura } from "../contexts/AssinaturaContext";
import { themeColors } from "../theme/colors";

interface TrialBannerProps {
  onUpgrade?: () => void;
  visible?: boolean;
  onClose?: () => void;
}

const TrialBanner = ({
  onUpgrade,
  visible = false,
  onClose,
}: TrialBannerProps) => {
  const { status, estaNoPeriodoTrial, temPermissaoPremium } = useAssinatura();
  const [opacity] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(visible);

  // Temporizador para fechar o banner automaticamente após 3 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (visible) {
      setModalVisible(true);

      // Animar entrada
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Configurar timer para fechar após 5 segundos
      timer = setTimeout(() => {
        fadeOut();
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible]);

  // Função para animar a saída e fechar o modal
  const fadeOut = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      if (onClose) onClose();
    });
  };

  // Log para diagnóstico
  if (status) {
    console.log(
      "[TrialBanner] Status atual:",
      estaNoPeriodoTrial
        ? `Trial ativo (${status.diasRestantesTrial} dias)`
        : "Sem trial",
      temPermissaoPremium ? "Premium ativo" : "Sem premium"
    );
  }

  // Verificações para garantir que o banner só é mostrado com status válido e após login
  if (!status || !modalVisible) {
    console.log("[TrialBanner] Não exibindo: status inválido ou modal fechado");
    return null;
  }

  // Verificar se temos informações suficientes para mostrar o modal (usuário logado)
  if (!status.nome || !status.email) {
    console.log("[TrialBanner] Usuário não está logado ou status incompleto");
    if (modalVisible && onClose) {
      onClose();
    }
    return null;
  }

  // Se o usuário tem assinatura premium ativa, não mostrar modal
  if (temPermissaoPremium) {
    console.log(
      "[TrialBanner] Usuário tem premium ativo, não mostrando banner"
    );
    // Fecha o modal imediatamente se for premium
    if (modalVisible && onClose) {
      onClose();
    }
    return null;
  }

  // Determinar o tipo de mensagem baseado no status do usuário
  const renderContent = () => {
    // Usar os novos campos do backend, quando disponíveis
    const statusTipo = status.statusTipo;
    const jaTeveAssinatura = status.jaTeveAssinatura;
    const { diasRestantesTrial } = status;

    // Caso 1: Trial ativo - informar dias restantes
    if (statusTipo === "trial" || estaNoPeriodoTrial) {
      // Validar se os dias restantes são um número válido
      if (diasRestantesTrial === undefined || diasRestantesTrial === null) {
        console.warn("[TrialBanner] diasRestantesTrial é undefined ou null");
        return null;
      }

      const isLowDays = diasRestantesTrial <= 2;

      return (
        <View
          style={[
            styles.modalContent,
            isLowDays ? styles.warningContent : styles.infoContent,
          ]}
        >
          <Text style={styles.title}>Período de Teste</Text>
          <Text style={styles.text}>
            {diasRestantesTrial === 0
              ? "Seu período de teste termina hoje!"
              : diasRestantesTrial === 1
                ? "Último dia de período de testes!"
                : `${diasRestantesTrial} dias restantes no período de testes`}
          </Text>
          {(isLowDays || diasRestantesTrial === 0) && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                fadeOut();
                if (onUpgrade) onUpgrade();
              }}
            >
              <Text style={styles.buttonText}>Assinar Agora</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    // Caso 2: Expirado (trial ou premium) - mostrar mensagem adequada baseada no histórico
    else if (
      statusTipo === "expirado" ||
      statusTipo === "trial_expirado" ||
      (!estaNoPeriodoTrial && !temPermissaoPremium)
    ) {
      return (
        <View style={[styles.modalContent, styles.expiredContent]}>
          <Text style={styles.title}>
            {jaTeveAssinatura
              ? "Assinatura Expirada"
              : "Período de Teste Encerrado"}
          </Text>
          <Text style={styles.text}>
            {jaTeveAssinatura
              ? "Sua assinatura expirou. Renove agora para manter o acesso completo."
              : "Seu período de teste expirou. Assine agora para continuar com acesso completo."}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              fadeOut();
              if (onUpgrade) onUpgrade();
            }}
          >
            <Text style={styles.buttonText}>
              {jaTeveAssinatura ? "Renovar Agora" : "Assinar Agora"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Caso padrão: não mostrar nada se não atender nenhuma condição
    return null;
  };

  console.log("[TrialBanner] Exibindo banner");
  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={fadeOut}
    >
      <TouchableWithoutFeedback onPress={fadeOut}>
        <Animated.View style={[styles.modalContainer, { opacity: opacity }]}>
          <TouchableWithoutFeedback>
            <View>{renderContent()}</View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal container com fundo semi-transparente
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo escuro semi-transparente
  },
  // Estilos para o conteúdo do modal
  modalContent: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Variações de estilo por tipo de status
  infoContent: {
    backgroundColor: themeColors.accent || "#7EAA92",
  },
  warningContent: {
    backgroundColor: themeColors.accent || "#FFA500",
  },
  expiredContent: {
    backgroundColor: themeColors.error || "#FF6347",
  },
  // Estilos de texto
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  // Estilos para o botão de ação
  button: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  buttonText: {
    color: themeColors.accent || "#7EAA92",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Estilos originais mantidos para compatibilidade
  container: {
    backgroundColor: themeColors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
  },
  containerWarning: {
    backgroundColor: themeColors.error || "#FFA500",
  },
  contentWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default TrialBanner;
