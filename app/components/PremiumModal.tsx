import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { themeColors } from "../theme/colors";

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  message?: string;
}

const PremiumModal = ({
  visible,
  onClose,
  onUpgrade,
  message,
}: PremiumModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Image
            source={require("../assets/medalha_ouro.png")}
            style={styles.premiumIcon}
          />

          <Text style={styles.title}>Recurso Premium</Text>

          <Text style={styles.message}>
            {message ||
              "Este recurso está disponível apenas para usuários premium."}
          </Text>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitTitle}>Benefícios Premium:</Text>
            <View style={styles.benefitItem}>
              <Text>✓ Relatório mensal detalhado</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text>✓ Chat com a Lunia IA</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text>✓ Gráficos de progresso</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text>✓ Acesso a todos os recursos</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Assinar Agora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Continuar sem Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  premiumIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: themeColors.text,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: themeColors.text,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: themeColors.text,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  upgradeButton: {
    backgroundColor: themeColors.button,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 12,
  },
  closeButtonText: {
    color: themeColors.text,
    opacity: 0.7,
  },
});

export default PremiumModal;
