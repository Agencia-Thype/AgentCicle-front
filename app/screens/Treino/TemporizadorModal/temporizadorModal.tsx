import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Vibration,
} from "react-native";
import { Audio } from "expo-av";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { temporizadorStyles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

interface TemporizadorModalProps {
  nome: string;
  series: number;
  duracao: string;
  descanso: string;
  visible: boolean;
  onNext?: () => void;
  onExit?: () => void;
}

export function TemporizadorModal({
  nome,
  series,
  duracao,
  descanso,
  visible,
  onNext,
  onExit,
}: TemporizadorModalProps) {
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
  const soundExec = useRef<Audio.Sound | null>(null);
  const soundRest = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound: execSound } = await Audio.Sound.createAsync(
          require("../../../assets/sounds/beep_execucao.mp3")
        );
        const { sound: restSound } = await Audio.Sound.createAsync(
          require("../../../assets/sounds/beep_descanso.mp3")
        );
        if (mounted) {
          soundExec.current = execSound;
          soundRest.current = restSound;
          soundExec.current.playAsync();
          Vibration.vibrate(500);
        }
      } catch (e) {
        console.warn("Erro ao carregar sons", e);
      }
    })();
    return () => {
      mounted = false;
      soundExec.current?.unloadAsync();
      soundRest.current?.unloadAsync();
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
              soundRest.current?.replayAsync();
              Vibration.vibrate(500);
              setIsExercisePhase(false);
              setTimeLeft(restDurationSec);
              setCurrentPhaseTotal(restDurationSec);
              setCompletedReps(next);
            }
          } else {
            soundExec.current?.replayAsync();
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
        soundRest.current?.replayAsync();
        Vibration.vibrate(500);
      }
    } else {
      setIsExercisePhase(true);
      setTimeLeft(exerciseDurationSec);
      setCurrentPhaseTotal(exerciseDurationSec);
      soundExec.current?.replayAsync();
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
              <Ionicons name={paused ? "play" : "pause"} size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={temporizadorStyles.circleButton} onPress={avancarFase}>
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={temporizadorStyles.circleButton} onPress={() => setEditar(true)}>
              <Ionicons name="create-outline" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[temporizadorStyles.circleButton, { backgroundColor: "#91766E" }]} onPress={onExit}>
              <Ionicons name="close" size={28} color="#fff" />
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
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={temporizadorStyles.botaoSalvarTexto}>Salvar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
