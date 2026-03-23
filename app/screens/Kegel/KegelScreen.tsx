import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  Animated,
} from "react-native";
import AppBackground from "../../components/AppBackground";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, themeColors } from "../../theme/global";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation";
import { api } from "../../services/api";
import { KegelTemporizadorModal } from "./KegelTemporizadorModal";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Kegel">;

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

interface TreinoKegelResponse {
  nivel: string;
  exercicios: ExercicioKegel[];
  progresso_usuario?: {
    nivel_atual: string;
    total_exercicios: number;
    exercicios_concluidos: string[];
    nivel_concluido: boolean;
    percentual_conclusao: number;
  };
}

interface StatusNiveisResponse {
  [key: string]: {
    nome: string;
    total_exercicios: number;
    exercicios_concluidos: number;
    percentual_conclusao: number;
    concluido: boolean;
    bloqueado: boolean;
    motivo_bloqueio: string | null;
    exercicios_nomes: string[];
    exercicios_ids: string[];
    exercicios_completados_ids: string[];
  };
}

type NivelKegel = "iniciante" | "intermediario" | "avancado";

const niveis: { value: NivelKegel; label: string }[] = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

export default function KegelScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<TreinoKegelResponse | null>(null);
  const [nivelSelecionado, setNivelSelecionado] = useState<NivelKegel>("iniciante");
  const [mostrarSeletorNivel, setMostrarSeletorNivel] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioKegel | null>(null);
  const [mostrarTemporizador, setMostrarTemporizador] = useState(false);
  const [statusNiveis, setStatusNiveis] = useState<StatusNiveisResponse | null>(null);

  useEffect(() => {
    carregarStatusNiveis();
  }, []);

  useEffect(() => {
    carregarTreino();
  }, [nivelSelecionado]);

  const carregarStatusNiveis = async () => {
    try {
      const response = await api.get("/kegel/status-niveis");
      setStatusNiveis(response.data);
    } catch (error) {
      console.error("Erro ao carregar status dos níveis:", error);
    }
  };

  const carregarTreino = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/kegel/treino-dia?nivel=${nivelSelecionado}`);
      setTreino(response.data);
    } catch (error) {
      console.error("Erro ao carregar treino de Kegel:", error);
      Alert.alert("Erro", "Não foi possível carregar os exercícios de Kegel.");
    } finally {
      setLoading(false);
    }
  };

  const atualizarNivel = async (novoNivel: NivelKegel) => {
    try {
      const response = await api.post("/kegel/atualizar-nivel", novoNivel);
      setNivelSelecionado(novoNivel);
      setMostrarSeletorNivel(false);

      const infoDesbloqueio = response.data.info_desbloqueio;
      const nivelInfo = infoDesbloqueio[novoNivel];

      let mensagem = `Nível atualizado para ${niveis.find(n => n.value === novoNivel)?.label}`;

      if (nivelInfo?.bloqueado) {
        mensagem += `\n\n⚠️ ${nivelInfo.motivo}`;
      } else if (novoNivel === "intermediario" && !infoDesbloqueio.intermediario?.bloqueado) {
        mensagem += "\n\n🎉 Nível desbloqueado!";
      } else if (novoNivel === "avancado" && !infoDesbloqueio.avancado?.bloqueado) {
        mensagem += "\n\n🎉 Nível desbloqueado!";
      }

      Alert.alert("Sucesso", mensagem);
    } catch (error: any) {
      console.error("Erro ao atualizar nível:", error);
      const errorMsg = error.response?.data?.erro || "Não foi possível atualizar o nível.";
      Alert.alert("Erro", errorMsg);
    }
  };

  const iniciarExercicio = (exercicio: ExercicioKegel) => {
    setExercicioSelecionado(exercicio);
    setMostrarTemporizador(true);
  };

  const registrarConclusao = async (exercicio: ExercicioKegel) => {
    try {
      await api.post("/kegel/concluir-exercicio", {
        nivel: exercicio.nivel,
        exercicio_id: exercicio.id,
        percentual: 100
      });

      // Recarregar status dos níveis
      await carregarStatusNiveis();

      // Recarregar treino atual para atualizar progresso
      await carregarTreino();
    } catch (error) {
      console.error("Erro ao registrar conclusão:", error);
    }
  };

  const getNivelLabel = (nivel: string) => {
    return niveis.find(n => n.value === nivel)?.label || nivel;
  };

  const formatarDuracao = (segundos: number): string => {
    if (segundos < 60) {
      return `${segundos}s`;
    }
    const minutos = Math.floor(segundos / 60);
    const segsRestantes = segundos % 60;
    return segsRestantes > 0 ? `${minutos}min ${segsRestantes}s` : `${minutos}min`;
  };

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={globalStyles.centeredContainer}>
            <ActivityIndicator size="large" color="#9260CE" />
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#5C3B3B" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={globalStyles.title}>Exercícios de Kegel</Text>
              <TouchableOpacity
                style={styles.nivelButton}
                onPress={() => setMostrarSeletorNivel(true)}
              >
                <Ionicons name="layers-outline" size={20} color="#fff" />
                <Text style={styles.nivelButtonText}>{getNivelLabel(nivelSelecionado)}</Text>
                <Ionicons name="chevron-down" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Informações do Nível */}
          {treino?.progresso_usuario && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={20} color="#A56C6C" />
                <Text style={styles.infoText}>
                  Nível atual: <Text style={styles.infoTextBold}>{getNivelLabel(treino.nivel)}</Text>
                </Text>
              </View>
              <Text style={styles.infoSubtext}>
                {treino.progresso_usuario.total_exercicios} exercício(s) disponível(is)
              </Text>
              <Text style={styles.infoSubtext}>
                Progresso: {treino.progresso_usuario.percentual_conclusao.toFixed(0)}% concluído
              </Text>
            </View>
          )}

          {/* Lista de Exercícios */}
          {treino?.exercicios.map((exercicio, index) => {
            const isConcluido = treino.progresso_usuario?.exercicios_concluidos?.includes(exercicio.id);

            return (
              <View key={exercicio.id} style={[styles.exercicioCard, isConcluido && styles.exercicioCardCompleted]}>
                <View style={styles.exercicioHeader}>
                  <View style={styles.exercicioTitleContainer}>
                    {isConcluido && (
                      <Ionicons name="checkmark-circle" size={24} color="#4caf50" style={styles.completedIcon} />
                    )}
                    <Text style={styles.exercicioTitle}>{exercicio.nome}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => iniciarExercicio(exercicio)}
                  >
                    <Ionicons name="play-circle" size={32} color="#A56C6C" />
                  </TouchableOpacity>
              </View>

              <View style={styles.exercicioDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="fitness-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>Objetivo: {exercicio.objetivo}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="repeat-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>{exercicio.series} séries</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>Descanso: {formatarDuracao(exercicio.descanso_segundos)}</Text>
                </View>
              </View>

              {/* Instruções do Exercício */}
              <View style={styles.instrucoesContainer}>
                <Text style={styles.instrucoesTitle}>Instruções:</Text>
                {exercicio.instrucoes.map((serie, serieIndex) => (
                  <View key={serieIndex} style={styles.serieContainer}>
                    <Text style={styles.serieTitle}>Série {serieIndex + 1}:</Text>
                    <Text style={styles.serieRepeticoes}>{serie.repeticoes} repetições</Text>
                    <View style={styles.fasesContainer}>
                      {serie.fases.map((fase, faseIndex) => (
                        <View key={faseIndex} style={styles.faseItem}>
                          <View style={styles.faseHeader}>
                            <View
                              style={[
                                styles.faseIndicator,
                                fase.tipo.includes("contracao") ? styles.contracaoIndicator : styles.relaxamentoIndicator,
                              ]}
                            />
                            <Text style={styles.faseTipo}>
                              {fase.tipo === "contracao" ? "Contração" :
                               fase.tipo === "contracao_forte" ? "Contração Forte" :
                               fase.tipo === "relaxamento" ? "Relaxamento" : fase.tipo}
                            </Text>
                          </View>
                          <Text style={styles.faseDuracao}>{formatarDuracao(fase.duracao_segundos)}</Text>
                          <Text style={styles.faseInstrucao}>{fase.instrucao}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
        </ScrollView>

        {/* Modal de Seleção de Nível */}
        <Modal visible={mostrarSeletorNivel} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione o Nível</Text>
              <Text style={styles.modalSubtitle}>Você pode praticar qualquer nível, mas precisa desbloquear progredindo</Text>

              {niveis.map((nivel) => {
                const nivelStatus = statusNiveis?.[nivel.value];
                const isBloqueado = nivelStatus?.bloqueado || false;
                const progresso = nivelStatus?.percentual_conclusao || 0;

                return (
                  <TouchableOpacity
                    key={nivel.value}
                    style={[
                      styles.nivelOption,
                      nivelSelecionado === nivel.value && styles.nivelOptionSelected,
                      isBloqueado && styles.nivelOptionBlocked,
                    ]}
                    onPress={() => atualizarNivel(nivel.value)}
                    disabled={false} // Sempre permite clicar
                  >
                    <View style={styles.nivelOptionContent}>
                      <View style={styles.nivelOptionLeft}>
                        {isBloqueado ? (
                          <Ionicons name="lock-closed" size={24} color="#999" />
                        ) : nivelSelecionado === nivel.value ? (
                          <Ionicons name="checkmark-circle" size={24} color="#A56C6C" />
                        ) : (
                          <Ionicons name="unlock-open" size={24} color="#A56C6C" />
                        )}

                        <View style={styles.nivelOptionTextContainer}>
                          <Text
                            style={[
                              styles.nivelOptionText,
                              nivelSelecionado === nivel.value && styles.nivelOptionTextSelected,
                              isBloqueado && styles.nivelOptionTextBlocked,
                            ]}
                          >
                            {nivel.label}
                          </Text>

                          {/* Barra de progresso do nível */}
                          {nivelStatus && (
                            <View style={styles.nivelProgressContainer}>
                              <View style={styles.nivelProgressBar}>
                                <View
                                  style={[
                                    styles.nivelProgressFill,
                                    { width: `${progresso}%` }
                                  ]}
                                />
                              </View>
                              <Text style={styles.nivelProgressText}>
                                {nivelStatus.exercicios_concluidos}/{nivelStatus.total_exercicios}
                              </Text>
                            </View>
                          )}

                          {/* Mensagem de bloqueio */}
                          {isBloqueado && nivelStatus?.motivo_bloqueio && (
                            <Text style={styles.nivelBlockedText}>
                              {nivelStatus.motivo_bloqueio}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setMostrarSeletorNivel(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de Temporizador */}
        {exercicioSelecionado && mostrarTemporizador && (
          <KegelTemporizadorModal
            exercicio={exercicioSelecionado}
            visible={mostrarTemporizador}
            onClose={() => {
              setMostrarTemporizador(false);
              setExercicioSelecionado(null);
            }}
            onComplete={async () => {
              if (exercicioSelecionado) {
                await registrarConclusao(exercicioSelecionado);

                // Verificar se desbloqueou novo nível
                const nivelInfo = statusNiveis?.[exercicioSelecionado.nivel];
                const nivelStatus = statusNiveis;

                let mensagem = "Parabéns! Exercício concluído com sucesso!";

                // Verificar se desbloqueou intermediário
                if (exercicioSelecionado.nivel === "iniciante") {
                  const inicianteCompleto = nivelStatus?.iniciante?.concluido;
                  if (inicianteCompleto) {
                    mensagem += "\n\n🎉 Você completou todos os exercícios do nível Iniciante!";
                    mensagem += "\n\nNível Intermediário desbloqueado!";
                  }
                }

                // Verificar se desbloqueou avançado
                if (exercicioSelecionado.nivel === "intermediario") {
                  const intermediarioCompleto = nivelStatus?.intermediario?.concluido;
                  if (intermediarioCompleto) {
                    mensagem += "\n\n🎉 Você completou todos os exercícios do nível Intermediário!";
                    mensagem += "\n\nNível Avançado desbloqueado!";
                  }
                }

                Alert.alert("Parabéns!", mensagem);
              }
              setMostrarTemporizador(false);
              setExercicioSelecionado(null);
            }}
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  headerContent: {
    marginTop: 16,
  },
  nivelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A56C6C",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  nivelButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginHorizontal: 8,
  },
  infoCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#A56C6C",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#5C3B3B",
    marginLeft: 8,
  },
  infoTextBold: {
    fontWeight: "700",
  },
  infoSubtext: {
    fontSize: 12,
    color: "#888",
    marginLeft: 28,
  },
  exercicioCard: {
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
  exercicioCardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  exercicioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exercicioTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  completedIcon: {
    marginRight: 8,
  },
  exercicioTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5C3B3B",
    flex: 1,
  },
  playButton: {
    marginLeft: 12,
  },
  exercicioDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  instrucoesContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  instrucoesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5C3B3B",
    marginBottom: 8,
  },
  serieContainer: {
    marginBottom: 12,
  },
  serieTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  serieRepeticoes: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  fasesContainer: {
    paddingLeft: 8,
  },
  faseItem: {
    marginBottom: 8,
  },
  faseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  faseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  contracaoIndicator: {
    backgroundColor: "#f44336",
  },
  relaxamentoIndicator: {
    backgroundColor: "#4caf50",
  },
  faseTipo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  faseDuracao: {
    fontSize: 12,
    color: "#666",
    marginLeft: 16,
    marginBottom: 2,
  },
  faseInstrucao: {
    fontSize: 11,
    color: "#888",
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5C3B3B",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
  },
  nivelOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  nivelOptionSelected: {
    backgroundColor: "#FFF5F5",
    borderColor: "#A56C6C",
  },
  nivelOptionBlocked: {
    backgroundColor: "#F5F5F5",
    borderColor: "#ddd",
  },
  nivelOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nivelOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  nivelOptionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nivelOptionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  nivelOptionTextSelected: {
    color: "#A56C6C",
    fontWeight: "600",
  },
  nivelOptionTextBlocked: {
    color: "#999",
  },
  nivelProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  nivelProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginRight: 8,
  },
  nivelProgressFill: {
    height: "100%",
    backgroundColor: "#A56C6C",
    borderRadius: 2,
  },
  nivelProgressText: {
    fontSize: 11,
    color: "#888",
  },
  nivelBlockedText: {
    fontSize: 11,
    color: "#ff9800",
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#666",
    fontWeight: "600",
  },
});
