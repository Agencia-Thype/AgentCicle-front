import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AppBackground from "../../components/AppBackground";
import { api, ehPerfilIncompleto } from "../../services/api";
import { verificarServidorOnline } from "../../services/healthCheck";
import { palette } from "../../theme/colors";
import { faseCompletaStyles as styles } from "./faseCompletaStyles";

const lunia = require("../../assets/01 Neutra/Lunia Neutra_01.png");
type ChatMessage = { id: string; role: "user" | "assistant"; text: string; time: string };

export default function FaseCompletaScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [fase, setFase] = useState("Ovulatória");
  const [descricao, setDescricao] = useState("Mais energia, sociabilidade e confiança hoje.");
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [carregando, setCarregando] = useState(false);
  // Vem de /fase-atual/detalhes. Antes o "Dia 14 de 28" era fixo no código.
  const [ciclo, setCiclo] = useState<{ dia: number | null; duracao: number }>({ dia: null, duracao: 28 });

  useEffect(() => { (async () => { try { if (!(await verificarServidorOnline())) return; const res = await api.get("/fase-atual/detalhes"); if (res.data?.fase_atual) setFase(res.data.fase_atual); if (res.data?.descricao) setDescricao(res.data.descricao); if (res.data?.dia_do_ciclo) setCiclo({ dia: res.data.dia_do_ciclo, duracao: res.data.duracao_ciclo || 28 }); } catch (error) { if (!ehPerfilIncompleto(error)) console.error("Erro ao buscar fase:", error); } })(); }, []);

  const enviarPergunta = async (texto = pergunta) => {
    const enviada = texto.trim(); if (!enviada || carregando) return;
    const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setMensagens(atual => [...atual, { id: `user-${Date.now()}`, role: "user", text: enviada, time: agora }]);
    setPergunta(""); setCarregando(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    try {
      if (!(await verificarServidorOnline())) {
        setMensagens(atual => [...atual, { id: `assistant-${Date.now()}`, role: "assistant", text: "Não foi possível conectar ao servidor. Verifique sua conexão.", time: agora }]);
        return;
      }
      const res = await api.post("/ia/conversar", { pergunta: enviada });
      setMensagens(atual => [...atual, { id: `assistant-${Date.now()}`, role: "assistant", text: res.data?.resposta || "A LunIA respondeu, mas não conseguimos exibir a mensagem.", time: agora }]);
    } catch {
      setMensagens(atual => [...atual, { id: `assistant-${Date.now()}`, role: "assistant", text: "Não consegui responder agora. Tente novamente em instantes.", time: agora }]);
    }
    finally { setCarregando(false); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80); }
  };
  const ir = (route: string) => navigation.navigate(route);

  return <AppBackground>
    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}><View style={styles.brand}><Text style={styles.brandName}>Cíclica</Text><Text style={styles.brandTag}>SEU CICLO, SUA FORÇA.</Text></View></View>
      <View style={styles.hero}>
        <View style={styles.avatarHalo}><Image source={lunia} style={styles.heroAvatar} /></View>
        <View style={styles.heroCopy}><Text style={styles.heroTitle}>Lunia</Text><Text style={styles.heroSubtitle}>Sua assistente do ciclo</Text><View style={styles.onlinePill}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Sempre aqui para você</Text><MaterialCommunityIcons name="heart-outline" size={19} color={palette.purpleDark} /></View></View>
        <View style={styles.sideQuote}><Text style={styles.sideQuoteText}>Mais{`\n`}conhecimento{`\n`}para uma{`\n`}você mais forte</Text><MaterialCommunityIcons name="heart-outline" size={24} color={palette.purpleDark} /></View>
      </View>
      <View style={styles.phaseCard}><View style={styles.phaseIcon}><MaterialCommunityIcons name="moon-waning-crescent" size={46} color={palette.purpleDark} /></View><View style={styles.phaseCopy}><Text style={styles.phaseLabel}>Fase atual do ciclo:</Text><Text style={styles.phaseName}>{fase}</Text><Text style={styles.phaseDescription} numberOfLines={1}>{descricao}</Text></View>{ciclo.dia ? <><View style={styles.phaseDivider} /><View style={styles.dayPill}><Text style={styles.dayText}>Dia {ciclo.dia} de {ciclo.duracao}</Text></View></> : null}</View>
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {mensagens.map(mensagem => mensagem.role === "assistant"
          ? <LuniaMessage key={mensagem.id} text={mensagem.text} time={mensagem.time} />
          : <View key={mensagem.id} style={styles.userWrap}><View style={styles.userBubble}><Text style={styles.userText}>{mensagem.text}</Text></View><Text style={styles.userTime}>{mensagem.time} <Text style={styles.check}>✓✓</Text></Text></View>
        )}
        {carregando && <ActivityIndicator style={styles.loader} color={palette.purple} />}
      </ScrollView>
      <View style={styles.quickRow}><Quick icon="dumbbell" text="Treino ideal hoje" onPress={() => enviarPergunta("Qual treino combina mais comigo hoje?")} /><Quick icon="emoticon-happy-outline" text="Como está meu humor?" onPress={() => enviarPergunta("Como está meu humor nesta fase?")} /><Quick icon="leaf" text="O que evitar?" onPress={() => enviarPergunta("O que devo evitar nesta fase?")} /></View>
      <View style={styles.composer}><MaterialCommunityIcons name="creation" size={24} color="#8B79A1" /><TextInput style={styles.input} placeholder="Digite sua pergunta para a Lunia" placeholderTextColor="#9A91A4" value={pergunta} onChangeText={setPergunta} onSubmitEditing={() => enviarPergunta()} returnKeyType="send" /><MaterialCommunityIcons name="microphone-outline" size={27} color={palette.purpleDark} /><TouchableOpacity style={styles.send} onPress={() => enviarPergunta()}><MaterialCommunityIcons name="send-outline" size={25} color="#fff" /></TouchableOpacity></View>
      <View style={styles.bottomNav}><Nav icon="home-outline" label="Início" onPress={() => ir("Home")} /><Nav icon="calendar-month-outline" label="Ciclo" onPress={() => ir("Calendario")} /><Nav icon="meditation" label="Kegel" onPress={() => ir("Kegel")} /><Nav icon="dumbbell" label="Treinos" onPress={() => ir("TreinoDoDia")} /><Nav icon="pill" label="Rotina" onPress={() => ir("Rotina")} /><Nav icon="account-outline" label="Perfil" onPress={() => ir("Perfil")} /></View>
    </KeyboardAvoidingView>
  </AppBackground>;
}

function LuniaMessage({ text, time }: { text: string; time: string }) { return <View style={styles.luniaRow}><Image source={lunia} style={styles.miniAvatar} /><View style={styles.luniaMessageCopy}><View style={styles.luniaBubble}><Text style={styles.luniaText}>{text}</Text></View><Text style={styles.messageTime}>{time}</Text></View></View>; }
function Quick({ icon, text, onPress }: { icon: any; text: string; onPress: () => void }) { return <TouchableOpacity style={styles.quick} onPress={onPress}><MaterialCommunityIcons name={icon} size={20} color={icon === "leaf" ? "#558452" : palette.purpleDark} /><Text style={styles.quickText} numberOfLines={1}>{text}</Text></TouchableOpacity>; }
function Nav({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) { return <TouchableOpacity style={styles.navItem} onPress={onPress}><MaterialCommunityIcons name={icon} size={25} color={active ? palette.purpleDark : "#756D89"} /><Text style={[styles.navText, active && styles.navActive]}>{label}</Text>{active && <View style={styles.navDot} />}</TouchableOpacity>; }
