import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Vibration,
  Image,
} from "react-native";
import { criarBipe, tocarDoInicio, type AudioPlayer } from "../../../utils/som";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { temporizadorStyles } from "./styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { palette } from "../../../theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getExerciseImage } from "../exerciseImages";
import { timerReplicaStyles as replica } from "./timerReplicaStyles";

interface TemporizadorModalProps {
  nome: string;
  series: number;
  duracao: string;
  descanso: string;
  visible: boolean;
  onNext?: () => void;
  onExit?: () => void;
  metodo?: string;
  repeticoes?: string;
  observacao?: string;
}

export function TemporizadorModal({
  nome,
  series,
  duracao,
  descanso,
  visible,
  onNext,
  onExit,
  metodo,
  repeticoes,
  observacao,
}: TemporizadorModalProps) {
  const navigation = useNavigation<any>();
  const totalSeries = Number(series) || 1;
  const totalDuracaoMin = duracao.split("-").map((v) => parseInt(v.trim(), 10));
  const totalDescansoSeg = descanso.split("-").map((v) => parseInt(v.trim(), 10));

  const tempoExecucao = Math.floor(((totalDuracaoMin[1] ?? totalDuracaoMin[0] ?? 6) * 60) / totalSeries);
  const tempoDescanso = totalDescansoSeg[0] || 30;

  const [exerciseDurationSec, setExerciseDurationSec] = useState(tempoExecucao);
  const [restDurationSec, setRestDurationSec] = useState(tempoDescanso);
  const [timeLeft, setTimeLeft] = useState(tempoExecucao);
  const [currentPhaseTotal, setCurrentPhaseTotal] = useState(tempoExecucao);
  const [isExercisePhase, setIsExercisePhase] = useState(true);
  const [completedReps, setCompletedReps] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [editar, setEditar] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundExec = useRef<AudioPlayer | null>(null);
  const soundRest = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    try {
      soundExec.current = criarBipe(
        require("../../../assets/sounds/beep_execucao.mp3")
      );
      soundRest.current = criarBipe(
        require("../../../assets/sounds/beep_descanso.mp3")
      );
      soundExec.current.play();
      Vibration.vibrate(500);
    } catch (e) {
      console.warn("Erro ao carregar sons", e);
    }

    return () => {
      soundExec.current?.remove();
      soundRest.current?.remove();
      soundExec.current = null;
      soundRest.current = null;
    };
  }, []);

  useEffect(() => {
    if (!visible || completed || paused) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (isExercisePhase) {
            const next = completedReps + 1;
            if (next >= totalSeries) {
              setCompleted(true);
            } else {
              void tocarDoInicio(soundRest.current);
              Vibration.vibrate(500);
              setIsExercisePhase(false);
              setTimeLeft(restDurationSec);
              setCurrentPhaseTotal(restDurationSec);
              setCompletedReps(next);
            }
          } else {
            void tocarDoInicio(soundExec.current);
            Vibration.vibrate(500);
            setIsExercisePhase(true);
            setTimeLeft(exerciseDurationSec);
            setCurrentPhaseTotal(exerciseDurationSec);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isExercisePhase, visible, paused]);

  const togglePause = () => setPaused(!paused);

  const avancarFase = () => {
    clearInterval(intervalRef.current!);
    if (isExercisePhase) {
      // Avançou uma repetição ao finalizar execução
      const proximaRepeticao = completedReps + 1;
  
      if (proximaRepeticao >= totalSeries) {
        setCompleted(true);
      } else {
        setCompletedReps(proximaRepeticao);
        setIsExercisePhase(false);
        setTimeLeft(restDurationSec);
        setCurrentPhaseTotal(restDurationSec);
        void tocarDoInicio(soundRest.current);
        Vibration.vibrate(500);
      }
    } else {
      setIsExercisePhase(true);
      setTimeLeft(exerciseDurationSec);
      setCurrentPhaseTotal(exerciseDurationSec);
      void tocarDoInicio(soundExec.current);
      Vibration.vibrate(500);
    }
  };

  const fillPercent =
    currentPhaseTotal > 0
      ? ((currentPhaseTotal - timeLeft) / currentPhaseTotal) * 100
      : 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s} min`;
  };

  const timerDisplay = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;
  const exerciseImage = getExerciseImage(nome);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onExit}>
      <SafeAreaView style={replica.safe}>
        <View style={replica.header}>
          <TouchableOpacity style={replica.back} onPress={onExit}><Ionicons name="chevron-back" size={29} color={palette.purpleDark} /></TouchableOpacity>
          <View style={replica.brand}><Text style={replica.brandName}>Cíclica</Text><Text style={replica.tagline}>MOVIMENTO QUE TE FAZ BEM</Text></View>
          <TouchableOpacity onPress={onExit}><Text style={replica.endHeader}>Encerrar</Text></TouchableOpacity>
        </View>

        <View style={replica.content}>
          <Text style={replica.title} numberOfLines={2} adjustsFontSizeToFit>{nome}</Text>
          <Text style={replica.repetition}>{completedReps < totalSeries ? `Repetição ${completedReps + 1} de ${totalSeries}` : "Repetições concluídas"}</Text>
          <View style={replica.ringWrap}>
            <AnimatedCircularProgress size={270} width={14} fill={fillPercent} tintColor="#74406F" backgroundColor="#EEE8F0" lineCap="round">
              {() => <View style={replica.ringInner}><Text style={replica.remaining}>TEMPO RESTANTE</Text><Text style={replica.timer}>{timerDisplay}</Text><View style={replica.divider} /><Text style={replica.phase}>{paused ? "Pausado" : isExercisePhase ? "Em execução" : "Descanso"}</Text></View>}
            </AnimatedCircularProgress>
          </View>

          <View style={replica.metrics}>
            <TimerMetric icon="dumbbell" label="Método" value={metodo || "Padrão"} />
            <TimerMetric icon="repeat" value={repeticoes ? `${repeticoes} reps` : `${totalSeries} séries`} />
            <TimerMetric icon="clock-outline" value={descanso || "Sem intervalo"} />
          </View>

          <View style={replica.tipCard}>
            {exerciseImage ? <Image source={exerciseImage} style={replica.photo} /> : <View style={replica.photo} />}
            <View style={replica.tipCopy}><Text style={replica.tipBadge}>DICA</Text><Text style={replica.tipText} numberOfLines={4}>{observacao || "Mantenha o tronco firme e execute o movimento de forma controlada."}</Text></View>
          </View>

          <View style={replica.controls}>
            <TimerControl icon={paused ? "play" : "pause"} label={paused ? "Continuar" : "Pausar"} primary onPress={togglePause} />
            <TimerControl icon="play-skip-forward" label="Próxima" onPress={avancarFase} />
            <TimerControl icon="create-outline" label="Anotar" onPress={() => setEditar(true)} />
            <TimerControl icon="close" label="Encerrar" onPress={onExit} />
          </View>
        </View>

        {editar && <View style={replica.editPanel}><View style={replica.editRow}><View style={replica.editGroup}><Text style={replica.editLabel}>Execução (s)</Text><TextInput style={replica.editInput} keyboardType="numeric" value={String(exerciseDurationSec)} onChangeText={(text) => { const value = parseInt(text, 10); if (!isNaN(value)) setExerciseDurationSec(value); }} /></View><View style={replica.editGroup}><Text style={replica.editLabel}>Descanso (s)</Text><TextInput style={replica.editInput} keyboardType="numeric" value={String(restDurationSec)} onChangeText={(text) => { const value = parseInt(text, 10); if (!isNaN(value)) setRestDurationSec(value); }} /></View></View><TouchableOpacity style={replica.save} onPress={() => setEditar(false)}><Text style={replica.saveText}>Salvar</Text></TouchableOpacity></View>}
        <View style={replica.motivation}><Ionicons name="heart-outline" size={18} color="#527449" /><Text style={replica.motivationText}>Disciplina hoje, resultados sempre.</Text><MaterialCommunityIcons name="leaf" size={18} color="#527449" /></View>
        <View style={replica.bottomNav}>
          <TimerNav icon="home-outline" label="Início" onPress={() => navigation.navigate("Home")} />
          <TimerNav icon="calendar-month-outline" label="Ciclo" onPress={() => navigation.navigate("Calendario")} />
          <TimerNav icon="meditation" label="Kegel" onPress={() => navigation.navigate("Kegel")} />
          <TimerNav icon="dumbbell" label="Treinos" active onPress={onExit} />
          <TimerNav icon="account-outline" label="Perfil" onPress={() => navigation.navigate("Perfil")} />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onExit}>
      <View style={temporizadorStyles.modalBackground}>
        <View style={temporizadorStyles.modalContainer}>
          <Text style={temporizadorStyles.exerciseName}>{nome}</Text>
          <Text style={temporizadorStyles.repetitionCount}>
            {completedReps < totalSeries
              ? `Repetição ${completedReps + 1} de ${totalSeries}`
              : `Repetições concluídas`}
          </Text>

          <AnimatedCircularProgress
            size={220}
            width={12}
            fill={fillPercent}
            tintColor={isExercisePhase ? "#f44336" : "#4caf50"}
            backgroundColor="#eee"
            lineCap="round"
          >
            {() => (
              <Text style={temporizadorStyles.timerText}>{formatTime(timeLeft)}</Text>
            )}
          </AnimatedCircularProgress>

          <Text style={temporizadorStyles.phaseTextCentered}>
            {isExercisePhase ? "Execução" : "Descanso"}
          </Text>

          <View style={temporizadorStyles.controlsRow}>
            <TouchableOpacity style={temporizadorStyles.circleButton} onPress={togglePause}>
              <Ionicons name={paused ? "play" : "pause"} size={28} color={palette.white} />
            </TouchableOpacity>
            <TouchableOpacity style={temporizadorStyles.circleButton} onPress={avancarFase}>
              <Ionicons name="play-skip-forward" size={28} color={palette.white} />
            </TouchableOpacity>
            <TouchableOpacity style={temporizadorStyles.circleButton} onPress={() => setEditar(true)}>
              <Ionicons name="create-outline" size={26} color={palette.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[temporizadorStyles.circleButton, { backgroundColor: palette.purple }]} onPress={onExit}>
              <Ionicons name="close" size={28} color={palette.white} />
            </TouchableOpacity>
          </View>

          {/* Campos de edição */}
          {editar && (
            <>
              <View style={temporizadorStyles.inputsRow}>
                <View style={temporizadorStyles.inputGroup}>
                  <Text style={temporizadorStyles.inputLabel}>Execução (s):</Text>
                  <TextInput
                    style={temporizadorStyles.timeInput}
                    keyboardType="numeric"
                    value={String(exerciseDurationSec)}
                    onChangeText={(text) => {
                      const val = parseInt(text, 10);
                      if (!isNaN(val)) setExerciseDurationSec(val);
                    }}
                  />
                </View>
                <View style={temporizadorStyles.inputGroup}>
                  <Text style={temporizadorStyles.inputLabel}>Descanso (s):</Text>
                  <TextInput
                    style={temporizadorStyles.timeInput}
                    keyboardType="numeric"
                    value={String(restDurationSec)}
                    onChangeText={(text) => {
                      const val = parseInt(text, 10);
                      if (!isNaN(val)) setRestDurationSec(val);
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={temporizadorStyles.botaoSalvar}
                onPress={() => setEditar(false)}
              >
                <Ionicons name="checkmark" size={22} color={palette.white} />
                <Text style={temporizadorStyles.botaoSalvarTexto}>Salvar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function TimerMetric({ icon, label, value }: { icon: any; label?: string; value: string }) {
  return <View style={replica.metric}><MaterialCommunityIcons name={icon} size={24} color="#577B4D" /><View>{label && <Text style={replica.metricLabel}>{label}</Text>}<Text style={replica.metricValue} numberOfLines={1}>{value}</Text></View></View>;
}

function TimerControl({ icon, label, primary, onPress }: { icon: any; label: string; primary?: boolean; onPress?: () => void }) {
  return <TouchableOpacity style={replica.control} onPress={onPress}><View style={[replica.controlCircle, primary && replica.controlPrimary]}><Ionicons name={icon} size={27} color={primary ? "#fff" : palette.purpleDark} /></View><Text style={replica.controlLabel}>{label}</Text></TouchableOpacity>;
}

function TimerNav({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress?: () => void }) {
  return <TouchableOpacity style={replica.navItem} onPress={onPress}><MaterialCommunityIcons name={icon} size={24} color={active ? palette.purpleDark : "#77708B"} /><Text style={[replica.navText, active && replica.navActive]}>{label}</Text>{active && <View style={replica.navDot} />}</TouchableOpacity>;
}
