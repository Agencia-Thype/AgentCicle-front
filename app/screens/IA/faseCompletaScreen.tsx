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
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { api } from "../../services/api";
import { faseCompletaStyles } from "./faseCompletaStyles";
import { globalStyles, themeColors } from "../../theme/global";
import { verificarServidorOnline } from "../../services/healthCheck";

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
        // Verificar se o servidor está online antes de fazer a requisição
        const servidorOnline = await verificarServidorOnline();
        if (!servidorOnline) {
          console.log(
            "Servidor offline, não é possível carregar detalhes da fase"
          );
          // Opcionalmente, mostrar uma mensagem para o usuário
          return;
        }

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
      // Verificar se o servidor está online antes de enviar a pergunta
      const servidorOnline = await verificarServidorOnline();
      if (!servidorOnline) {
        setResposta(
          "Não foi possível conectar ao servidor. Verifique sua conexão."
        );
        return;
      }

      const res = await api.post("/ia/conversar", { pergunta });
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
        {/* Botão de voltar posicionado absolutamente para ficar na posição exata como na imagem */}{" "}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={faseCompletaStyles.botaoVoltar}
          activeOpacity={0.7} // Adiciona feedback visual quando pressionado
        >
          <Ionicons name="arrow-back" size={28} color="#5C3B3B" />
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingTop: 40, // Aumentado para dar mais espaço no topo
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {" "}
          <View style={faseCompletaStyles.logoContainer}>
            <AnimatedLogo style={{ width: 100, height: 100, marginTop: 30 }} />
          </View>
          <Text style={faseCompletaStyles.faseTitulo}>
            🌙 Fase atual do ciclo
          </Text>
          <Text style={faseCompletaStyles.faseNome}>{fase}</Text>
          <Text style={faseCompletaStyles.faseDescricao}>{descricao}</Text>{" "}
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
            style={faseCompletaStyles.botaoPergunta}
            onPress={enviarPergunta}
          >
            <Text style={faseCompletaStyles.botaoPerguntaTexto}>
              Perguntar para a IA
            </Text>
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
