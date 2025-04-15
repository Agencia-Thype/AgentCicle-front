import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { globalStyles } from "../theme/global";

interface ClasseLunarModalProps {
  visivel: boolean;
  onFechar: () => void;
  trofeuUri: any;
  classeAtual: string;
  descricaoClasse: string;
  diasRestantes: number;
  proximaPontuacao: number;
  proximaClasse: {
    nome: string;
    descricao: string;
  } | null;
}

export default function ClasseLunarModal({
  visivel,
  onFechar,
  trofeuUri,
  classeAtual,
  descricaoClasse,
  diasRestantes,
  proximaPontuacao,
  proximaClasse,
}: ClasseLunarModalProps) {
  return (
    <Modal isVisible={visivel} onBackdropPress={onFechar}>
      <View style={styles.modalContainer}>
        <Image source={trofeuUri} style={styles.trofeuImagem} />
        <Text style={styles.modalTitulo}>Classe atual</Text>
        <Text style={styles.classeNome}>{classeAtual}</Text>
        <Text style={styles.descricaoClasse}>{descricaoClasse}</Text>

        <View style={styles.bloco}>
          <Text style={styles.blocoEmoji}>🌙</Text>
          <Text style={styles.blocoTexto}>
            Você está na fase{" "}
            <Text style={styles.blocoDestaque}>{classeAtual}</Text>, uma etapa
            que representa{" "}
            <Text style={styles.blocoDestaque}>
              {descricaoClasse.toLowerCase()}
            </Text>
            . Essa fase é perfeita para alinhar seus hábitos com o seu bem-estar
            emocional e físico.
          </Text>
        </View>

        <View style={styles.bloco}>
          <Text style={styles.blocoEmoji}>⏳</Text>
          <Text style={styles.blocoTexto}>
            <Text style={styles.blocoDestaque}>Período da fase:</Text> você
            permanecerá nessa fase por mais{" "}
            <Text style={styles.blocoDestaque}>{diasRestantes} dias</Text> ou
            até atingir{" "}
            <Text style={styles.blocoDestaque}>{proximaPontuacao} pontos</Text>.
          </Text>
        </View>

        {proximaClasse && (
          <View style={styles.bloco}>
            <Text style={styles.blocoEmoji}>🔜</Text>
            <Text style={styles.blocoTexto}>
              <Text style={styles.blocoDestaque}>Próxima fase:</Text>{" "}
              {proximaClasse.nome} – {proximaClasse.descricao}
            </Text>
          </View>
        )}

        <View style={styles.bloco}>
          <Text style={styles.blocoEmoji}>🎮</Text>
          <Text style={styles.blocoTexto}>
            <Text style={styles.blocoDestaque}>Gamificação:</Text> A cada treino
            registrado, você pode ganhar até{" "}
            <Text style={styles.blocoDestaque}>20 pontos</Text>. Sentimentos
            rendem <Text style={styles.blocoDestaque}>2 pontos</Text> por dia.
            Ao atingir <Text style={styles.blocoDestaque}>100%</Text> da semana,
            você conquista uma{" "}
            <Text style={styles.blocoDestaque}>Medalha Lunar 🥇</Text>.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              marginTop: 20,
              paddingVertical: 6,
              paddingHorizontal: 24,
              alignSelf: "center",
            },
          ]}
          onPress={onFechar}
        >
          <Text style={[globalStyles.buttonText, { fontSize: 14 }]}>
            Fechar
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  trofeuImagem: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 8,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5C3B3B",
    marginBottom: 2,
  },
  classeNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7EAA92",
    textAlign: "center",
  },
  descricaoClasse: {
    fontSize: 14,
    color: "#5C3B3B",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  bloco: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 12,
  },
  blocoEmoji: {
    fontSize: 16,
    marginTop: 2,
  },
  blocoTexto: {
    fontSize: 14,
    color: "#5C3B3B",
    lineHeight: 22,
    flex: 1,
    textAlign: "justify",
  },
  blocoDestaque: {
    fontWeight: "600",
    color: "#7EAA92",
  },
});
