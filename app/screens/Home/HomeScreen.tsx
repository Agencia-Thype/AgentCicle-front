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
  const [mensagem, setMensagem] = useState<string>("");
  const [progressoSemanal, setProgressoSemanal] = useState<number>(0);
  const [corProgresso, setCorProgresso] = useState("#A56C6C");
  const [trofeuUri, setTrofeuUri] = useState<any>(null);
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [classeAtual, setClasseAtual] = useState<string>("");
  const [diasRestantes, setDiasRestantes] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");

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
        setMensagem(ciclo.mensagem);
        setDescricao(ciclo.descricao || "");
        console.log("📌 Descrição recebida:", ciclo.descricao);
        console.log("✅ Ciclo:", ciclo);

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
      const verificarAtualizacao = async () => {
        const precisaAtualizar = await AsyncStorage.getItem(
          "atualizarPontuacao"
        );
        if (precisaAtualizar === "true") {
          await atualizarPontuacao();
          await AsyncStorage.removeItem("atualizarPontuacao");
        }
      };

      verificarAtualizacao();
    }, [])
  );

  useEffect(() => {
    async function buscarProgresso() {
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
    }

    buscarProgresso();
  }, []);
  <Text style={homeStyles.progressoPorcentagem}>
    {progressoSemanal}% concluído
  </Text>;

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

            {/* <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("ChatIA");
              }}
            >
              <MaterialCommunityIcons name="chat-processing" size={20} color="#5C3B3B" />
              <Text style={homeStyles.menuItemText}>Assistente IA</Text>
            </TouchableOpacity> */}

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
              <Image
                source={trofeuUri}
                style={{ width: 28, height: 28, resizeMode: "contain" }}
              />
            )}
            <TouchableOpacity onPress={() => navigation.navigate("Calendario")}>
              <MaterialCommunityIcons
                name="calendar-heart"
                size={28}
                color="#5C3B3B"
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={homeStyles.content}>
          <AnimatedLogo />
          <Text style={homeStyles.dataTexto}>{hoje}</Text>

          <Text style={homeStyles.saudacao}>
            {userName ? `Olá, ${userName} 👋` : "Olá 👋"}
          </Text>
          <Text style={homeStyles.subtitulo}>Como você está?</Text>

          <View style={homeStyles.card}>
            <Text style={homeStyles.faseTitulo}>🌙 Fase atual do ciclo</Text>

            <Text style={homeStyles.faseNome}>{fase}</Text>

            <Text style={homeStyles.faseDescricao} numberOfLines={3}>
              {descricao}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("FaseCompletaScreen")}
              style={homeStyles.saibaMaisContainer}
            >
              <Text style={homeStyles.saibaMaisBotao}>Saiba mais →</Text>
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
