import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Vibration,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface FaseKegel {
  tipo: string;
  duracao_segundos: number;
  instrucao: string;
}

interface SerieKegel {
  repeticoes: number;
  fases: FaseKegel[];
}

interface ExercicioKegel {
  id: string;
  nome: string;
  nivel: string;
  objetivo: string;
  series: number;
  descanso_segundos: number;
  instrucoes: SerieKegel[];
}

interface KegelTemporizadorModalProps {
  exercicio: ExercicioKegel;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function KegelTemporizadorModal({
  exercicio,
  visible,
  onClose,
  onComplete,
}: KegelTemporizadorModalProps) {
  const [currentSerie, setCurrentSerie] = useState(0);
  const [currentRepeticao, setCurrentRepeticao] = useState(1);
  const [currentFase, setCurrentFase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPhaseTotal, setCurrentPhaseTotal] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundExecRef = useRef<Audio.Sound | null>(null);
  const soundRestRef = useRef<Audio.Sound | null>(null);

  // Obter a série e fase atual
  const currentSerieData = exercicio.instrucoes[currentSerie];
  const currentFaseData = currentSerieData?.fases[currentFase];

  // Iniciar o temporizador quando o modal abrir
  useEffect(() => {
    if (visible && !completed && currentFaseData) {
      const duracao = Math.round(currentFaseData.duracao_segundos);
      setTimeLeft(duracao);
      setCurrentPhaseTotal(duracao);
    }
  }, [visible, currentSerie, currentFase, completed]);

  // Carregar sons
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound: execSound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/beep_execucao.mp3")
        );
        const { sound: restSound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/beep_descanso.mp3")
        );
        if (mounted) {
          soundExecRef.current = execSound;
          soundRestRef.current = restSound;
          // Som inicial
          await execSound.playAsync();
          Vibration.vibrate(500);
        }
      } catch (e) {
        console.warn("Erro ao carregar sons", e);
      }
    })();
    return () => {
      mounted = false;
      soundExecRef.current?.unloadAsync();
      soundRestRef.current?.unloadAsync();
    };
  }, []);

  // Lógica do temporizador
  useEffect(() => {
    if (!visible || completed || paused || !currentFaseData) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          avancarFase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [visible, paused, completed, currentSerie, currentFase, currentRepeticao]);

  const avancarFase = async () => {
    const serieAtual = exercicio.instrucoes[currentSerie];
    if (!serieAtual) return;

    const proximaFase = currentFase + 1;

    // Verificar se ainda há fases nesta repetição
    if (proximaFase < serieAtual.fases.length) {
      setCurrentFase(proximaFase);
      const novaFase = serieAtual.fases[proximaFase];
      const duracao = Math.round(novaFase.duracao_segundos);
      setTimeLeft(duracao);
      setCurrentPhaseTotal(duracao);

      // Tocar som e vibrar
      await tocarSomProximaFase(novaFase.tipo);
    } else {
      // Finalizou todas as fases da repetição, avançar para próxima repetição ou série
      avancarRepeticaoOuSerie();
    }
  };

  const avancarRepeticaoOuSerie = async () => {
    const serieAtual = exercicio.instrucoes[currentSerie];
    if (!serieAtual) return;

    const proximaRepeticao = currentRepeticao + 1;

    // Verificar se ainda há repetições nesta série
    if (proximaRepeticao <= serieAtual.repeticoes) {
      setCurrentRepeticao(proximaRepeticao);
      setCurrentFase(0); // Voltar para a primeira fase

      const primeiraFase = serieAtual.fases[0];
      const duracao = Math.round(primeiraFase.duracao_segundos);
      setTimeLeft(duracao);
      setCurrentPhaseTotal(duracao);

      // Tocar som de nova repetição
      await soundExecRef.current?.replayAsync();
      Vibration.vibrate([100, 50, 100]);
    } else {
      // Finalizou todas as repetições da série, avançar para próxima série ou concluir
      await avancarSerie();
    }
  };

  const avancarSerie = async () => {
    const proximaSerie = currentSerie + 1;

    // Verificar se ainda há séries
    if (proximaSerie < exercicio.instrucoes.length) {
      setCurrentSerie(proximaSerie);
      setCurrentRepeticao(1);
      setCurrentFase(0);

      const novaSerie = exercicio.instrucoes[proximaSerie];
      const primeiraFase = novaSerie.fases[0];
      const duracao = Math.round(primeiraFase.duracao_segundos);
      setTimeLeft(duracao);
      setCurrentPhaseTotal(duracao);

      // Tocar som de descanso entre séries
      await soundRestRef.current?.replayAsync();
      Vibration.vibrate([100, 50, 100, 50, 100]);
    } else {
      // Concluiu todas as séries do exercício
      await concluirExercicio();
    }
  };

  const concluirExercicio = async () => {
    setCompleted(true);
    await soundExecRef.current?.replayAsync();
    Vibration.vibrate([200, 100, 200]);
  };

  const tocarSomProximaFase = async (tipoFase: string) => {
    if (tipoFase.includes("contracao")) {
      await soundExecRef.current?.replayAsync();
    } else {
      await soundRestRef.current?.replayAsync();
    }
    Vibration.vibrate(500);
  };

  const togglePause = () => {
    setPaused(!paused);
  };

  const avancarManualmente = async () => {
    if (!currentFaseData) return;
    clearInterval(intervalRef.current!);
    avancarFase();
  };

  const voltarInicio = () => {
    setCurrentSerie(0);
    setCurrentRepeticao(1);
    setCurrentFase(0);
    setCompleted(false);
    setPaused(false);

    const primeiraFase = exercicio.instrucoes[0].fases[0];
    const duracao = Math.round(primeiraFase.duracao_segundos);
    setTimeLeft(duracao);
    setCurrentPhaseTotal(duracao);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const getFaseLabel = (tipo: string): string => {
    if (tipo === "contracao") return "Contração";
    if (tipo === "contracao_forte") return "Contração Forte";
    if (tipo === "relaxamento") return "Relaxamento";
    return tipo;
  };

  const getFaseColor = (tipo: string): string => {
    if (tipo.includes("contracao")) return "#f44336";
    if (tipo === "relaxamento") return "#4caf50";
    return "#ff9800";
  };

  const fillPercent =
    currentPhaseTotal > 0 ? ((currentPhaseTotal - timeLeft) / currentPhaseTotal) * 100 : 0;

  if (completed) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={["#A56C6C", "#8B5A5A"]} style={styles.completedContainer}>
            <View style={styles.completedContent}>
              <Ionicons name="checkmark-circle" size={80} color="#fff" />
              <Text style={styles.completedTitle}>Exercício Concluído!</Text>
              <Text style={styles.completedText}>{exercicio.nome}</Text>

              <TouchableOpacity style={styles.completedButton} onPress={onComplete}>
                <Text style={styles.completedButtonText}>Continuar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.completedCloseButton} onPress={onClose}>
                <Text style={styles.completedCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  if (!currentFaseData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.exerciseName}>{exercicio.nome}</Text>
            <Text style={styles.exerciseSubtitle}>
              Série {currentSerie + 1} de {exercicio.instrucoes.length} • Repetição {currentRepeticao} de{" "}
              {currentSerieData?.repeticoes || 0}
            </Text>
          </View>

          {/* Temporizador Circular */}
          <View style={styles.timerContainer}>
            <AnimatedCircularProgress
              size={220}
              width={12}
              fill={fillPercent}
              tintColor={getFaseColor(currentFaseData.tipo)}
              backgroundColor="#eee"
              lineCap="round"
            >
              {() => (
                <View style={styles.timerContent}>
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                  <Text style={styles.phaseText}>{getFaseLabel(currentFaseData.tipo)}</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          {/* Instrução da Fase Atual */}
          <View style={styles.instructionContainer}>
            <Ionicons
              name={currentFaseData.tipo.includes("contracao") ? "arrow-up-circle" : "arrow-down-circle"}
              size={24}
              color={getFaseColor(currentFaseData.tipo)}
            />
            <Text style={styles.instructionText}>{currentFaseData.instrucao}</Text>
          </View>

          {/* Controles */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
              <Ionicons name={paused ? "play" : "pause"} size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={avancarManualmente}>
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.secondaryButton]}
              onPress={voltarInicio}
            >
              <Ionicons name="refresh" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.closeButton]}
              onPress={onClose}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 380,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5C3B3B",
    textAlign: "center",
    marginBottom: 8,
  },
  exerciseSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerContent: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#5C3B3B",
  },
  phaseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  instructionText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#A56C6C",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#7D5A5A",
  },
  closeButton: {
    backgroundColor: "#91766E",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  completedContent: {
    alignItems: "center",
    padding: 32,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 24,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  completedButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    marginBottom: 12,
  },
  completedButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A56C6C",
  },
  completedCloseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  completedCloseButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
