import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { api } from "../../services/api";
import { faseCompletaStyles } from "./faseCompletaStyles";
import { globalStyles, themeColors } from "../../theme/global";

export default function FaseCompletaScreen() {
  const navigation = useNavigation();
  const [descricao, setDescricao] = useState("");
  const [fase, setFase] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const carregarDetalhes = async () => {
      try {
        const res = await api.get("/fase-atual/detalhes");
        setDescricao(res.data.descricao);
        setFase(res.data.fase_atual);
      } catch (err) {
        console.error("Erro ao buscar fase:", err);
      }
    };
    carregarDetalhes();
  }, []);

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;
    setCarregando(true);
    setResposta("");

    try {
      const res = await api.post("/fase-atual/conversar", { pergunta });
      setResposta(
        res.data?.resposta ||
          "A IA respondeu, mas não conseguimos exibir a mensagem."
      );
    } catch (err) {
      setResposta("Erro ao obter resposta da IA.");
    } finally {
      setCarregando(false); // Isso garante que pare a bolinha mesmo se der erro
    }
  };

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
       
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#5C3B3B" />
          </TouchableOpacity>

          <AnimatedLogo />

          <Text style={faseCompletaStyles.faseTitulo}>
            🌙 Fase atual do ciclo
          </Text>
          <Text style={faseCompletaStyles.faseNome}>{fase}</Text>
          <Text style={faseCompletaStyles.faseDescricao}>{descricao}</Text>

          <Text style={[faseCompletaStyles.subtitulo, { marginTop: 24 }]}>
            Tem alguma dúvida?
          </Text>

          <TextInput
            style={faseCompletaStyles.inputPergunta}
            placeholder="Digite sua pergunta para a IA"
            placeholderTextColor="#A58A8A"
            multiline
            numberOfLines={4}
            value={pergunta}
            onChangeText={setPergunta}
          />

          <TouchableOpacity
            style={globalStyles.button}
            onPress={enviarPergunta}
          >
            <Text style={globalStyles.buttonText}>Perguntar para a IA</Text>
          </TouchableOpacity>

          {carregando && <ActivityIndicator size="small" color="#A56C6C" />}
          {resposta !== "" && (
            <View style={faseCompletaStyles.respostaContainer}>
              <Text style={faseCompletaStyles.respostaTexto}>{resposta}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
