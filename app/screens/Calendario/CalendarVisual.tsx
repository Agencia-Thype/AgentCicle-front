import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AppBackground from "../../components/AppBackground";
import { palette } from "../../theme/colors";
import { cycleStyles as styles } from "./cycleStyles";

type Props = {
  navigation: any; month: string; monthIndex: number; year: number; daysInMonth: number; firstWeekday: number;
  phase: string; cycleDay: number; nextPeriodDays: number; today: Date;
  onChangeMonth: (direction: number) => void; onSelectDay: (day: number) => void;
  getDayStyle: (date: Date) => object;
};

const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default function CalendarVisual(props: Props) {
  const { height } = useWindowDimensions();
  const compact = height < 900;
  const dense = height < 760;
  const cells: Array<number | null> = [
    ...Array.from({ length: props.firstWeekday }, () => null),
    ...Array.from({ length: props.daysInMonth }, (_, index) => index + 1),
  ];
  const navigate = (route: string) => props.navigation.navigate(route);

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
        <View style={[styles.header, compact && styles.headerCompact, dense && styles.headerDense]}>
          <View style={styles.headerSpacer} />
          <View style={styles.brand}><Text style={styles.brandName}>Cíclica</Text><Text style={styles.brandTagline}>SEU CICLO, SUA FORÇA.</Text></View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact, dense && styles.contentDense]} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={[styles.titleBlock, compact && styles.titleBlockCompact, dense && styles.titleBlockDense]}>
            <Text style={[styles.title, compact && styles.titleCompact, dense && styles.titleDense]}>Meu ciclo</Text>
            <Text style={[styles.subtitle, compact && styles.subtitleCompact, dense && styles.subtitleDense]}>Conecte-se com o seu corpo e viva cada fase{`\n`}com mais consciência.</Text>
            <View style={[styles.sideMessage, dense && styles.sideMessageDense]}><Text style={[styles.sideMessageText, dense && styles.sideMessageTextDense]}>Mais{`\n`}saúde para{`\n`}a sua{`\n`}amanhã</Text><MaterialCommunityIcons name="heart-outline" size={dense ? 19 : 25} color={palette.purpleDark} /></View>
          </View>

          <View style={[styles.phaseCard, compact && styles.phaseCardCompact, dense && styles.phaseCardDense]}>
            <View style={styles.phaseIcon}><MaterialCommunityIcons name="sprout-outline" size={39} color={palette.purpleDark} /></View>
            <View style={styles.phaseCopy}>
              <Text style={styles.phaseLabel}>Fase atual: <Text style={styles.phaseStrong}>{props.phase}</Text></Text>
              <Text style={styles.cycleDay}>Dia {props.cycleDay} de 28</Text>
              <Text style={styles.phaseCaption}>Mais energia e vitalidade hoje!</Text>
            </View>
            <View style={styles.phaseDivider} />
            <View style={styles.nextPeriod}><MaterialCommunityIcons name="calendar-blank-outline" size={25} color={palette.purpleDark} /><View style={styles.nextPeriodCopy}><Text style={styles.nextPeriodLabel}>Próxima{`\n`}menstruação</Text><Text style={styles.nextPeriodValue}>em {props.nextPeriodDays} {props.nextPeriodDays === 1 ? "dia" : "dias"}</Text></View></View>
          </View>

          <View style={[styles.calendarCard, compact && styles.calendarCardCompact, dense && styles.calendarCardDense]}>
            <View style={styles.monthHeader}><TouchableOpacity style={styles.monthButton} onPress={() => props.onChangeMonth(-1)}><MaterialIcons name="chevron-left" size={27} color={palette.purpleDark} /></TouchableOpacity><Text style={styles.monthTitle}>{props.month} {props.year}</Text><TouchableOpacity style={styles.monthButton} onPress={() => props.onChangeMonth(1)}><MaterialIcons name="chevron-right" size={27} color={palette.purpleDark} /></TouchableOpacity></View>
            <View style={styles.weekdays}>{weekdays.map(day => <Text key={day} style={styles.weekday}>{day}</Text>)}</View>
            <View style={styles.grid}>
              {cells.map((day, index) => day === null ? <View key={`empty-${index}`} style={[styles.dayCell, compact && styles.dayCellCompact, dense && styles.dayCellDense]} /> : (
                <View key={day} style={[styles.dayCell, compact && styles.dayCellCompact, dense && styles.dayCellDense]}><TouchableOpacity style={[styles.dayCircle, compact && styles.dayCircleCompact, dense && styles.dayCircleDense, props.getDayStyle(new Date(props.year, props.monthIndex, day)), new Date(props.year, props.monthIndex, day).toDateString() === props.today.toDateString() && styles.today]} onPress={() => props.onSelectDay(day)}><Text style={styles.dayText}>{day}</Text></TouchableOpacity></View>
              ))}
            </View>
            <View style={styles.legend}><Legend color="#8B477D" label="Menstruação" /><Legend color="#C6DAAE" label="Fértil" /><Legend color="#F2DEAD" border="#8E6720" label="Ovulação" /><Legend color="transparent" border="#E56D65" dotted label="Previsão" /></View>
          </View>

          <TouchableOpacity style={[styles.symptomsCard, compact && styles.symptomsCardCompact, dense && styles.symptomsCardDense]} onPress={() => navigate("Sintomas")} activeOpacity={0.86}>
            <View style={styles.symptomsIcon}><MaterialCommunityIcons name="heart-pulse" size={31} color={palette.purpleDark} /></View>
            <View style={styles.symptomsCopy}>
              <Text style={styles.symptomsOverline}>COMO VOCÊ ESTÁ HOJE?</Text>
              <Text style={styles.symptomsTitle}>Registrar sentimentos e sintomas</Text>
              <Text style={styles.symptomsText}>Acompanhe as mudanças do seu corpo ao longo do ciclo.</Text>
            </View>
            <View style={styles.symptomsArrow}><MaterialIcons name="chevron-right" size={27} color="#fff" /></View>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.bottomNav, compact && styles.bottomNavCompact, dense && styles.bottomNavDense]}><Nav icon="home-outline" label="Início" onPress={() => navigate("Home")} /><Nav icon="calendar-month" label="Ciclo" active /><Nav icon="meditation" label="Kegel" onPress={() => navigate("Kegel")} /><Nav icon="dumbbell" label="Treinos" onPress={() => navigate("TreinoDoDia")} /><Nav icon="account-outline" label="Perfil" onPress={() => navigate("Perfil")} /></View>
      </SafeAreaView>
    </AppBackground>
  );
}

function Legend({ color, border, label, dotted }: { color: string; border?: string; label: string; dotted?: boolean }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color, borderColor: border || color }, dotted && styles.dotted]} /><Text style={styles.legendText}>{label}</Text></View>; }
function Nav({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress?: () => void }) { return <TouchableOpacity style={styles.navItem} onPress={onPress}><MaterialCommunityIcons name={icon} size={25} color={active ? palette.purpleDark : "#756D89"} /><Text style={[styles.navText, active && styles.navActive]}>{label}</Text>{active && <View style={styles.navDot} />}</TouchableOpacity>; }
