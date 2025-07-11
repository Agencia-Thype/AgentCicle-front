import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/index";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { homeStyles } from "./homeStyles";
import { globalStyles, themeColors } from "../../theme/global";
import { getPerfil } from "../../services/perfilService";
import { getDetalhesFaseAtual } from "../../services/cicloService";
import { api } from "../../services/api";
import { getWeekDateRange } from "../../utils/getWeekDateRange";
import ClasseLunarModal from "../../components/classeLunarModal";
import LuniaCoachBubble from "../../components/LuniaCoachBubble";
import LunIAModal from "../../components/LunIA/LuniaModal";
import FloatingLuniaCoach from "../../components/LunIA/LuniaFloatingMessage";
import { useFaseLunar } from "../../hooks/useFaseLunar";
import TrialBanner from "../../components/TrialBanner";
import { useAssinatura } from "../../contexts/AssinaturaContext";
import { usePremiumModal } from "../../utils/premiumModalController";

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ route }: Props) {
  // Parâmetros recebidos da navegação
  const params = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  // Usando o novo hook para gerenciamento da fase lunar
  const { fase: faseLunar, mensagem, carregando, recarregar } = useFaseLunar();
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
  const [nome, setNome] = useState("");
  const [faseUsuario, setFaseUsuario] = useState("");
  const [classeLunarModalVisible, setClasseLunarModalVisible] = useState(false);
  const [treinoHoje, setTreinoHoje] = useState(false);
  const [carregandoTreino, setCarregandoTreino] = useState(true);
  const [modalLuniaVisible, setModalLuniaVisible] = useState(false);
  const [modalConselhosVisible, setModalConselhosVisible] = useState(false);
  const [trialBannerVisible, setTrialBannerVisible] = useState(false);

  // Hooks para assinatura e premium
  const { status, verificarStatus, estaNoPeriodoTrial, temPermissaoPremium } =
    useAssinatura();
  const { showModal } = usePremiumModal();
  useFocusEffect(
    useCallback(() => {
      const verificarStatusAssinatura = async () => {
        try {
          // Verificar se há token antes de consultar o status
          const token = await AsyncStorage.getItem("auth_token");

          // Reset do banner inicialmente
          setTrialBannerVisible(false);

          if (token) {
            // Verificação estratégica de status: Apenas verificamos se:
            // 1. Estamos voltando de uma tela de login ou pagamento (forçar atualização)
            // 2. Viemos explicitamente de uma tela que solicitou mostrar o banner
            const justLoggedIn = params?.justLoggedIn === true;
            const forceStatusCheck = params?.forceStatusCheck === true;
            const deveForcarVerificacao = justLoggedIn || forceStatusCheck;

            // Registrar no log a razão da verificação para diagnóstico
            if (justLoggedIn)
              console.log("[HomeScreen] Verificação forçada por login recente");
            if (forceStatusCheck)
              console.log(
                "[HomeScreen] Verificação forçada por parâmetro explícito"
              );

            if (deveForcarVerificacao) {
              console.log(
                "[HomeScreen] Verificando status de assinatura (forçado)"
              );
              await verificarStatus(true); // Forçar verificação da API

              // Limpar flags após uso para evitar verificações repetidas se a tela recarregar
              if (navigation && justLoggedIn) {
                navigation.setParams({ justLoggedIn: false });
              }
              if (navigation && forceStatusCheck) {
                navigation.setParams({ forceStatusCheck: false });
              }
            }

            console.log(
              "[HomeScreen] Utilizando status de assinatura disponível"
            );

            // Verificar se status foi carregado com sucesso
            if (status && status.nome && status.email) {
              // Verificar se viemos do login e devemos mostrar o banner
              const showBanner =
                params?.showTrialBanner === true ||
                params?.justLoggedIn === true;

              // Decidir se mostra o banner baseado no status do usuário
              if (!temPermissaoPremium) {
                if (showBanner) {
                  console.log(
                    "[HomeScreen] Exibindo banner de trial/premium para usuário sem premium"
                  );
                  // Mostrar banner para usuário não-premium
                  setTrialBannerVisible(true);
                }
              }
            }
          }
        } catch (error) {
          console.error(
            "[HomeScreen] Erro ao verificar status na Home:",
            error
          );
        }
      };

      verificarStatusAssinatura();
    }, [params?.showTrialBanner, params?.justLoggedIn]) // Remover verificarStatus das dependências
  );

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
        // Não precisamos mais chamar setFase, pois o hook faz isso automaticamente
        setDescricao(ciclo.descricao || mensagem || "");

        // Atualizar cor de acordo com a fase atual do hook
        switch (faseLunar) {
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

        // Recarregar dados da fase ao iniciar a tela
        await recarregar();

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
        const precisaAtualizarPontuacao =
          await AsyncStorage.getItem("atualizarPontuacao");
        const precisaAtualizarHome =
          await AsyncStorage.getItem("atualizarHome");

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

  // Função para abrir modal de upgrade ao clicar no banner de trial
  const handleUpgradePress = async () => {
    try {
      // Primeiro verificamos o status atual antes de mostrar o modal
      await verificarStatus();

      // Exibe modal com informações atualizadas
      showModal(
        `Assine o plano premium para continuar tendo acesso a todos os recursos após o período de teste.`
      );
    } catch (error) {
      console.error("Erro ao preparar upgrade:", error);
      // Mesmo com erro, mostra o modal genérico
      showModal();
    }
  };

  // Função para forçar exibição do banner de trial para testes
  const showTrialBannerManually = () => {
    // Só mostra se houver status válido
    if (status && status.nome) {
      console.log(
        "[HomeScreen] Exibindo banner de trial manualmente para teste"
      );
      console.log(
        "[HomeScreen] Status atual:",
        JSON.stringify({
          trialAtivo: status.trialAtivo,
          diasRestantes: status.diasRestantesTrial,
          assinaturaAtiva: status.assinaturaAtiva,
          podeUsarPremium: status.podeUsarPremium,
          estaNoPeriodoTrial: estaNoPeriodoTrial,
          temPermissaoPremium: temPermissaoPremium,
        })
      );
      setTrialBannerVisible(true);
    } else {
      console.log(
        "[HomeScreen] Não é possível mostrar o banner: status inválido"
      );
      // Tentar verificar status novamente
      verificarStatus().then(() => {
        if (status && status.nome) {
          setTrialBannerVisible(true);
        }
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />

      {/* Banner Modal de Trial/Premium - só exibe se usuário estiver logado e tiver status */}
      {status && status.nome && (
        <TrialBanner
          onUpgrade={handleUpgradePress}
          visible={trialBannerVisible && !temPermissaoPremium}
          onClose={() => setTrialBannerVisible(false)}
        />
      )}

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
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
          <View style={homeStyles.header}>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{ zIndex: 1000, padding: 4 }}
            >
              <MaterialIcons name="menu" size={28} color="#5C3B3B" />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                zIndex: 1000,
              }}
            >
              {trofeuUri && (
                <TouchableOpacity
                  onPress={() => setModalAberto(true)}
                  style={{ padding: 4 }}
                >
                  <Image
                    source={trofeuUri}
                    style={{ width: 28, height: 28, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate("Calendario")}
                style={{ padding: 4 }}
              >
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
          <ScrollView
            contentContainerStyle={homeStyles.content}
            style={{ paddingTop: 0 }}
          >
            {" "}
            <View style={homeStyles.card}>
              <Text style={homeStyles.faseTitulo}>
                🌙 Fase atual do seu ciclo
              </Text>

              {carregando ? (
                <ActivityIndicator
                  size="small"
                  color="#A56C6C"
                  style={{ marginVertical: 10 }}
                />
              ) : (
                <>
                  <Text style={homeStyles.faseNome}>
                    {faseLunar || "Carregando..."}
                  </Text>
                  <Text style={homeStyles.faseResumo} numberOfLines={2}>
                    {mensagem || descricao || "Carregando informações..."}
                  </Text>
                </>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate("FaseCompletaScreen")}
                style={homeStyles.saibaMaisBotao}
              >
                <Text style={homeStyles.saibaMaisTexto}>Saiba mais</Text>
              </TouchableOpacity>

              {!carregando && (
                <TouchableOpacity
                  onPress={recarregar}
                  style={homeStyles.recarregarBotao}
                >
                  <MaterialIcons name="refresh" size={14} color="#A56C6C" />
                  <Text style={homeStyles.recarregarTexto}>Atualizar fase</Text>
                </TouchableOpacity>
              )}
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
                {progressoSemanal || 0}% concluído
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
                <Text style={homeStyles.moedaTexto}>
                  {pontuacao || 0} pontos
                </Text>
              </View>
              <Text
                style={[
                  homeStyles.subtitulo,
                  { textAlign: "center", marginTop: 6 },
                ]}
              >
                🏆 Classe atual: {classeAtual || "Carregando..."}
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
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                style={homeStyles.addButton}
                onPress={() => navigation.navigate("Sintomas")}
              >
                <FontAwesome name="plus" size={22} color="#fff" />
                <Text style={homeStyles.addButtonText}>Registrar sintomas</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      {/* Componente flutuante da LunIA - fora do gradient para evitar sobreposições */}
      <FloatingLuniaCoach
        userName={userName}
        mostrarAssistente={mostrarLunia}
        onAbrirAssistente={() => setMostrarLunia(true)}
      />
      {/* Modal da LunIA - fora do gradient para evitar problemas */}
      <LunIAModal
        visivel={mostrarLunia}
        onFechar={() => setMostrarLunia(false)}
        fase={faseLunar}
        userName={userName}
      />
    </View>
  );
}
