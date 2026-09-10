import React, { useState } from "react";
import { Image, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import AppBackground from "../../components/AppBackground";
import { TreinoExercicio } from "../../interface/TreinoDoDiaInterface";
import { palette } from "../../theme/colors";
import { treinoStyles as styles } from "./treinoVisualStyles";
import { getExerciseImage } from "./exerciseImages";

type Props = {
  fase: string;
  tipoTreino: string;
  duracaoTotal: number;
  treino: TreinoExercicio[];
  checked: Record<number, boolean>;
  progresso: number;
  progressoSalvo: boolean;
  onBack: () => void;
  onToggle: (index: number) => void;
  onPlay: (exercicio: TreinoExercicio) => void;
  onStart: () => void;
  onNavigate: (route: string) => void;
};

export default function TreinoVisual(props: Props) {
  const concluidos = Object.values(props.checked).filter(Boolean).length;

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <View style={styles.brand}>
            <Text style={styles.brandName}>Cíclica</Text>
            <Text style={styles.brandTagline}>SEU CORPO EM HARMONIA</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.overline}>SEU TREINO</Text>
            <Text style={styles.phaseTitle}>Fase {props.fase || "Ovulatória"}</Text>
            <Text style={styles.workoutName}>Treino {props.tipoTreino || "D"}</Text>
            <Text style={styles.description}>Mais energia, mais força.{"\n"}Aproveite essa fase para se desafiar e evoluir.</Text>
            <View style={styles.mascotBadge}>
              <Image
                source={require("../../assets/01 Neutra/Lunia Neutra_01.png")}
                style={styles.luniaImage}
              />
              <MaterialCommunityIcons name="moon-waning-crescent" size={29} color="#B59435" style={styles.moon} />
              <Text style={styles.mascotText}>força em ciclo</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <Metric icon="clock-outline" value={`${props.duracaoTotal || 0} min`} label="Duração estimada" />
            <Metric icon="dumbbell" value={props.tipoTreino || "Força"} label="Foco principal" />
            <Metric icon="signal-cellular-2" value="Intermediário" label="Nível" />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={props.onStart}>
            <Ionicons name="play" size={29} color="#fff" />
            <Text style={styles.startButtonText}>{props.progressoSalvo ? "Progresso salvo!" : "Iniciar treino"}</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercícios de hoje</Text>
            <View style={styles.sectionProgress}>
              <Text style={styles.sectionCount}>{concluidos} de {props.treino.length} exercícios</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(8, props.progresso)}%` }]} />
              </View>
            </View>
          </View>

          {props.treino.map((exercicio, index) => (
            <ExerciseCard
              key={`${exercicio.exercicio}-${index}`}
              exercicio={exercicio}
              index={index}
              done={!!props.checked[index]}
              onToggle={() => props.onToggle(index)}
              onPlay={() => props.onPlay(exercicio)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <NavItem label="Início" icon="home-outline" onPress={() => props.onNavigate("Home")} />
          <NavItem label="Ciclo" icon="calendar-month-outline" onPress={() => props.onNavigate("Calendario")} />
          <NavItem label="Kegel" icon="meditation" onPress={() => props.onNavigate("Kegel")} />
          <NavItem label="Treinos" icon="dumbbell" active onPress={() => props.onNavigate("TreinoDoDia")} />
          <NavItem label="Perfil" icon="account-outline" onPress={() => props.onNavigate("Perfil")} />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

function NavItem({ label, icon, active, onPress }: { label: string; icon: any; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={25} color={active ? palette.purpleDark : "#706687"} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
      {active && <View style={styles.navDot} />}
    </TouchableOpacity>
  );
}

function Metric({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <MaterialCommunityIcons name={icon} size={27} color="#5D743E" />
      <View style={styles.metricCopy}>
        <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

function ExerciseCard({ exercicio, index, done, onToggle, onPlay }: {
  exercicio: TreinoExercicio; index: number; done: boolean; onToggle: () => void; onPlay: () => void;
}) {
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const exerciseImage = getExerciseImage(exercicio.exercicio);

  return (
    <View style={styles.exerciseCard}>
      <TouchableOpacity style={[styles.exerciseNumber, done && styles.exerciseNumberDone]} onPress={onToggle}>
        {done ? <MaterialIcons name="check" size={18} color="#fff" /> : <Text style={styles.exerciseNumberText}>{index + 1}</Text>}
      </TouchableOpacity>
      <View style={styles.exerciseImage}>
        {exerciseImage ? (
          <Image source={exerciseImage} style={styles.exercisePhoto} />
        ) : (
          <MaterialCommunityIcons name="human-handsup" size={58} color="#795D73" />
        )}
      </View>
      <View style={styles.exerciseBody}>
        <Text style={styles.exerciseTitle} numberOfLines={2} adjustsFontSizeToFit>{exercicio.exercicio}</Text>
        {!!exercicio.metodo && <Text style={styles.method}>{exercicio.metodo}</Text>}
        <DataRow icon="layers-outline" label="Séries" value={exercicio.series || "—"} />
        <DataRow icon="repeat" label="Repetições" value={exercicio.repeticoes || "—"} />
        <DataRow icon="clock-outline" label="Descanso" value={exercicio.descanso || "Sem intervalo"} />
        <DataRow icon="timer-outline" label="Duração" value={exercicio.duracao || "—"} />
      </View>
      <TouchableOpacity style={styles.playButton} onPress={onPlay}>
        <Ionicons name="play" size={22} color="#fff" />
      </TouchableOpacity>
      {!!exercicio.obs && (
        <View style={styles.note}>
          <TouchableOpacity
            style={styles.noteOpenArea}
            onPress={() => setInstructionsVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir instruções de ${exercicio.exercicio}`}
          >
            <MaterialCommunityIcons name="notebook-outline" size={23} color="#383948" />
            <Text style={styles.noteText} numberOfLines={2}>{exercicio.obs}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.completionCheck, done && styles.completionCheckDone]}
            onPress={onToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={`Marcar ${exercicio.exercicio} como concluído`}
          >
            {done && <MaterialIcons name="check" size={16} color="#fff" />}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={instructionsVisible} transparent animationType="fade" onRequestClose={() => setInstructionsVisible(false)}>
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsModal}>
            <View style={styles.instructionsHeader}>
              <View style={styles.instructionsIcon}>
                <MaterialCommunityIcons name="notebook-outline" size={27} color={palette.purpleDark} />
              </View>
              <View style={styles.instructionsHeading}>
                <Text style={styles.instructionsOverline}>INSTRUÇÕES</Text>
                <Text style={styles.instructionsTitle}>{exercicio.exercicio}</Text>
              </View>
              <TouchableOpacity style={styles.instructionsClose} onPress={() => setInstructionsVisible(false)}>
                <MaterialIcons name="close" size={23} color="#514A55" />
              </TouchableOpacity>
            </View>
            <Text style={styles.instructionsText}>{exercicio.obs}</Text>
            <TouchableOpacity style={styles.instructionsButton} onPress={() => setInstructionsVisible(false)}>
              <Text style={styles.instructionsButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DataRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#343644" />
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}
