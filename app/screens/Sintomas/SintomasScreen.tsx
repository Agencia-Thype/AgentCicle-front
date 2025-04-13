// screens/Sintomas/SintomasScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, themeColors } from "../../theme/global";
import { api } from "../../services/api";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

const sintomasData = {
  Humor: [
    "😌 Calma", "😊 Feliz", "⚡ Energética", "😄 Alegre",
    "😵 Mudanças de humor", "😠 Irritada", "😢 Triste", "😟 Ansiosa",
    "😞 Desanimada", "😔 Culpada", "🧠 Pensamentos obsessivos",
    "🥱 Pouca energia", "😐 Apática", "😕 Confusa", "⚠️ Muito autocrítica"
  ],
  Sintomas: [
    "👍 Está tudo bem", "🥴 Cólicas", "🤕 Dores no corpo",
    "🤢 Náusea", "😣 Dores de cabeça", "💩 Intestino preso",
    "💨 Gases", "🌡️ Febre", "👙 Seios sensíveis", "👩‍🦱 Dor nas costas",
    "😳 Acne", "💤 Suores noturnos", "🧠 Confusão mental", "🦴 Dor nas articulações",
    "🔥 Ardência bucal", "🍔 Apetite descontrolado", "🌙 Insônia",
    "🤰 Dor abdominal", "🌸 Coceira vaginal", "💧 Ressecamento vaginal"
  ]
};

export default function SintomasScreen() {
  const [peso, setPeso] = useState("");
  const [notas, setNotas] = useState("");
  const [selectedTags, setSelectedTags] = useState(new Set<string>());
  const navigation = useNavigation();

  const toggleTag = (item: string) => {
    const updated = new Set(selectedTags);
    if (updated.has(item)) {
      updated.delete(item);
    } else {
      updated.add(item);
    }
    setSelectedTags(updated);
  };

  const registrarSintomas = async () => {
    try {
      await api.post("/diario/registrar-sintomas", {
        sentimentos: Array.from(selectedTags),
        observacao: notas,
        peso: peso ? parseFloat(peso) : null,
      });
      Toast.show({
        type: "success",
        text1: "Sintomas salvos!",
        text2: "Você ganhou 2 pontos 🌙",
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível salvar os sintomas.",
      });
    }
  };

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.header}>Como você está se sentindo?</Text>

        {Object.entries(sintomasData).map(([categoria, itens]) => (
          <View key={categoria} style={styles.section}>
            <Text style={styles.sectionTitle}>{categoria}</Text>
            <View style={styles.tagsContainer}>
              {itens.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tag, selectedTags.has(item) && styles.tagSelected]}
                  onPress={() => toggleTag(item)}
                >
                  <Text style={styles.tagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Peso</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu peso em kg"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Observações</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Anote como você está se sentindo"
            multiline
            value={notas}
            onChangeText={setNotas}
          />
        </View>
      </ScrollView>

      {selectedTags.size > 0 && (
        <TouchableOpacity style={styles.buttonRegistrar} onPress={registrarSintomas}>
          <Text style={styles.buttonText}>Registrar sintomas</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: themeColors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
    color: themeColors.text,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#FCEFEF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#E3CFCF",
    borderWidth: 1,
  },
  tagSelected: {
    backgroundColor: "#E3CFCF",
    borderColor: themeColors.button,
    borderWidth: 2,
  },
  tagText: {
    fontSize: 14,
    color: themeColors.text,
  },
  input: {
    backgroundColor: themeColors.inputBackground,
    borderColor: themeColors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: themeColors.text,
  },
  buttonRegistrar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: themeColors.button,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: themeColors.buttonText,
    fontWeight: "bold",
    fontSize: 16,
  },
});
