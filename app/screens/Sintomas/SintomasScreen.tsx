import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import AppBackground from "../../components/AppBackground";
import { api } from "../../services/api";
import { palette } from "../../theme/colors";
import { symptomsStyles as styles } from "./symptomsStyles";
import FloatingLuniaCoach from "../../components/LunIA/LuniaFloatingMessage";
import LunIAModal from "../../components/LunIA/LuniaModal";

const moods = [["Calma", "emoticon-cool-outline"], ["Feliz", "white-balance-sunny"], ["Energética", "lightning-bolt"], ["Alegre", "heart-outline"], ["Irritada", "weather-lightning-rainy"], ["Triste", "emoticon-sad-outline"], ["Ansiosa", "flower-tulip-outline"], ["Desanimada", "battery-low"]] as const;
const groups = [
  { title: "Físicos", icon: "human-female", tone: "pink", items: ["Cólicas", "Dor nas costas", "Seios sensíveis", "Dor abdominal", "Dor nas articulações", "Dores no corpo", "Febre", "Dor de cabeça"] },
  { title: "Digestivos", icon: "stomach", tone: "green", items: ["Náusea", "Gases", "Intestino preso", "Diarreia", "Apetite descontrolado"] },
  { title: "Sono & energia", icon: "moon-waning-crescent", tone: "blue", items: ["Insônia", "Pouca energia", "Sono agitado", "Muito cansada"] },
  { title: "Pele & corpo", icon: "creation", tone: "pink", items: ["Acne", "Inchaço", "Suores noturnos", "Coceira vaginal", "Ressecamento vaginal"] },
] as const;

const moodNames = new Set<string>(moods.map(([label]) => label));
const symptomNames = new Set<string>(groups.flatMap(group => [...group.items]));
const dataLocal = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

