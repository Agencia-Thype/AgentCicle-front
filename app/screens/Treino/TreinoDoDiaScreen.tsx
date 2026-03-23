import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
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
import AppBackground from "../../components/AppBackground";
import { AnimatedLogo } from "app/components/AnimatedLogo";
import { Ionicons } from "@expo/vector-icons";
import LunIAModal from "app/components/LunIA/LuniaModal";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";
import { TemporizadorModal } from "./TemporizadorModal/temporizadorModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TreinoDoDia">;
type ExercicioTemporizador = {
  nome: string;
  series: number;
  duracao?: string;
  descanso?: string;
};

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
  const [duracaoTotal, setDuracaoTotal] = useState<number>(0);
  const [mostrarTemporizadorExercicio, setMostrarTemporizadorExercicio] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioTemporizador | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const [mostrarLunia, setMostrarLunia] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function buscarTreino() {
      try {
        const response = await api.get("/treino-dia");
        setTreino(response.data.exercicios);
        setFase(response.data.fase);
        setTipoTreino(response.data.tipo_treino);
        calcularDuracaoTotal(response.data.exercicios);
        buscarMarcadosHoje(response.data.exercicios.length);
      } catch (error) {
        console.error("Erro ao buscar treino:", error);
      } finally {
        setLoading(false);
      }
    }
    buscarTreino();
  }, []);

  const calcularDuracaoTotal = (exercicios: TreinoExercicio[]) => {
    let totalMin = 0;
    for (const ex of exercicios) {
      const match = ex.duracao?.match(/(\d+)-?(\d+)?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        totalMin += (min + max) / 2;
      }
    }
    setDuracaoTotal(Math.round(totalMin));
  };

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
    Animated.spring(moedaAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const salvarProgresso = async () => {
    if (!fase || !tipoTreino) {
      Alert.alert("Erro", "Fase ou tipo de treino não encontrado.");
      return;
    }
    const percentual = calcularProgresso();
    if (percentual === 0) {
      return Alert.alert("Ops!", "Você ainda não marcou nenhum exercício como feito.");
    }
    try {
      const response = await api.post("/treino-dia/concluir", {
        fase,
        tipo_treino: tipoTreino,
        percentual,
      });
      const data = response.data;
      if (!data) throw new Error("Resposta inválida do servidor.");
      const { pontos, ja_salvo, percentual: salvoPercentual } = data;
      if (ja_salvo) {
        Alert.alert("Treino já realizado", `Você já concluiu esse treino hoje com ${salvoPercentual}% e ganhou ${pontos} ponto${pontos !== 1 ? "s" : ""}.`);
      } else {
        setPontosGanho(pontos);
        animarMoeda();
        await AsyncStorage.setItem("atualizarHome", "true");
      }
      setProgressoSalvo(true);
    } catch (error: any) {
      console.error("Erro ao salvar progresso:", error);
      Alert.alert("Erro", error.message === "Network Error" ? "Erro de conexão." : "Erro ao salvar progresso.");
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
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 80 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: "rgba(146,96,206,0.3)", borderRadius: 20, padding: 8, alignSelf: "flex-start", marginBottom: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#EED0FC" />
            </TouchableOpacity>

            <AnimatedLogo />

            <Text style={globalStyles.title}>Fase: {fase}</Text>
            <Text style={globalStyles.subtitle}>Treino {tipoTreino}</Text>
            <Text style={{ color: "#5C3B3B", fontWeight: "600", marginTop: 4, marginBottom: 12 }}>
              🕒 Tempo estimado: {duracaoTotal} minutos
            </Text>

            {treino.map((ex, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.checkRow}>
                  <CheckBox
                    value={checked[index] || false}
                    onValueChange={() => toggleCheck(index)}
                    color={checked[index] ? "#A56C6C" : undefined}
                  />
                  <Text style={styles.exerciseTitle}>{ex.exercicio}</Text>

                  <TouchableOpacity
                    onPress={() => {
                      setExercicioSelecionado({
                        nome: ex.exercicio,
                        series: Number(ex.series || "1"),
                        duracao: ex.duracao,
                        descanso: ex.descanso,
                      });
                      setMostrarTemporizadorExercicio(true);
                    }}
                    style={styles.timerButton}
                  >
                    <Ionicons name="timer-outline" size={22} color="#5C3B3B" />
                  </TouchableOpacity>
                </View>

                {ex.metodo && <Text style={styles.itemText}>Método: {ex.metodo}</Text>}
                {ex.series && <Text style={styles.itemText}>Séries: {ex.series}</Text>}
                {ex.repeticoes && <Text style={styles.itemText}>Repetições: {ex.repeticoes}</Text>}
                {ex.descanso && <Text style={styles.itemText}>Descanso: {ex.descanso}</Text>}
                {ex.duracao && <Text style={styles.itemText}>Duração: {ex.duracao}</Text>}
                {ex.obs && <Text style={styles.itemText}>Obs: {ex.obs}</Text>}
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

        <Modal isVisible={modalVisible}>
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#3F1C65", marginBottom: 10 }}>
              Progresso salvo!
            </Text>
            <Text style={{ fontSize: 16, color: "#3F1C65", textAlign: "center" }}>
              Parabéns! Você concluiu {calcularProgresso()}% do treino e ganhou:
            </Text>
            <Animated.Image
              source={require("../../assets/moeda.png")}
              style={{
                width: 60,
                height: 60,
                marginVertical: 16,
                transform: [{ scale: moedaAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] }) }],
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#5C3B3B" }}>
              {pontosGanho} ponto{pontosGanho !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 20 }}>
              <Text style={{ color: "#A56C6C", fontWeight: "bold" }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {exercicioSelecionado && mostrarTemporizadorExercicio && (
          <TemporizadorModal
            nome={exercicioSelecionado.nome}
            series={Number(exercicioSelecionado.series)}
            duracao={exercicioSelecionado.duracao ?? ""}
            descanso={exercicioSelecionado.descanso ?? ""}
            visible={mostrarTemporizadorExercicio}
            onNext={() => {
              setMostrarTemporizadorExercicio(false);
              setExercicioSelecionado(null);
            }}
            onExit={() => {
              setMostrarTemporizadorExercicio(false);
              setExercicioSelecionado(null);
            }}
          />
        )}

        <FloatingLuniaCoach
          userName={userName}
          mostrarAssistente={mostrarLunia}
          onAbrirAssistente={() => setMostrarLunia(true)}
        />
        <LunIAModal visivel={mostrarLunia} onFechar={() => setMostrarLunia(false)} fase={fase} userName={userName} />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(63,28,101,0.75)",
    borderWidth: 1,
    borderColor: "rgba(146,96,206,0.4)",
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
    color: "#EED0FC",
  },
  timerButton: {
    marginLeft: "auto",
    padding: 8,
    borderRadius: 8,
  },
  itemText: {
    color: "#EED0FC",
    marginBottom: 2,
  },
});
