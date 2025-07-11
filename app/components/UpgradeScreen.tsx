import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { themeColors } from "../theme/colors";

interface UpgradeScreenProps {
  onUpgrade: () => void;
  mensagem?: string;
  isLoading?: boolean;
  status?: {
    trialAtivo?: boolean;
    diasRestantesTrial?: number;
    assinaturaAtiva?: boolean;
    podeUsarRecursosBasicos?: boolean;
  };
}

const UpgradeScreen = ({
  onUpgrade,
  mensagem,
  isLoading,
  status,
}: UpgradeScreenProps) => {
  // Determina o título e mensagem baseados no status real do usuário
  const renderStatusInfo = () => {
    // Se recebemos informações específicas de status
    if (status) {
      console.log(
        "UpgradeScreen: Renderizando com status:",
        JSON.stringify(status)
      );

      // Caso 1: Assinatura ativa - máxima prioridade
      if (status.assinaturaAtiva) {
        return {
          title: "Assinatura Premium Ativa",
          message:
            "Você já possui uma assinatura premium ativa. Aproveite todos os recursos.",
        };
      }

      // Caso 2: Trial ativo - Mostrar dias restantes
      if (
        status.trialAtivo &&
        status.diasRestantesTrial &&
        status.diasRestantesTrial > 0
      ) {
        return {
          title: "Período de teste ativo",
          message: `Você está no período de teste gratuito. Restam ${status.diasRestantesTrial} dias.`,
        };
      }

      // Caso 3: Trial expirado - Sem acesso
      if (!status.trialAtivo && !status.assinaturaAtiva) {
        return {
          title: "Seu período de teste terminou",
          message:
            "Para continuar utilizando o aplicativo Cíclica, faça a assinatura e tenha acesso a todos os recursos.",
        };
      }
    }

    // Default - Usar mensagem fornecida ou uma mensagem padrão
    return {
      title: "Assine o Premium",
      message:
        mensagem ||
        "Assine o plano premium para acessar todos os recursos do aplicativo Cíclica.",
    };
  };

  const statusInfo = renderStatusInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/medalha_ouro.png")}
          style={styles.icon}
        />

        <Text style={styles.title}>{statusInfo.title}</Text>

        <Text style={styles.message}>{statusInfo.message}</Text>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plano Premium</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Treinos personalizados</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Relatórios mensais</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Chat com a Lunia IA</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Acompanhamento do ciclo</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Diário de sintomas</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Gráficos de progresso</Text>
            </View>
          </View>

          <View style={styles.pricingContainer}>
            <Text style={styles.price}>R$ 14,90</Text>
            <Text style={styles.period}>por mês</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.upgradeButton, isLoading && styles.disabledButton]}
          onPress={onUpgrade}
          disabled={isLoading}
        >
          <Text style={styles.upgradeButtonText}>
            {isLoading ? "Processando..." : "Assinar Agora"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.guaranteeText}>
          Você pode cancelar a qualquer momento
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: themeColors.text,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: themeColors.text,
    opacity: 0.8,
    lineHeight: 22,
  },
  planCard: {
    width: "100%",
    backgroundColor: "#F9F5F0",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: themeColors.text,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: themeColors.text,
  },
  pricingContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: themeColors.button,
  },
  period: {
    fontSize: 14,
    color: themeColors.text,
    opacity: 0.6,
  },
  upgradeButton: {
    backgroundColor: themeColors.button,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  guaranteeText: {
    fontSize: 14,
    color: themeColors.text,
    opacity: 0.7,
  },
});

export default UpgradeScreen;