export default function SintomasScreen() {
  const navigation = useNavigation<any>();
  const [humores, setHumores] = useState<string[]>([]);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [fase, setFase] = useState("Ovulatória");
  const [mostrarLunia, setMostrarLunia] = useState(false);
  // Dia do ciclo real, vindo do backend, em vez de valores fixos na tela.
  const [ciclo, setCiclo] = useState<{ dia: number | null; duracao: number }>({ dia: null, duracao: 28 });

  useEffect(() => {
    api.get("/fase-atual/detalhes")
      .then(res => {
        if (res.data?.fase_atual) setFase(res.data.fase_atual);
        if (res.data?.dia_do_ciclo) setCiclo({ dia: res.data.dia_do_ciclo, duracao: res.data.duracao_ciclo || 28 });
      })
      .catch(() => undefined);
  }, []);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    api.get(`/diario/resumo-do-dia?data=${dataLocal()}`)
      .then(res => {
        if (!ativo) return;
        const registrados: string[] = Array.isArray(res.data?.sentimentos) ? res.data.sentimentos : [];
        setHumores(registrados.filter(item => moodNames.has(item)));
        setSintomas(registrados.filter(item => symptomNames.has(item)));
        setNotas(typeof res.data?.observacao === "string" ? res.data.observacao : "");
        if (res.data?.fase) setFase(res.data.fase);
      })
      .catch(() => {
        if (!ativo) return;
        setHumores([]);
        setSintomas([]);
        setNotas("");
      });
    return () => { ativo = false; };
  }, []));
  const toggleHumor = (item: string) => setHumores(prev => prev.includes(item) ? prev.filter(x => x !== item) : prev.length < 3 ? [...prev, item] : prev);
  const toggleSintoma = (item: string) => setSintomas(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  const salvar = async () => {
    if (!humores.length && !sintomas.length) return Toast.show({ type: "error", text1: "Selecione ao menos uma opção." });
    setEnviando(true);
    try {
      const res = await api.post("/diario/registrar-sintomas", {
        data: dataLocal(),
        sentimentos: [...humores, ...sintomas],
        observacao: notas.trim() || null,
        fase,
      });
      // O 1º registro do dia pontua; a Home só relê a pontuação com essa flag.
      const pontos = Number(res.data?.pontos) || 0;
      if (pontos > 0) await AsyncStorage.setItem("atualizarPontuacao", "true");
      Toast.show({
        type: "success",
        text1: "Sintomas registrados!",
        text2: pontos > 0 ? `+${pontos} pontos` : undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      const detalhe = error?.response?.data?.detail;
      Toast.show({
        type: "error",
        text1: "Não foi possível salvar os sintomas.",
        text2: typeof detalhe === "string" ? detalhe : "Tente novamente em instantes.",
      });
    }
    finally { setEnviando(false); }
  };
  const ir = (route: string) => navigation.navigate(route);

  // Se hoje é o dia N de um ciclo de D dias, a próxima menstruação começa em
  // (D - N + 1) dias: estando no dia D, o próximo ciclo começa amanhã.
  const diasRestantes = ciclo.dia ? ciclo.duracao - ciclo.dia + 1 : null;
  const diasParaProximaMenstruacao =
    diasRestantes === null
      ? null
      : `${diasRestantes} ${diasRestantes === 1 ? "dia" : "dias"}`;

  return <AppBackground><StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View style={styles.brand}><Text style={styles.brandName}>Cíclica</Text><Text style={styles.brandTag}>SEU CICLO, SUA FORÇA.</Text></View></View>
        <View style={styles.titleArea}><Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.88}>Registrar sintomas</Text><Text style={styles.subtitle}>Conte como você está hoje.</Text><View style={styles.sideMessage}><Text style={styles.sideText}>Seu bem-estar{`\n`}importa!</Text><MaterialCommunityIcons name="heart-outline" size={20} color={palette.purpleDark} /></View></View>
        <View style={styles.phaseCard}><View style={styles.phaseIcon}><MaterialCommunityIcons name="sprout-outline" size={37} color={palette.purpleDark} /></View><View style={styles.phaseCopy}><Text style={styles.phaseLine}>Fase atual: <Text style={styles.phaseStrong}>{fase}</Text></Text><Text style={styles.phaseDay}>{ciclo.dia ? `Dia ${ciclo.dia} de ${ciclo.duracao}` : "Ciclo não configurado"}</Text><Text style={styles.phaseCaption}>Seus registros ajudam a personalizar{`\n`}suas recomendações.</Text></View><View style={styles.divider} /><View style={styles.next}><MaterialCommunityIcons name="calendar-blank-outline" size={25} color={palette.purpleDark} /><View><Text style={styles.nextLabel}>Próxima{`\n`}menstruação em</Text><Text style={styles.nextStrong}>{diasParaProximaMenstruacao ?? "—"}</Text></View><MaterialIcons name="chevron-right" size={21} color={palette.purpleDark} /></View></View>

        <View style={styles.section}><View style={styles.sectionHead}><View style={styles.sectionIcon}><MaterialCommunityIcons name="emoticon-happy-outline" size={27} color={palette.purpleDark} /></View><View style={styles.sectionCopy}><Text style={styles.sectionTitle}>Como está seu humor hoje?</Text><Text style={styles.sectionSubtitle}>Selecione até 3 opções</Text></View><View style={styles.countPill}><Text style={styles.countText}>{humores.length} selecionados</Text></View></View><View style={styles.moodGrid}>{moods.map(([label, icon]) => <Choice key={label} label={label} icon={icon} selected={humores.includes(label)} onPress={() => toggleHumor(label)} />)}</View></View>

        <View style={styles.section}><View style={styles.sectionHead}><View style={styles.sectionIcon}><MaterialCommunityIcons name="pulse" size={29} color={palette.purpleDark} /></View><View style={styles.sectionCopy}><Text style={styles.sectionTitle}>Quais sintomas você está sentindo?</Text><Text style={styles.sectionSubtitle}>Selecione quantos quiser</Text></View></View><View style={styles.groupGrid}>{groups.map(group => <View key={group.title} style={[styles.groupCard, styles[`${group.tone}Card`]]}><View style={styles.groupTitleRow}><MaterialCommunityIcons name={group.icon as any} size={21} color={group.tone === "green" ? "#4F8053" : palette.purpleDark} /><Text style={styles.groupTitle}>{group.title}</Text></View><View style={styles.smallChoices}>{group.items.map(item => <SmallChoice key={item} label={item} selected={sintomas.includes(item)} onPress={() => toggleSintoma(item)} />)}</View></View>)}</View></View>

        <View style={styles.notes}><View style={styles.notesIcon}><MaterialCommunityIcons name="file-document-outline" size={25} color={palette.purpleDark} /></View><View style={styles.notesBody}><Text style={styles.notesTitle}>Observações</Text><TextInput style={styles.textArea} placeholder="Algo que você queira registrar hoje?" placeholderTextColor="#8E879A" multiline maxLength={300} value={notas} onChangeText={setNotas} /><Text style={styles.counter}>{notas.length}/300</Text></View></View>
        <TouchableOpacity style={styles.save} onPress={salvar} disabled={enviando}><Text style={styles.saveText}>{enviando ? "Salvando..." : "Salvar"}</Text></TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomNav}><Nav icon="home-outline" label="Início" onPress={() => ir("Home")} /><Nav icon="calendar-month-outline" label="Ciclo" onPress={() => ir("Calendario")} /><Nav icon="meditation" label="Kegel" onPress={() => ir("Kegel")} /><Nav icon="dumbbell" label="Treinos" onPress={() => ir("TreinoDoDia")} /><Nav icon="pill" label="Rotina" onPress={() => ir("Rotina")} /><Nav icon="account-outline" label="Perfil" onPress={() => ir("Perfil")} /></View>
    </View>
    <FloatingLuniaCoach userName="" mostrarAssistente={mostrarLunia} bottomOffset={72} onAbrirAssistente={() => setMostrarLunia(true)} />
    <LunIAModal visivel={mostrarLunia} onFechar={() => setMostrarLunia(false)} fase={fase} userName="" />
  </AppBackground>;
}

function Choice({ label, icon, selected, onPress }: { label: string; icon: any; selected: boolean; onPress: () => void }) { return <TouchableOpacity style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}><MaterialCommunityIcons name={icon} size={20} color={label === "Energética" ? "#53AD46" : palette.purpleDark} /><Text style={styles.choiceText}>{label}</Text>{selected && <View style={styles.check}><MaterialIcons name="check" size={13} color="#fff" /></View>}</TouchableOpacity>; }
function SmallChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <TouchableOpacity style={[styles.smallChoice, selected && styles.choiceSelected]} onPress={onPress}>{selected && <View style={styles.smallCheck}><MaterialIcons name="check" size={11} color="#fff" /></View>}<Text style={styles.smallText}>{label}</Text></TouchableOpacity>; }
function Nav({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) { return <TouchableOpacity style={styles.navItem} onPress={onPress}><MaterialCommunityIcons name={icon} size={25} color={active ? palette.purpleDark : "#756D89"} /><Text style={[styles.navText, active && styles.navActive]}>{label}</Text>{active && <View style={styles.navDot} />}</TouchableOpacity>; }
