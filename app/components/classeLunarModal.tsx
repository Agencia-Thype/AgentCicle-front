import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { globalStyles } from "../theme/global";
import { palette } from "../theme/colors";

interface ClasseLunarModalProps {
  visivel: boolean;
  onFechar: () => void;
  trofeuUri: any;
  classeAtual: string;
  descricaoClasse: string;
  pontosAtuais: number;
  pontosParaProxima: number;
  proximaPontuacao: number | null;
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
  pontosAtuais,
  pontosParaProxima,
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
            Você está na classe{" "}
            <Text style={styles.blocoDestaque}>{classeAtual}</Text>, uma etapa
            que representa{" "}
            <Text style={styles.blocoDestaque}>
              {descricaoClasse.toLowerCase()}
            </Text>
            . Essa classe representa sua constância com o seu bem-estar
            emocional e físico.
          </Text>
        </View>

        <View style={styles.bloco}>
          <Text style={styles.blocoEmoji}>⏳</Text>
          <Text style={styles.blocoTexto}>
            <Text style={styles.blocoDestaque}>Seu progresso:</Text>{" "}
            <Text style={styles.blocoDestaque}>{pontosAtuais} pontos</Text> acumulados.
            {proximaPontuacao !== null
              ? <> Faltam <Text style={styles.blocoDestaque}>{pontosParaProxima} pontos</Text> para atingir a próxima classe em {proximaPontuacao} pontos.</>
              : <> Você alcançou a classe lunar mais alta.</>}
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
            Exercícios de Kegel completos rendem até{" "}
            <Text style={styles.blocoDestaque}>10 pontos por dia</Text>.{" "}
            A soma dessas atividades define sua classe lunar.
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
    color: palette.textPrimary,
    marginBottom: 2,
  },
  classeNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: palette.sage,
    textAlign: "center",
  },
  descricaoClasse: {
    fontSize: 14,
    color: palette.textPrimary,
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
    color: palette.textPrimary,
    lineHeight: 22,
    flex: 1,
    textAlign: "justify",
  },
  blocoDestaque: {
    fontWeight: "600",
    color: palette.sage,
  },
});
