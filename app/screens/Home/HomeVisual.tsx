import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import AppBackground from "../../components/AppBackground";
import ClasseLunarModal from "../../components/classeLunarModal";
import { MarcaDaguaOrganica } from "../../components/FormaOrganica";
import { palette } from "../../theme/colors";
import { replicaStyles as styles } from "./homeReplicaStyles";

type Props = {
  navigation: any;
  fase: string;
  mensagem: string;
  descricao: string;
  carregando: boolean;
  humor: string;
  progresso: number;
  pontuacao: number;
  classe: string;
  diasRestantes: number;
  trofeuUri: any;
  modalAberto: boolean;
  menuAberto: boolean;
  onAbrirMenu: () => void;
  onFecharMenu: () => void;
  onAbrirClasse: () => void;
  onFecharClasse: () => void;
};

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function HomeVisual({
  navigation,
  fase,
  mensagem,
  descricao,
  carregando,
  humor,
  progresso,
  pontuacao,
  classe,
  diasRestantes,
  trofeuUri,
  modalAberto,
  menuAberto,
  onAbrirMenu,
  onFecharMenu,
  onAbrirClasse,
  onFecharClasse,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const navegar = (rota: string) => navigation.navigate(rota);

  return (
    <AppBackground>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={onFecharMenu}>
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={onFecharMenu}>
          <View style={styles.drawer}>
            <Text style={styles.drawerBrand}>Cíclica</Text>
            {[
              ["home-outline", "Início", "Home"],
              ["calendar-month-outline", "Ciclo", "Calendario"],
              ["dumbbell", "Treinos", "TreinoDoDia"],
              ["flower-tulip-outline", "Kegel", "Kegel"],
              ["account-outline", "Perfil", "Perfil"],
            ].map(([icon, label, route]) => (
              <TouchableOpacity key={label} style={styles.drawerItem} onPress={() => { onFecharMenu(); navegar(route); }}>
                <MaterialCommunityIcons name={icon as any} size={23} color={palette.purpleDark} />
                <Text style={styles.drawerText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={[styles.header, compact && styles.headerCompact]}>
          <TouchableOpacity onPress={onAbrirMenu} style={styles.headerButton}>
            <MaterialIcons name="menu" size={35} color={palette.purpleDark} />
          </TouchableOpacity>

          <View style={[styles.brand, compact && styles.brandCompact]}>
            <Text style={[styles.brandName, compact && styles.brandNameCompact]}>Cíclica</Text>
            {!compact && <Text style={styles.brandTagline}>SEU CICLO, SUA FORÇA</Text>}
          </View>

          <View style={[styles.headerActions, compact && styles.headerActionsCompact]}>
            <TouchableOpacity onPress={onAbrirClasse} style={styles.headerButton}>
              <MaterialCommunityIcons name="trophy-outline" size={29} color="#A97D0A" />
            </TouchableOpacity>
          </View>
        </View>

        <ClasseLunarModal
          visivel={modalAberto}
          onFechar={onFecharClasse}
          trofeuUri={trofeuUri}
          classeAtual={classe || "Lua Nova"}
          descricaoClasse="Pequenos passos, grandes conquistas."
          diasRestantes={diasRestantes}
          proximaPontuacao={120}
          proximaClasse={{ nome: "Lua Crescente", descricao: "Exploração e força para o novo ciclo." }}
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <MarcaDaguaOrganica color={palette.purple} style={styles.heroWatermark} />
            <View style={[styles.heroRow, compact && styles.heroRowCompact]}>
              <View style={styles.heroCopy}>
                <View style={styles.phaseLabelRow}>
                  <MaterialCommunityIcons name="moon-waning-crescent" size={31} color="#F0CA3C" />
                  <Text style={styles.phaseLabel}>Fase atual do seu ciclo</Text>
                </View>
                {carregando ? (
                  <ActivityIndicator color={palette.purple} style={styles.loader} />
                ) : (
                  <Text style={[styles.phaseName, compact && styles.phaseNameCompact]}>{fase || "—"}</Text>
                )}
                <Text style={styles.phaseMood}>{humor || "Fase expansiva"}  🌕</Text>
                <Text style={styles.phaseDescription} numberOfLines={2}>
                  {mensagem || descricao || "Mais energia, vitalidade e conexão."}
                </Text>
                <TouchableOpacity style={[styles.primaryButton, compact && styles.primaryButtonCompact]} onPress={() => navegar("FaseCompletaScreen")}>
                  <Text style={styles.primaryButtonText}>Saiba mais</Text>
                  <MaterialIcons name="arrow-forward" size={23} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={[styles.heroSide, compact && styles.heroSideCompact]}>
                <View style={[styles.cycleRing, compact && styles.cycleRingCompact]}>
                  <Text style={styles.cycleSmall}>Dia</Text>
                  <Text style={styles.cycleDay}>14</Text>
                  <Text style={styles.cycleSmall}>de 28</Text>
                </View>
                <TouchableOpacity style={[styles.nextPhase, compact && styles.nextPhaseCompact]} onPress={() => navegar("Calendario")}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={24} color={palette.purpleDark} />
                  <View style={styles.nextPhaseCopy}>
                    <Text style={styles.nextPhaseLabel}>Próxima fase</Text>
                    <Text style={styles.nextPhaseValue}>em 5 dias</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={23} color={palette.purpleDark} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ActivityCard
            icon="dumbbell"
            title="Treino do dia"
            subtitle="Força & Bem-estar"
            time="20 min"
            level="Intermediário"
            description="Movimente seu corpo e sua energia."
            button="Ver treino do dia"
            tint="#F2E9F4"
            color={palette.purpleDark}
            onPress={() => navegar("TreinoDoDia")}
            compact={compact}
          />
          <ActivityCard
            icon="flower-tulip-outline"
            title="Exercícios de Kegel"
            subtitle="Mais saúde, mais controle"
            time="5 min"
            level="Todos os níveis"
            description="Fortaleça seu assoalho pélvico."
            button="Praticar Kegel"
            tint="#EBF0E4"
            color={palette.sageDark}
            onPress={() => navegar("Kegel")}
            compact={compact}
          />

          <View style={styles.progressCard}>
            <View style={[styles.progressHeader, compact && styles.progressHeaderCompact]}>
              <View style={[styles.roundIcon, { backgroundColor: "#F0EAF5" }]}>
                <MaterialCommunityIcons name="chart-bar" size={29} color={palette.purpleDark} />
              </View>
              <Text style={styles.progressTitle}>Progresso da semana</Text>
              <Text style={styles.progressValue}>{progresso || 0}% concluído</Text>
            </View>
            <View style={[styles.progressTrack, compact && styles.progressTrackCompact]}>
              <View style={[styles.progressFill, { width: `${Math.max(8, Math.min(progresso, 100))}%` }]} />
            </View>
            <View style={[styles.weekRow, compact && styles.weekRowCompact]}>
              {dias.map((dia, index) => (
                <View key={dia} style={styles.weekDay}>
                  <View style={[styles.dayCircle, index === 0 && styles.dayCircleActive]}>
                    {index === 0 && <MaterialIcons name="check" size={17} color="#fff" />}
                  </View>
                  <Text style={styles.dayText}>{dia}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.rewardCard, compact && styles.rewardCardCompact]} onPress={onAbrirClasse}>
            <View style={styles.moonOrbit}>
              <Image source={trofeuUri || require("../../assets/lua_minguante.png")} style={styles.moonImage} />
            </View>
            <View style={styles.rewardCopy}>
              <Text style={styles.points}>★  {pontuacao || 0} pontos</Text>
              <Text style={styles.className}>Classe atual: {classe || "Lua Minguante"}</Text>
              <Text style={styles.rewardCaption}>Pequenos passos, grandes conquistas.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={30} color="#999583" />
          </TouchableOpacity>

          <View style={styles.quoteRow}>
            <View style={styles.quoteLine} />
            <Text style={styles.quote}>“DISCIPLINA TAMBÉM É LIBERDADE”</Text>
            <View style={styles.quoteLine} />
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <NavItem label="Início" icon="home" active onPress={() => navegar("Home")} />
          <NavItem label="Ciclo" icon="calendar-month-outline" onPress={() => navegar("Calendario")} />
          <NavItem label="Kegel" icon="meditation" onPress={() => navegar("Kegel")} />
          <NavItem label="Treinos" icon="dumbbell" onPress={() => navegar("TreinoDoDia")} />
          <NavItem label="Perfil" icon="account-outline" onPress={() => navegar("Perfil")} />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

function ActivityCard(props: {
  icon: any; title: string; subtitle: string; time: string; level: string;
  description: string; button: string; tint: string; color: string; onPress: () => void; compact: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.activityCard, props.compact && styles.activityCardCompact]} onPress={props.onPress} activeOpacity={0.86}>
      <View style={[styles.roundIcon, { backgroundColor: props.tint }]}>
        <MaterialCommunityIcons name={props.icon} size={31} color={props.color} />
      </View>
      <View style={[styles.activityCopy, props.compact && styles.activityCopyCompact]}>
        <Text style={styles.activityTitle}>{props.title}</Text>
        <Text style={styles.activitySubtitle}>{props.subtitle}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#655B83" />
          <Text style={styles.metaText}>{props.time}</Text>
          <MaterialCommunityIcons name="signal-cellular-2" size={18} color="#655B83" />
          <Text style={styles.metaText}>{props.level}</Text>
        </View>
        <Text style={styles.activityDescription}>{props.description}</Text>
      </View>
      <View style={[styles.activityAction, props.compact && styles.activityActionCompact]}>
        <MaterialIcons name="chevron-right" size={29} color={palette.purpleDark} />
        <View style={styles.activityButton}><Text style={styles.activityButtonText}>{props.button}</Text></View>
      </View>
    </TouchableOpacity>
  );
}

function NavItem({ label, icon, active, onPress }: { label: string; icon: any; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={28} color={active ? palette.purpleDark : "#706687"} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
      {active && <View style={styles.navDot} />}
    </TouchableOpacity>
  );
}
