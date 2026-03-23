import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { api } from "../../services/api";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import AppBackground from "../../components/AppBackground";

const sintomasData = {
  Humor: [
    "Calma", "Feliz", "Energética", "Alegre", "Mudanças de humor",
    "Irritada", "Triste", "Ansiosa", "Desanimada", "Culpada",
    "Pensamentos obsessivos", "Pouca energia", "Apática", "Confusa", "Muito autocrítica",
  ],
  Sintomas: [
    "Está tudo bem", "Cólicas", "Dores no corpo", "Náusea", "Dores de cabeça",
    "Intestino preso", "Gases", "Febre", "Seios sensíveis", "Dor nas costas",
    "Acne", "Suores noturnos", "Confusão mental", "Dor nas articulações",
    "Ardência bucal", "Apetite descontrolado", "Insônia", "Dor abdominal",
    "Coceira vaginal", "Ressecamento vaginal",
  ],
};

export default function SintomasScreen() {
  const navigation = useNavigation();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);

  const toggleSintoma = (sintoma: string) => {
    setSelecionados((prev) =>
      prev.includes(sintoma) ? prev.filter((s) => s !== sintoma) : [...prev, sintoma]
    );
  };

  const handleEnviar = async () => {
    if (selecionados.length === 0) {
      return Toast.show({ type: "error", text1: "Selecione pelo menos um sintoma." });
    }
    setEnviando(true);
    try {
      await api.post("/sintomas", { sintomas: selecionados, notas });
      Toast.show({ type: "success", text1: "Sintomas registrados!" });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: "error", text1: "Erro ao registrar sintomas." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#EED0FC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Sintomas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.entries(sintomasData).map(([categoria, sintomas]) => (
          <View key={categoria} style={styles.section}>
            <Text style={styles.sectionTitle}>{categoria}</Text>
            <View style={styles.grid}>
              {sintomas.map((sintoma) => {
                const selected = selecionados.includes(sintoma);
                return (
                  <TouchableOpacity
                    key={sintoma}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleSintoma(sintoma)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {sintoma}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Alguma anotação adicional..."
            placeholderTextColor="rgba(238,208,252,0.5)"
            multiline
            numberOfLines={4}
            value={notas}
            onChangeText={setNotas}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEnviar} disabled={enviando}>
          <Text style={styles.buttonText}>{enviando ? "Enviando..." : "Salvar"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(26, 7, 51, 0.6)",
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFAC3", fontFamily: "LobsterTwo_700Bold" },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#FFFAC3", marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(63, 28, 101, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.4)",
    marginBottom: 4,
  },
  chipSelected: { backgroundColor: "#9260CE", borderColor: "#9260CE" },
  chipText: { fontSize: 13, color: "#EED0FC" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  textArea: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#EED0FC",
    borderWidth: 1,
    borderColor: "rgba(146,96,206,0.5)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#9260CE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#9260CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
