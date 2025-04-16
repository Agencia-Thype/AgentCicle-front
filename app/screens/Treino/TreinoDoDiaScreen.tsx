import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CheckBox from "expo-checkbox";
import Modal from "react-native-modal";
import { globalStyles, themeColors } from "../../theme/global";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation";
import { TreinoExercicio } from "../../interface/TreinoDoDiaInterface";
import { api } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedLogo } from "app/components/AnimatedLogo";
import { Ionicons } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TreinoDoDia"
>;

export default function TreinoDoDiaScreen() {
  const [fase, setFase] = useState("");
  const [tipoTreino, setTipoTreino] = useState("");
  const [checked, setChecked] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<TreinoExercicio[]>([]);
  const [progressoSalvo, setProgressoSalvo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pontosGanho, setPontosGanho] = useState(0);
  const [moedaAnim] = useState(new Animated.Value(0));

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    async function buscarTreino() {
      try {
        const response = await api.get("/treino-dia");
        setTreino(response.data.exercicios);
        setFase(response.data.fase);
        setTipoTreino(response.data.tipo_treino);

        // ✅ Após setar o treino, chama os marcados com o tamanho correto
        buscarMarcadosHoje(response.data.exercicios.length);
      } catch (error) {
        console.error("Erro ao buscar treino:", error);
      } finally {
        setLoading(false);
      }
    }

    buscarTreino();
  }, []);

  async function buscarMarcadosHoje(total: number) {
    try {
      const response = await api.get("/treino-dia/marcados-hoje");
      const percentualSalvo = response.data.percentual;
      const quantidadeMarcada = Math.round((percentualSalvo / 100) * total);

      const novosChecks: { [key: number]: boolean } = {};
      for (let i = 0; i < quantidadeMarcada; i++) {
        novosChecks[i] = true;
      }
      setChecked(novosChecks);
    } catch (error) {
      console.error("Erro ao buscar treinos marcados:", error);
    }
  }

  const toggleCheck = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const calcularProgresso = () => {
    const total = treino.length;
    const feitos = Object.values(checked).filter(Boolean).length;
    return Math.round((feitos / total) * 100);
  };

  const animarMoeda = () => {
    setModalVisible(true);
    moedaAnim.setValue(0);
    Animated.spring(moedaAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const salvarProgresso = async () => {
    if (!fase || !tipoTreino) {
      Alert.alert("Erro", "Fase ou tipo de treino não encontrado.");
      return;
    }

    const percentual = calcularProgresso();
    if (percentual === 0) {
      return Alert.alert(
        "Ops!",
        "Você ainda não marcou nenhum exercício como feito."
      );
    }

    try {
      const response = await api.post("/treino-dia/concluir", {
        fase,
        tipo_treino: tipoTreino,
        percentual,
      });

      const data = response.data;

      if (!data) {
        throw new Error("Resposta inválida do servidor.");
      }

      const { pontos, ja_salvo, percentual: salvoPercentual } = data;

      if (ja_salvo) {
        Alert.alert(
          "Treino já realizado",
          `Você já concluiu esse treino hoje com ${salvoPercentual}% e ganhou ${pontos} ponto${
            pontos !== 1 ? "s" : ""
          }.`
        );
      } else {
        setPontosGanho(pontos);
        animarMoeda();
      }

      setProgressoSalvo(true);
    } catch (error: any) {
      console.error("Erro ao salvar progresso:", error);
      if (error.message === "Network Error") {
        Alert.alert(
          "Erro de conexão",
          "Não foi possível conectar com o servidor."
        );
      } else {
        Alert.alert("Erro", "Erro ao salvar o progresso. Tente novamente.");
      }
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color="#A56C6C" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
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
            {/* 🔙 Botão de voltar */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#5C3B3B" />
            </TouchableOpacity>

            {/* 🦋 Logo animada */}
            <AnimatedLogo />

            <Text style={globalStyles.title}>Fase: {fase}</Text>
            <Text style={globalStyles.subtitle}>Treino {tipoTreino}</Text>

            {treino.map((ex, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.checkRow}>
                  <CheckBox
                    value={checked[index] || false}
                    onValueChange={() => toggleCheck(index)}
                    color={checked[index] ? "#A56C6C" : undefined}
                  />
                  <Text style={styles.exerciseTitle}>{ex.exercicio}</Text>
                </View>

                {ex.metodo && (
                  <Text style={styles.itemText}>Método: {ex.metodo}</Text>
                )}
                {ex.series && (
                  <Text style={styles.itemText}>Séries: {ex.series}</Text>
                )}
                {ex.repeticoes && (
                  <Text style={styles.itemText}>
                    Repetições: {ex.repeticoes}
                  </Text>
                )}
                {ex.descanso && (
                  <Text style={styles.itemText}>Descanso: {ex.descanso}</Text>
                )}
                {ex.cadencia && (
                  <Text style={styles.itemText}>Cadência: {ex.cadencia}</Text>
                )}
                {ex.intensidade && (
                  <Text style={styles.itemText}>
                    Intensidade: {ex.intensidade}
                  </Text>
                )}
                {ex.duracao && (
                  <Text style={styles.itemText}>Duração: {ex.duracao}</Text>
                )}
                {ex.obs && <Text style={styles.itemText}>Obs: {ex.obs}</Text>}

                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    styles.videoButton,
                    {
                      paddingVertical: 6,
                      paddingHorizontal: 20,
                      alignSelf: "flex-start",
                    },
                  ]}
                  onPress={() =>
                    ex.link_video
                      ? navigation.navigate("VideoPlayer", {
                          url: ex.link_video,
                        })
                      : Alert.alert(
                          "Vídeo em breve",
                          "Este exercício ainda não possui vídeo."
                        )
                  }
                >
                  <Text style={[globalStyles.buttonText, { fontSize: 14 }]}>
                    {ex.link_video ? "Ver vídeo" : "Vídeo em breve"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              disabled={progressoSalvo}
              style={[
                globalStyles.button,
                {
                  marginTop: 16,
                  marginBottom: 40,
                  opacity: progressoSalvo ? 0.6 : 1,
                },
              ]}
              onPress={salvarProgresso}
            >
              <Text style={globalStyles.buttonText}>
                {progressoSalvo ? "Progresso salvo!" : "Salvar progresso"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* 🎉 Modal de confirmação */}
        <Modal isVisible={modalVisible}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#5C3B3B",
                marginBottom: 10,
              }}
            >
              Progresso salvo!
            </Text>
            <Text
              style={{ fontSize: 16, color: "#5C3B3B", textAlign: "center" }}
            >
              Parabéns! Você concluiu {calcularProgresso()}% do treino e ganhou:
            </Text>
            <Animated.Image
              source={require("../../assets/moeda.png")}
              style={{
                width: 60,
                height: 60,
                marginVertical: 16,
                transform: [
                  {
                    scale: moedaAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 1],
                    }),
                  },
                ],
              }}
            />
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#5C3B3B" }}
            >
              {pontosGanho} ponto{pontosGanho !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: "#A56C6C", fontWeight: "bold" }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseTitle: {
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
    color: "#5C3B3B",
  },
  itemText: {
    color: "#333",
    marginBottom: 2,
  },
  videoButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
});
