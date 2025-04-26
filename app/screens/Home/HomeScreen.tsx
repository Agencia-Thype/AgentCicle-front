import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/index";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { homeStyles } from "./homeStyles";
import { globalStyles, themeColors } from "../../theme/global";
import { getPerfil } from "../../services/perfilService";
import {
  getDetalhesFaseAtual,
  getFaseCiclo,
} from "../../services/cicloService";
import { api } from "app/services/api";
import { getWeekDateRange } from "app/utils/getWeekDateRange";
import ClasseLunarModal from "../../components/classeLunarModal";
import LuniaCoachBubble from "app/components/LuniaCoachBubble";
import LunIAModal from "app/components/LunIA/LuniaModal";
import LunIAFloatingMessage from "app/components/LunIA/LuniaFloatingMessage";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [fase, setFase] = useState<string>("");
  const [progressoSemanal, setProgressoSemanal] = useState<number>(0);
  const [corProgresso, setCorProgresso] = useState("#A56C6C");
  const [trofeuUri, setTrofeuUri] = useState<any>(null);
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [classeAtual, setClasseAtual] = useState<string>("");
  const [diasRestantes, setDiasRestantes] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarLunia, setMostrarLunia] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const atualizarPontuacao = async () => {
      try {
        const response = await api.get("/pontuacao");
        setPontuacao(response.data.pontos_mes);
        setClasseAtual(response.data.classe);
        setDiasRestantes(response.data.dias_restantes);
      } catch (error) {
        console.log("Erro ao atualizar pontuação:", error);
      }
    };
    
    const buscarProgresso = async () => {
      try {
        const { inicio, fim } = getWeekDateRange();
        const response = await api.get("/treino-dia/progresso-semanal", {
          params: { inicio, fim },
        });
        console.log("✅ Progresso semanal:", response.data.media_percentual);
        setProgressoSemanal(response.data.media_percentual);
      } catch (error) {
        console.error("❌ Erro ao buscar progresso semanal:", error);
      }
    };
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const perfil = await getPerfil();
          setUserName(perfil.nome);
          await AsyncStorage.setItem("user", JSON.stringify(perfil));
    
          const primeiraMenstruacao = new Date(perfil.data_primeira_menstruacao);
          const hoje = new Date();
          const meses =
            (hoje.getFullYear() - primeiraMenstruacao.getFullYear()) * 12 +
            (hoje.getMonth() - primeiraMenstruacao.getMonth());
    
          let trofeu;
          if (meses < 1) trofeu = require("../../assets/lua_nova.png");
          else if (meses < 2) trofeu = require("../../assets/lua_crescente.png");
          else if (meses < 3) trofeu = require("../../assets/lua_cheia.png");
          else trofeu = require("../../assets/lua_minguante.png");
    
          setTrofeuUri(trofeu);
    
          const ciclo = await getDetalhesFaseAtual();
          setFase(ciclo.fase_atual);
          setDescricao(ciclo.descricao || "");
    
          switch (ciclo.fase) {
            case "Menstruação":
              setCorProgresso("#A56C6C");
              break;
            case "Folicular":
              setCorProgresso("#7EAA92");
              break;
            case "Ovulatória":
              setCorProgresso("#F4B860");
              break;
            case "Lútea":
              setCorProgresso("#B283A3");
              break;
          }
    
          await atualizarPontuacao();
        } catch (error) {
          console.log("Erro ao buscar dados:", error);
        }
      };
    
      fetchData();
    }, []);
    
    useFocusEffect(
      useCallback(() => {
        const verificarAtualizacaoHome = async () => {
          const precisaAtualizarPontuacao = await AsyncStorage.getItem("atualizarPontuacao");
          const precisaAtualizarHome = await AsyncStorage.getItem("atualizarHome");
    
          if (precisaAtualizarHome === "true") {
            // Atualiza tudo se pediu atualização geral
            await atualizarPontuacao();
            await buscarProgresso();
            await AsyncStorage.removeItem("atualizarHome");
          } else if (precisaAtualizarPontuacao === "true") {
            // Senão, só atualiza a pontuação
            await atualizarPontuacao();
            await AsyncStorage.removeItem("atualizarPontuacao");
          }
        };
    
        verificarAtualizacaoHome();
      }, [])
    );
    
    useEffect(() => {
      buscarProgresso();
    }, []);
    

  return (
    <View style={{ flex: 1 }}>
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <View style={homeStyles.modalOverlay}>
          <View style={homeStyles.modalMenu}>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Home");
              }}
            >
              <MaterialIcons name="home" size={20} color="#5C3B3B" />
              <Text style={homeStyles.menuItemText}>Início</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Perfil");
              }}
            >
              <MaterialIcons name="person" size={20} color="#5C3B3B" />
              <Text style={homeStyles.menuItemText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Calendario");
              }}
            >
              <MaterialIcons name="calendar-today" size={20} color="#5C3B3B" />
              <Text style={homeStyles.menuItemText}>Calendário</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("TreinoDoDia");
              }}
            >
              <MaterialCommunityIcons
                name="dumbbell"
                size={20}
                color="#5C3B3B"
              />
              <Text style={homeStyles.menuItemText}>Treino do dia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("FaseCompletaScreen");
              }}
            >
              <MaterialCommunityIcons
                name="chat-processing"
                size={20}
                color="#5C3B3B"
              />
              <Text style={homeStyles.menuItemText}>Assistente LunIA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("RelatorioMensal");
              }}
            >
              <MaterialIcons name="insights" size={20} color="#5C3B3B" />
              <Text style={homeStyles.menuItemText}>Relatório do mês</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={async () => {
                await AsyncStorage.clear();
                setMenuVisible(false);
                navigation.navigate("Login");
              }}
            >
              <MaterialIcons name="logout" size={20} color="#A56C6C" />
              <Text style={[homeStyles.menuItemText, { color: "#A56C6C" }]}>
                Sair
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LinearGradient
        colors={themeColors.gradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={globalStyles.backgroundGradient}
      >
        <View style={homeStyles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <MaterialIcons name="menu" size={28} color="#5C3B3B" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {trofeuUri && (
              <TouchableOpacity onPress={() => setModalAberto(true)}>
                <Image
                  source={trofeuUri}
                  style={{ width: 28, height: 28, resizeMode: "contain" }}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate("Calendario")}>
              <MaterialCommunityIcons
                name="calendar-heart"
                size={28}
                color="#5C3B3B"
              />
            </TouchableOpacity>

            <ClasseLunarModal
              visivel={modalAberto}
              onFechar={() => setModalAberto(false)}
              trofeuUri={trofeuUri}
              classeAtual={"Lua Nova"}
              descricaoClasse={"Início do despertar. É o começo da jornada."}
              diasRestantes={12}
              proximaPontuacao={120}
              proximaClasse={{
                nome: "Lua Crescente",
                descricao: "Exploração e força para o novo ciclo.",
              }}
            />
          </View>
        </View>

        <FloatingLuniaCoach
          userName={userName}
          mostrarAssistente={mostrarLunia}
          onAbrirAssistente={() => setMostrarLunia(true)}
        />

        <LunIAModal
          visivel={mostrarLunia}
          onFechar={() => setMostrarLunia(false)}
          fase={fase}
          userName={userName}
        />

        <ScrollView contentContainerStyle={homeStyles.content}>
          <View style={homeStyles.card}>
            <Text style={homeStyles.faseTitulo}>
              🌙 Fase atual do seu ciclo
            </Text>
            <Text style={homeStyles.faseNome}>{fase}</Text>
            <Text style={homeStyles.faseResumo} numberOfLines={2}>
              {descricao}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("FaseCompletaScreen")}
              style={homeStyles.saibaMaisBotao}
            >
              <Text style={homeStyles.saibaMaisTexto}>Saiba mais</Text>
            </TouchableOpacity>
          </View>

          <View style={homeStyles.card}>
            <Text style={homeStyles.treinoTexto}>Você já treinou hoje?</Text>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => navigation.navigate("TreinoDoDia")}
            >
              <Text style={globalStyles.buttonText}>Ver treino do dia</Text>
            </TouchableOpacity>
          </View>

          <View style={homeStyles.card}>
            <Text style={homeStyles.progressoTexto}>
              📊 Progresso da semana
            </Text>

            <View style={homeStyles.barraContainer}>
              <View
                style={[
                  homeStyles.barraProgresso,
                  {
                    width: `${Math.min(progressoSemanal, 100)}%`,
                    backgroundColor: corProgresso,
                  },
                ]}
              />
              <Image
                source={require("../../assets/logo.png")}
                style={{
                  position: "absolute",
                  left: `${Math.min(progressoSemanal, 100)}%`,
                  top: -12,
                  width: 40,
                  height: 40,
                  transform: [{ translateX: -20 }],
                  zIndex: 99,
                }}
              />
            </View>

            <Text style={homeStyles.progressoPorcentagem}>
              {progressoSemanal}% concluído
            </Text>
          </View>

          <View style={homeStyles.card}>
            <View style={homeStyles.moedaContainer}>
              <Image
                source={require("../../assets/moeda.png")}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: "contain",
                  marginRight: 6,
                }}
              />
              <Text style={homeStyles.moedaTexto}>{pontuacao} pontos</Text>
            </View>
            <Text
              style={[
                homeStyles.subtitulo,
                { textAlign: "center", marginTop: 6 },
              ]}
            >
              🏆 Classe atual: {classeAtual}
            </Text>
            {diasRestantes > 0 && (
              <Text
                style={[
                  homeStyles.subtitulo,
                  { textAlign: "center", fontSize: 12 },
                ]}
              >
                Faltam {diasRestantes} dia(s) para avançar
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={homeStyles.addButton}
            onPress={() => navigation.navigate("Sintomas")}
          >
            <FontAwesome name="plus" size={22} color="#fff" />
            <Text style={homeStyles.addButtonText}>Registrar sintomas</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
