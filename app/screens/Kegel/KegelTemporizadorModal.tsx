import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import * as Haptics from "expo-haptics";

import LuniaAnimada from "../../components/LuniaAnimada";
import { palette } from "../../theme/colors";
import { calar, falaDaEtapa, falar } from "../../utils/voz";
import { useKegelEngine } from "../../hooks/useKegelEngine";
import type { EstadoKegel, EtapaKegel, ExercicioKegel } from "./kegel.types";
import { fonts } from "../../theme/fonts";

/**
 * Execução do exercício de Kegel.
 *
 * Toda a temporização vem de useKegelEngine: um relógio só comanda fase,
 * cronômetro, contadores, animação da Lunia e feedback. A tela apenas desenha
 * o que o motor diz — não existe regra de exercício aqui dentro.
 */

interface KegelTemporizadorModalProps {
  exercicio: ExercicioKegel;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ROTULO_DO_ESTADO: Record<EstadoKegel, string> = {
  prepare: "Prepare-se",
  contract: "Contraia",
  hold: "Mantenha",
  boost: "Mais forte",
  release: "Relaxe",
  rest: "Descanse",
  complete: "Concluído",
};

const COR_DO_ESTADO: Record<EstadoKegel, string> = {
  prepare: palette.textSecondary,
  contract: palette.purple,
  hold: palette.purple,
  boost: palette.purpleDark,
  release: palette.sage,
  rest: palette.sageLight,
  complete: palette.sage,
};

function formatarTempo(ms: number): string {
  // Segundos inteiros, contando para baixo: 3, 2, 1. Evita a pressão visual
  // causada pelos décimos mudando várias vezes por segundo.
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

export function KegelTemporizadorModal({
  exercicio,
  visible,
  onClose,
  onComplete,
}: KegelTemporizadorModalProps) {
  /** Voz guiando o exercício ("Contrai", "Solta", "Relaxa"). */
  const [vozLigada, setVozLigada] = useState(true);
  const vozLigadaRef = useRef(vozLigada);
  vozLigadaRef.current = vozLigada;

  // Fechar a tela nunca deixa a voz falando sozinha.
  useEffect(() => {
    if (!visible) calar();
    return calar;
  }, [visible]);

  /**
   * Voz e vibração a cada troca de fase, para o exercício poder ser feito sem
   * olhar a tela o tempo todo.
   */
  const avisarTroca = useCallback((etapa: EtapaKegel, anterior: EtapaKegel | null) => {
    // A primeira etapa não precisa de aviso: a usuária acabou de abrir a tela.
    if (!anterior) return;

    if (vozLigadaRef.current) falar(falaDaEtapa(etapa));

    if (etapa.estado === "boost") {
      // Duas batidas: "mais forte".
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
      setTimeout(
        () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined),
        130
      );
      Vibration.vibrate([0, 90, 70, 90]);
      return;
    }

    if (etapa.estado === "contract") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      Vibration.vibrate(120);
      return;
    }

    if (etapa.estado === "release" || etapa.estado === "rest") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      Vibration.vibrate(60);
    }
  }, []);

  const aoConcluir = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    Vibration.vibrate([0, 120, 80, 120, 80, 200]);
    if (vozLigadaRef.current) falar("Muito bem!");
  }, []);

  const motor = useKegelEngine(exercicio, {
    ativo: visible,
    aoConcluir,
    aoTrocarEtapa: avisarTroca,
  });

  const { etapa, progresso, restanteMs, pausado, concluido } = motor;

  // Pausou: a voz para junto com o exercício.
  useEffect(() => {
    if (pausado) calar();
  }, [pausado]);

  const alternarVoz = () => {
    if (vozLigada) calar();
    setVozLigada(!vozLigada);
  };

  // ------------------------------------------------------------- concluído
  if (concluido) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.completedContainer, { backgroundColor: palette.bgSoft }]}>
            <View style={styles.completedContent}>
              <LuniaAnimada estado="complete" progresso={1} largura={150} />
              <Text style={styles.completedTitle}>Exercício Concluído!</Text>
              <Text style={styles.completedText}>{exercicio.nome}</Text>

              <TouchableOpacity style={styles.completedButton} onPress={onComplete}>
                <Text style={styles.completedButtonText}>Continuar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.completedCloseButton} onPress={onClose}>
                <Text style={styles.completedCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (!etapa) return null;

  const cor = COR_DO_ESTADO[etapa.estado];
  const ehDescanso = etapa.estado === "rest" || etapa.estado === "prepare";
  const rotuloVisivel =
    etapa.estado === "release" && etapa.rotulo.toLocaleLowerCase().includes("solta")
      ? "Solta"
      : ROTULO_DO_ESTADO[etapa.estado];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetHandle} />
            <TouchableOpacity
              style={styles.voiceToggle}
              onPress={alternarVoz}
              accessibilityRole="button"
              accessibilityLabel={vozLigada ? "Desligar voz guia" : "Ligar voz guia"}
            >
              <Ionicons name={vozLigada ? "volume-high" : "volume-mute"} size={22} color="#8C5CAD" />
            </TouchableOpacity>
            <Text style={styles.exerciseName}>{exercicio.nome}</Text>
            <View style={styles.counterRow}>
              <View style={styles.counterPill}><MaterialCommunityIcons name="layers-triple-outline" size={21} color="#8C5CAD" /><Text style={styles.counterText}>Série {etapa.serie} de {etapa.totalSeries}</Text></View>
              <View style={styles.counterDivider} />
              <View style={styles.counterPill}><MaterialCommunityIcons name="repeat-variant" size={21} color="#8C5CAD" /><Text style={styles.counterText}>Repetição {etapa.repeticao} de {etapa.totalRepeticoes}</Text></View>
            </View>
            <View style={styles.followBubble}><Text style={styles.followText}>Siga a Lunia</Text><MaterialCommunityIcons name="heart" size={20} color="#A04BC1" /></View>

            {/* A Lunia fica no centro e o anel vira o halo do esforço dela:
                o mesmo progresso move os dois. */}
            <View style={styles.timerContainer}>
              <AnimatedCircularProgress
                size={300}
                width={13}
                fill={progresso * 100}
                tintColor={cor}
                backgroundColor="#EADFED"
                lineCap="round"
                // Sem animação própria: o anel segue o relógio do motor, que já
                // atualiza a cada 50ms. Com a animação padrão ele ficaria meio
                // segundo atrás do número.
                duration={0}
              >
                {() => (
                  <View style={styles.timerContent}>
                    <LuniaAnimada
                      estado={etapa.estado}
                      progresso={progresso}
                      pausado={pausado}
                      largura={210}
                    />
                    <Text style={styles.timerText}>{formatarTempo(restanteMs)}</Text>
                    <View style={[styles.phasePill, { backgroundColor: cor }]}><Text style={styles.phaseText}>{rotuloVisivel.toUpperCase()}</Text></View>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>

            <View style={styles.instructionContainer}>
              <View style={[styles.instructionIcon, { backgroundColor: cor }]}><Ionicons name={etapa.estado === "release" || etapa.estado === "rest" ? "arrow-down" : "arrow-up"} size={27} color="#fff" /></View>
              <View style={styles.instructionCopy}><Text style={styles.instructionText}>{etapa.rotulo}</Text><Text style={styles.instructionSubtext}>Siga o ritmo da Lunia</Text></View>
            </View>
            <View style={styles.controlsContainer}>
              <Control icon={pausado ? "play" : "pause"} label={pausado ? "Continuar" : "Pausar"} onPress={motor.alternarPausa} />
              <Control icon="play-skip-forward" label="Próximo" onPress={motor.pularEtapa} />
              <Control icon="refresh" label="Repetir" onPress={motor.reiniciar} />
              <Control icon="close" label="Encerrar" onPress={onClose} primary />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Control({ icon, label, onPress, primary }: { icon: any; label: string; onPress: () => void; primary?: boolean }) {
  return <View style={styles.controlItem}><TouchableOpacity style={[styles.controlButton, primary && styles.closeButton]} onPress={onPress}><Ionicons name={icon} size={29} color="#fff" /></TouchableOpacity><Text style={styles.controlLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFCFA",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: 18,
    width: "90%",
    maxWidth: 410,
    alignItems: "center",
    // Teto de altura para o conteúdo rolar em vez de vazar da tela.
    maxHeight: "94%",
  },
  modalScroll: {
    width: "100%",
  },
  modalScrollContent: {
    alignItems: "center",
  },
  voiceToggle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4EBF5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: "#DED9DB", marginBottom: 14 },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  exerciseName: {
    fontFamily: fonts.title,
    fontSize: 25,
    color: palette.textPrimary,
    textAlign: "center",
    lineHeight: 29,
    marginBottom: 13,
  },
  exerciseSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  counterRow: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 13 },
  counterPill: { flex: 1, height: 43, borderRadius: 22, backgroundColor: "#F4EBF5", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  counterText: { fontFamily: fonts.bodyBold, fontSize: 11, color: "#4B3C51" },
  counterDivider: { width: 1, height: 29, backgroundColor: "#DCCDE0", marginHorizontal: 8 },
  followBubble: { height: 61, minWidth: 116, borderRadius: 20, backgroundColor: "#F1E4F4", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: -24, zIndex: 3, shadowColor: palette.purpleDark, shadowOpacity: .1, shadowRadius: 8, elevation: 3 },
  followText: { fontFamily: fonts.bodyBold, fontSize: 14, color: "#765092" },
  timerContainer: {
    marginBottom: 12,
  },
  timerContent: {
    alignItems: "center",
  },
  // Reduzido de 48 para a Lunia caber dentro do anel junto com o número.
  timerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 43,
    color: palette.textPrimary,
    lineHeight: 48,
    marginTop: -4,
  },
  phasePill: { minWidth: 132, height: 35, borderRadius: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 17 },
  phaseText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.1,
    color: "#fff",
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.glass,
    borderRadius: 17,
    padding: 11,
    marginBottom: 7,
    width: "100%",
  },
  instructionIcon: { width: 43, height: 43, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  instructionCopy: { flex: 1, marginLeft: 12 },
  instructionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: palette.purpleDark,
  },
  instructionSubtext: { fontFamily: fonts.body, fontSize: 10, color: "#756D80", marginTop: 2 },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  controlItem: { alignItems: "center", width: 66 },
  controlButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.textSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: palette.textSecondary,
  },
  closeButton: {
    backgroundColor: palette.purpleDark,
  },
  controlLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: "#5F5367", marginTop: 5 },
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
    color: palette.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 18,
    color: palette.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  completedButton: {
    backgroundColor: palette.purpleDark,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    marginBottom: 12,
  },
  completedButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.white,
  },
  completedCloseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  completedCloseButtonText: {
    fontSize: 16,
    color: palette.textSecondary,
    fontWeight: "600",
  },
});
