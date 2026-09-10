import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { palette } from "../theme/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  resumo: any;
}

export default function ResumoDiaModal({ visible, onClose, resumo }: Props) {
  if (!resumo) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Resumo do dia</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.conteudo}>
            <Text style={styles.label}>📅 Data:</Text>
            <Text style={styles.valor}>{resumo.data.toLocaleDateString("pt-BR")}</Text>

            <Text style={styles.label}>🌙 Fase do ciclo:</Text>
            <Text style={styles.valor}>{resumo.fase || "Não registrado"}</Text>

            <Text style={styles.label}>🧠 Sentimentos:</Text>
            <Text style={styles.valor}>
              {resumo.sentimentos?.length ? resumo.sentimentos.join(", ") : "Não registrados"}
            </Text>

            <Text style={styles.label}>📝 Observações:</Text>
            <Text style={styles.valor}>{resumo.observacao || "Sem observações"}</Text>

            <Text style={styles.label}>⚖️ Peso:</Text>
            <Text style={styles.valor}>{resumo.peso ? `${resumo.peso} kg` : "Não registrado"}</Text>

            <Text style={styles.label}>🏋️‍♀️ Treino:</Text>
            {resumo.treino ? (
              <Text style={styles.valor}>
                {`Fase: ${resumo.treino.fase}\nTipo: ${resumo.treino.tipo}\nConcluído: ${resumo.treino.percentual_conclusao}%`}
              </Text>
            ) : (
              <Text style={styles.valor}>Não registrado</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "rgba(214, 69, 63, 0.1)",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.textPrimary,
  },
  conteudo: {
    marginTop: 10,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: palette.textPrimary,
    marginTop: 12,
  },
  valor: {
    fontSize: 15,
    color: "#333",
  },
});
