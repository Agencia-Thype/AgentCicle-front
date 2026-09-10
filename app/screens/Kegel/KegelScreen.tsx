import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppBackground from "../../components/AppBackground";
import { RootStackParamList } from "../../navigation";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palette } from "../../theme/colors";
import { KegelTemporizadorModal } from "./KegelTemporizadorModal";
import { kegelStyles as styles } from "./kegelStyles";
import FloatingLuniaCoach from "../../components/LunIA/LuniaFloatingMessage";
import LunIAModal from "../../components/LunIA/LuniaModal";
import { useFaseLunar } from "../../hooks/useFaseLunar";

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

// Alterar quando o protocolo terapêutico do backend mudar. Além de evitar uma
// resposta em cache, faz o Fast Refresh buscar os novos tempos sem reiniciar o app.
const REVISAO_PROTOCOLO_KEGEL = 4;

export default function KegelScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<TreinoKegelResponse | null>(null);
  const [nivelSelecionado, setNivelSelecionado] = useState<NivelKegel>("iniciante");
  const [mostrarSeletorNivel, setMostrarSeletorNivel] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioKegel | null>(null);
  const [mostrarTemporizador, setMostrarTemporizador] = useState(false);
  const [statusNiveis, setStatusNiveis] = useState<StatusNiveisResponse | null>(null);
  const [mostrarLunia, setMostrarLunia] = useState(false);
  const { fase } = useFaseLunar();
  // Instruções ficam recolhidas: abertas, cada card vira uma parede de texto.
  const [exercicioExpandido, setExercicioExpandido] = useState<string | null>(null);

  useEffect(() => {
    carregarStatusNiveis();
  }, []);

  useEffect(() => {
    carregarTreino();
  }, [nivelSelecionado, REVISAO_PROTOCOLO_KEGEL]);

  useEffect(() => {
    if (!exercicioSelecionado || !treino) return;
    const exercicioAtualizado = treino.exercicios.find(
      (item) => item.id === exercicioSelecionado.id
    );
    if (exercicioAtualizado) setExercicioSelecionado(exercicioAtualizado);
  }, [treino]);

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
      const response = await api.get(
        `/kegel/treino-dia?nivel=${nivelSelecionado}&revisao=${REVISAO_PROTOCOLO_KEGEL}`
      );
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

  // Devolve os pontos ganhos: cada exercício pontua uma vez por dia.
  const registrarConclusao = async (exercicio: ExercicioKegel): Promise<number> => {
    try {
      const response = await api.post("/kegel/concluir-exercicio", {
        nivel: exercicio.nivel,
        exercicio_id: exercicio.id,
        percentual: 100
      });
      const pontos = Number(response.data?.pontos_ganhos) || 0;
      // A Home só relê a pontuação quando encontra esta flag.
      if (pontos > 0) await AsyncStorage.setItem("atualizarPontuacao", "true");

      // Recarregar status dos níveis
      await carregarStatusNiveis();

      // Recarregar treino atual para atualizar progresso
      await carregarTreino();
      return pontos;
    } catch (error) {
      console.error("Erro ao registrar conclusão:", error);
      return 0;
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

  const concluidos = treino?.progresso_usuario?.exercicios_concluidos ?? [];
  const total =
    treino?.progresso_usuario?.total_exercicios ?? treino?.exercicios.length ?? 0;
  const percentual = Math.round(
    treino?.progresso_usuario?.percentual_conclusao ?? 0
  );
  const ir = (rota: string) => navigation.navigate(rota as never);

  if (loading) {
    return (
      <AppBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.purple} />
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>Cíclica</Text>
            <Text style={styles.brandTag}>SEU CICLO, SUA FORÇA.</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Kegel</Text>
            <Text style={styles.heroSubtitle}>Seu assoalho pélvico</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {concluidos.length} de {total} concluídos
              </Text>
              <MaterialCommunityIcons
                name="heart-outline"
                size={19}
                color={palette.purpleDark}
              />
            </View>
          </View>

          <View style={styles.sideQuote}>
            <Text style={styles.sideQuoteText}>
              {`Constância\nvale mais\nque\nintensidade`}
            </Text>
            <MaterialCommunityIcons
              name="heart-outline"
              size={24}
              color={palette.purpleDark}
            />
          </View>
        </View>

        {/* Card de nível — toque abre o seletor, como o card de fase da Lunia */}
        <TouchableOpacity
          style={styles.levelCard}
          activeOpacity={0.85}
          onPress={() => setMostrarSeletorNivel(true)}
        >
          <View style={styles.levelIcon}>
            <MaterialCommunityIcons
              name="layers-triple-outline"
              size={40}
              color={palette.purpleDark}
            />
          </View>
          <View style={styles.levelCopy}>
            <Text style={styles.levelLabel}>Nível atual:</Text>
            <Text style={styles.levelName}>
              {getNivelLabel(treino?.nivel ?? nivelSelecionado)}
            </Text>
            <Text style={styles.levelDescription} numberOfLines={1}>
              {total} exercício{total === 1 ? "" : "s"} · toque para trocar
            </Text>
          </View>
          <View style={styles.levelDivider} />
          <View style={styles.countPill}>
            <Text style={styles.countText}>{percentual}% feito</Text>
          </View>
        </TouchableOpacity>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {treino?.exercicios.length ? (
            treino.exercicios.map((exercicio) => {
              const isConcluido = concluidos.includes(exercicio.id);
              const aberto = exercicioExpandido === exercicio.id;

              return (
                <View
                  key={exercicio.id}
                  style={[styles.exCard, isConcluido && styles.exCardDone]}
                >
                  <View style={styles.exHeader}>
                    <View style={styles.exTitleWrap}>
                      {isConcluido && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color="#6E9C5B"
                        />
                      )}
                      <Text style={styles.exTitle} numberOfLines={2}>
                        {exercicio.nome}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.playBtn, isConcluido && styles.playBtnDone]}
                      onPress={() => iniciarExercicio(exercicio)}
                    >
                      <MaterialCommunityIcons name="play" size={25} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.metaRow}>
                    <Meta icon="target" texto={exercicio.objetivo} />
                    <Meta icon="repeat" texto={`${exercicio.series} séries`} />
                    <Meta
                      icon="timer-sand"
                      texto={`Descanso ${formatarDuracao(exercicio.descanso_segundos)}`}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.toggle}
                    onPress={() =>
                      setExercicioExpandido(aberto ? null : exercicio.id)
                    }
                  >
                    <Text style={styles.toggleText}>
                      {aberto ? "Ocultar instruções" : "Ver instruções"}
                    </Text>
                    <MaterialCommunityIcons
                      name={aberto ? "chevron-up" : "chevron-down"}
                      size={15}
                      color={palette.purple}
                    />
                  </TouchableOpacity>

                  {aberto && (
                    <View style={styles.instrucoes}>
                      {exercicio.instrucoes.map((serie, serieIndex) => (
                        <View key={serieIndex} style={styles.serie}>
                          <View style={styles.serieTop}>
                            <Text style={styles.serieTitle}>
                              Série {serieIndex + 1}
                            </Text>
                            <Text style={styles.serieReps}>
                              {serie.repeticoes} repetições
                            </Text>
                          </View>

                          <View style={styles.fases}>
                            {serie.fases.map((fase, faseIndex) => (
                              <View key={faseIndex} style={styles.faseItem}>
                                <View
                                  style={[
                                    styles.faseDot,
                                    fase.tipo.includes("contracao")
                                      ? styles.faseContracao
                                      : styles.faseRelaxamento,
                                  ]}
                                />
                                <View style={styles.faseCopy}>
                                  <View style={styles.faseTopo}>
                                    <Text style={styles.faseTipo}>
                                      {rotuloDaFase(fase.tipo)}
                                    </Text>
                                    <Text style={styles.faseDuracao}>
                                      {formatarDuracao(fase.duracao_segundos)}
                                    </Text>
                                  </View>
                                  <Text style={styles.faseInstrucao}>
                                    {fase.instrucao}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.vazio}>
              Nenhum exercício disponível neste nível.
            </Text>
          )}
        </ScrollView>

        {/* Chips de nível — mesmo lugar dos chips de pergunta da Lunia */}
        <View style={styles.quickRow}>
          {niveis.map((nivel) => {
            const ativo = nivelSelecionado === nivel.value;
            const bloqueado = statusNiveis?.[nivel.value]?.bloqueado;

            return (
              <TouchableOpacity
                key={nivel.value}
                style={[styles.quick, ativo && styles.quickAtivo]}
                onPress={() => atualizarNivel(nivel.value)}
              >
                <MaterialCommunityIcons
                  name={bloqueado ? "lock-outline" : "lock-open-variant-outline"}
                  size={20}
                  color={ativo ? "#fff" : palette.purpleDark}
                />
                <Text
                  style={[styles.quickText, ativo && styles.quickTextAtivo]}
                  numberOfLines={1}
                >
                  {nivel.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomNav}>
          <Nav icon="home-outline" label="Início" onPress={() => ir("Home")} />
          <Nav
            icon="calendar-month-outline"
            label="Ciclo"
            onPress={() => ir("Calendario")}
          />
          <Nav icon="meditation" label="Kegel" active onPress={() => {}} />
          <Nav
            icon="dumbbell"
            label="Treinos"
            onPress={() => ir("TreinoDoDia")}
          />
          <Nav
            icon="account-outline"
            label="Perfil"
            onPress={() => ir("Perfil")}
          />
        </View>
      </View>

      <Modal visible={mostrarSeletorNivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecione o nível</Text>
            <Text style={styles.modalSubtitle}>
              Você pode praticar qualquer nível, mas precisa desbloquear progredindo.
            </Text>

            {niveis.map((nivel) => {
              const nivelStatus = statusNiveis?.[nivel.value];
              const isBloqueado = nivelStatus?.bloqueado || false;
              const progresso = nivelStatus?.percentual_conclusao || 0;
              const selecionado = nivelSelecionado === nivel.value;

              return (
                <TouchableOpacity
                  key={nivel.value}
                  style={[
                    styles.nivelOption,
                    selecionado && styles.nivelOptionSelecionado,
                    isBloqueado && styles.nivelOptionBloqueado,
                  ]}
                  onPress={() => atualizarNivel(nivel.value)}
                >
                  <View style={styles.nivelOptionLinha}>
                    <MaterialCommunityIcons
                      name={
                        isBloqueado
                          ? "lock-outline"
                          : selecionado
                            ? "check-circle"
                            : "lock-open-variant-outline"
                      }
                      size={24}
                      color={isBloqueado ? "#8C849A" : palette.purpleDark}
                    />

                    <View style={styles.nivelOptionCopy}>
                      <Text
                        style={[
                          styles.nivelOptionTexto,
                          isBloqueado && styles.nivelOptionTextoBloqueado,
                        ]}
                      >
                        {nivel.label}
                      </Text>

                      {nivelStatus && (
                        <View style={styles.nivelProgresso}>
                          <View style={styles.nivelProgressoBarra}>
                            <View
                              style={[
                                styles.nivelProgressoFill,
                                { width: `${progresso}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.nivelProgressoTexto}>
                            {nivelStatus.exercicios_concluidos}/
                            {nivelStatus.total_exercicios}
                          </Text>
                        </View>
                      )}

                      {isBloqueado && nivelStatus?.motivo_bloqueio && (
                        <Text style={styles.nivelBloqueadoTexto}>
                          {nivelStatus.motivo_bloqueio}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalFechar}
              onPress={() => setMostrarSeletorNivel(false)}
            >
              <Text style={styles.modalFecharTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              const pontos = await registrarConclusao(exercicioSelecionado);

              const nivelStatus = statusNiveis;
              let mensagem = "Parabéns! Exercício concluído com sucesso!";
              if (pontos > 0) {
                mensagem += `\n\n+${pontos} ponto${pontos !== 1 ? "s" : ""}`;
              }

              if (exercicioSelecionado.nivel === "iniciante") {
                if (nivelStatus?.iniciante?.concluido) {
                  mensagem +=
                    "\n\n🎉 Você completou todos os exercícios do nível Iniciante!";
                  mensagem += "\n\nNível Intermediário desbloqueado!";
                }
              }

              if (exercicioSelecionado.nivel === "intermediario") {
                if (nivelStatus?.intermediario?.concluido) {
                  mensagem +=
                    "\n\n🎉 Você completou todos os exercícios do nível Intermediário!";
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
      {!mostrarTemporizador && (
        <FloatingLuniaCoach
          userName=""
          mostrarAssistente={mostrarLunia}
          bottomOffset={76}
          onAbrirAssistente={() => setMostrarLunia(true)}
        />
      )}
      <LunIAModal
        visivel={mostrarLunia}
        onFechar={() => setMostrarLunia(false)}
        fase={fase}
        userName=""
      />
    </AppBackground>
  );
}

/** Rótulo legível para o tipo de fase vindo da API. */
function rotuloDaFase(tipo: string): string {
  if (tipo === "contracao") return "Contração";
  if (tipo === "manter") return "Manter";
  if (tipo === "contracao_forte") return "Contração forte";
  if (tipo === "soltar") return "Solta";
  if (tipo === "relaxamento") return "Relaxamento";
  return tipo;
}

function Meta({ icon, texto }: { icon: any; texto: string }) {
  return (
    <View style={styles.metaChip}>
      <MaterialCommunityIcons name={icon} size={13} color={palette.purpleDark} />
      <Text style={styles.metaText} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

function Nav({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialCommunityIcons
        name={icon}
        size={25}
        color={active ? palette.purpleDark : "#756D89"}
      />
      <Text style={[styles.navText, active && styles.navActive]}>{label}</Text>
      {active && <View style={styles.navDot} />}
    </TouchableOpacity>
  );
}
