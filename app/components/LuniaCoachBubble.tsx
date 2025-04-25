import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface Props {
  visivel: boolean;
  onFechar: () => void;
  fase: string;
  userName: string;
  percentualAnterior: number;
  percentualAtual: number;
}

export default function ModalLuniaCoach({
  visivel,
  onFechar,
  fase,
  userName,
  percentualAnterior,
  percentualAtual,
}: Props) {
  const navigation = useNavigation();

  return (
    <Modal visible={visivel} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
          />

          <View style={styles.balao}>
            <Text style={styles.titulo}>🧚‍♀️ <Text style={{ fontWeight: "bold" }}>LunIA diz:</Text></Text>

            <Text style={styles.texto}>
              Estamos na fase <Text style={{ fontWeight: "bold" }}>{fase}</Text> 🌙{"\n"}
              {userName &&
                `Mês passado você arrasou, ${userName.toLowerCase()}, com ${percentualAnterior}% de treino.\n`}
              Até agora você já completou {percentualAtual}%!{"\n"}
              Vamos manter essa energia linda hoje?
            </Text>

            <View style={styles.botoes}>
              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={onFechar}
              >
                <Text style={styles.textoBotaoSecundario}>Fechar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoPrimario}
                onPress={() => {
                  onFechar();
                  navigation.navigate("FaseCompletaScreen" as never);
                }}
              >
                <Text style={styles.textoBotaoPrimario}>Falar com a LunIA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginBottom: -10,
  },
  balao: {
    backgroundColor: "#FFF0F5",
    padding: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: "100%",
    alignItems: "center",
  },
  titulo: {
    fontSize: 16,
    color: "#5C3B3B",
    marginBottom: 6,
  },
  texto: {
    fontSize: 14,
    color: "#5C3B3B",
    textAlign: "center",
    lineHeight: 22,
  },
  botoes: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  botaoPrimario: {
    backgroundColor: "#A56C6C",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  botaoSecundario: {
    backgroundColor: "#EADADA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  textoBotaoPrimario: {
    color: "#FFF",
    fontWeight: "600",
  },
  textoBotaoSecundario: {
    color: "#5C3B3B",
    fontWeight: "600",
  },
});
