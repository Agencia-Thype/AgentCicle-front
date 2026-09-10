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
import {
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AppBackground from "../../components/AppBackground";
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
import { LinearGradient } from "expo-linear-gradient";
import { identidadeDaFase, palette } from "../../theme/colors";
import { MarcaDaguaOrganica } from "../../components/FormaOrganica";
import { auth } from "../../services/firebase";
import { getPerfil } from "../../services/perfilService";
import { getDetalhesFaseAtual } from "../../services/cicloService";
import { api, ehPerfilIncompleto } from "../../services/api";
import { getWeekDateRange } from "../../utils/getWeekDateRange";
import ClasseLunarModal from "../../components/classeLunarModal";
import LuniaCoachBubble from "../../components/LuniaCoachBubble";
import LunIAModal from "../../components/LunIA/LuniaModal";
import FloatingLuniaCoach from "../../components/LunIA/LuniaFloatingMessage";
import { useFaseLunar } from "../../hooks/useFaseLunar";
import TrialBanner from "../../components/TrialBanner";
import { useAssinatura } from "../../contexts/AssinaturaContext";
import { usePremiumModal } from "../../utils/premiumModalController";
import { useAuth } from "../../contexts/AuthContext";
import { COBRANCA_ATIVA } from "../../config/monetizacao";
import HomeVisual from "./HomeVisual";

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

/** Saudação pelo horário local — o app abre falando com a pessoa, não com o dado. */
function saudacaoDoDia(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomeScreen({ route }: Props) {
  // Parâmetros recebidos da navegação
  const params = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  // Usando o novo hook para gerenciamento da fase lunar
  const {
    fase: faseLunar,
    mensagem,
    carregando,
    recarregar,
    perfilIncompleto,
  } = useFaseLunar();
  // Cor, gradiente e leitura do corpo da fase atual.
  const identidade = identidadeDaFase(faseLunar);
  const [progressoSemanal, setProgressoSemanal] = useState<number>(0);
  const [corProgresso, setCorProgresso] = useState("#E08D8D");
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
  const { logout } = useAuth();

  // Conta sem dados do ciclo não tem fase para mostrar: leva para o Perfil em
  // modo primeiro acesso, que trava a saída até salvar e depois volta à Home.
  useEffect(() => {
    if (!perfilIncompleto) return;
    (async () => {
      await AsyncStorage.setItem("primeiro_acesso", "true");
      navigation.reset({ index: 0, routes: [{ name: "Perfil" }] });
    })();
  }, [perfilIncompleto]);

  useFocusEffect(
    useCallback(() => {
      const verificarStatusAssinatura = async () => {
        try {
          // Reset do banner inicialmente
          setTrialBannerVisible(false);

          if (auth.currentUser) {
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
      if (!ehPerfilIncompleto(error)) {
        console.error("❌ Erro ao buscar progresso semanal:", error);
      }
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
            setCorProgresso("#E08D8D");
            break;
          case "Folicular":
            setCorProgresso(palette.sage);
            break;
          case "Ovulatória":
            setCorProgresso(palette.gold);
            break;
          case "Lútea":
            setCorProgresso(palette.purpleLight);
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
    <HomeVisual
      navigation={navigation}
      fase={faseLunar}
      mensagem={mensagem}
      descricao={descricao}
      carregando={carregando}
      humor={identidade.humor}
      progresso={progressoSemanal}
      pontuacao={pontuacao}
      classe={classeAtual}
      diasRestantes={diasRestantes}
      trofeuUri={trofeuUri}
      modalAberto={modalAberto}
      menuAberto={menuVisible}
      onAbrirMenu={() => setMenuVisible(true)}
      onFecharMenu={() => setMenuVisible(false)}
      onAbrirClasse={() => setModalAberto(true)}
      onFecharClasse={() => setModalAberto(false)}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />

      {/* Banner de Trial/Premium - oculto enquanto o app é gratuito */}
      {COBRANCA_ATIVA && status?.nome && (
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
              <MaterialIcons name="home" size={20} color={palette.textPrimary} />
              <Text style={homeStyles.menuItemText}>Início</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Perfil");
              }}
            >
              <MaterialIcons name="person" size={20} color={palette.textPrimary} />
              <Text style={homeStyles.menuItemText}>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Calendario");
              }}
            >
              <MaterialIcons name="calendar-today" size={20} color={palette.textPrimary} />
              <Text style={homeStyles.menuItemText}>Calendário</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("TreinoDoDia");
              }}
            >
              <MaterialCommunityIcons name="dumbbell" size={20} color={palette.textPrimary} />
              <Text style={homeStyles.menuItemText}>Treino do dia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("FaseCompletaScreen");
              }}
            >
              <MaterialCommunityIcons name="chat-processing" size={20} color={palette.textPrimary} />
              <Text style={homeStyles.menuItemText}>Assistente Lunia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("RelatorioMensal");
              }}
            >
              <MaterialIcons name="insights" size={20} color={palette.textPrimary} />
              <Text style={homeStyles.menuItemText}>Relatório do mês</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.menuItem}
              onPress={async () => {
                await logout();
                setMenuVisible(false);
                navigation.navigate("Login");
              }}
            >
              <MaterialIcons name="logout" size={20} color={palette.error} />
              <Text style={[homeStyles.menuItemText, { color: palette.error }]}>
                Sair
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <AppBackground>
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
          <View style={homeStyles.header}>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={homeStyles.iconeHeader}
            >
              <MaterialIcons name="menu" size={26} color={palette.textPrimary} />
            </TouchableOpacity>

            <View style={homeStyles.headerAcoes}>
              {trofeuUri && (
                <TouchableOpacity
                  onPress={() => setModalAberto(true)}
                  style={homeStyles.iconeHeader}
                >
                  <Image
                    source={trofeuUri}
                    style={{ width: 24, height: 24, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate("Calendario")}
                style={homeStyles.iconeHeader}
              >
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={24}
                  color={palette.textPrimary}
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
            showsVerticalScrollIndicator={false}
          >
            {/* Saudação: a única serifada grande da dobra */}
            <View style={homeStyles.saudacaoBloco}>
              <Text style={homeStyles.saudacao}>
                {saudacaoDoDia()}
                {userName ? `, ${userName}` : ""}
              </Text>
              <Text style={homeStyles.perguntaDoDia}>
                Como seu corpo está hoje?
              </Text>
            </View>

            {/* Card herói: domina a dobra e carrega a fase do ciclo */}
            <View style={homeStyles.hero}>
              <LinearGradient
                colors={identidade.gradiente}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MarcaDaguaOrganica
                  color={palette.textOnDark}
                  style={homeStyles.heroMarcaDagua}
                />

                <View style={homeStyles.heroConteudo}>
                  <View style={homeStyles.heroLinhaOverline}>
                    <View
                      style={[
                        homeStyles.heroPontoFase,
                        { backgroundColor: identidade.cor },
                      ]}
                    />
                    <Text style={homeStyles.heroOverline}>Seu ciclo hoje</Text>
                  </View>

                  {carregando ? (
                    <ActivityIndicator
                      size="small"
                      color={palette.textOnDark}
                      style={{ alignSelf: "flex-start", marginVertical: 14 }}
                    />
                  ) : (
                    <>
                      <Text style={homeStyles.heroFase}>{faseLunar || "—"}</Text>
                      {mensagem || descricao ? (
                        <Text style={homeStyles.heroMensagem} numberOfLines={3}>
                          {mensagem || descricao}
                        </Text>
                      ) : null}
                    </>
                  )}

                  <View style={homeStyles.heroDivisor} />

                  {/* Leitura do corpo: entendível em segundos */}
                  <View style={homeStyles.heroMetricas}>
                    <View style={homeStyles.heroMetrica}>
                      <Text style={homeStyles.heroMetricaRotulo}>Energia</Text>
                      <Text style={homeStyles.heroMetricaValor}>
                        {identidade.energia}
                      </Text>
                    </View>
                    <View style={homeStyles.heroMetrica}>
                      <Text style={homeStyles.heroMetricaRotulo}>Humor</Text>
                      <Text style={homeStyles.heroMetricaValor}>
                        {identidade.humor}
                      </Text>
                    </View>
                    <View style={homeStyles.heroMetrica}>
                      <Text style={homeStyles.heroMetricaRotulo}>Treino</Text>
                      <Text style={homeStyles.heroMetricaValor}>
                        {identidade.treino}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={homeStyles.heroBotao}
                    onPress={() => navigation.navigate("FaseCompletaScreen")}
                    activeOpacity={0.8}
                  >
                    <Text style={homeStyles.heroBotaoTexto}>
                      Entender minha fase
                    </Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={15}
                      color={palette.textOnDark}
                    />
                  </TouchableOpacity>

                  {!carregando && (
                    <TouchableOpacity
                      style={homeStyles.heroAtualizar}
                      onPress={recarregar}
                    >
                      <MaterialIcons
                        name="refresh"
                        size={13}
                        color={palette.textOnDarkMuted}
                      />
                      <Text style={homeStyles.heroAtualizarTexto}>
                        Atualizar fase
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Atalhos do dia */}
            <Text style={homeStyles.secaoRotulo}>Hoje</Text>
            <View style={homeStyles.linhaAtalhos}>
              <TouchableOpacity
                style={homeStyles.atalho}
                onPress={() => navigation.navigate("TreinoDoDia")}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    homeStyles.atalhoIcone,
                    { backgroundColor: palette.mist },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={19}
                    color={palette.sageDark}
                  />
                </View>
                <View>
                  <Text style={homeStyles.atalhoTitulo}>Treino</Text>
                  <Text style={homeStyles.atalhoLegenda} numberOfLines={2}>
                    {identidade.treino}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={homeStyles.atalho}
                onPress={() => navigation.navigate("Kegel")}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    homeStyles.atalhoIcone,
                    { backgroundColor: palette.lilac },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="flower-tulip-outline"
                    size={19}
                    color={palette.purple}
                  />
                </View>
                <View>
                  <Text style={homeStyles.atalhoTitulo}>Kegel</Text>
                  <Text style={homeStyles.atalhoLegenda} numberOfLines={2}>
                    Assoalho pélvico
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Semana */}
            <Text style={homeStyles.secaoRotulo}>Sua semana</Text>

            <View style={homeStyles.card}>
              <View style={homeStyles.cardLinhaTopo}>
                <Text style={homeStyles.cardTitulo}>Progresso</Text>
                <Text style={homeStyles.cardValorForte}>
                  {progressoSemanal || 0}%
                </Text>
              </View>

              <View style={homeStyles.barraContainer}>
                <View
                  style={[
                    homeStyles.barraProgresso,
                    {
                      width: `${Math.min(progressoSemanal, 100)}%`,
                      backgroundColor: identidade.cor,
                    },
                  ]}
                />
              </View>

              <Text style={homeStyles.progressoLegenda}>
                dos treinos concluídos
              </Text>
            </View>

            <View style={homeStyles.card}>
              <View style={homeStyles.conquistaLinha}>
                <Image
                  source={trofeuUri || require("../../assets/moeda.png")}
                  style={homeStyles.conquistaTrofeu}
                />
                <View style={{ flex: 1 }}>
                  <Text style={homeStyles.conquistaPontos}>
                    {pontuacao || 0} pontos
                  </Text>
                  <Text style={homeStyles.conquistaClasse}>
                    {classeAtual || "Carregando..."}
                  </Text>
                  {diasRestantes > 0 && (
                    <Text style={homeStyles.conquistaFaltam}>
                      Faltam {diasRestantes} dia(s) para avançar
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={homeStyles.addButton}
              onPress={() => navigation.navigate("Sintomas")}
              activeOpacity={0.9}
            >
              <FontAwesome name="plus" size={15} color={palette.textOnDark} />
              <Text style={homeStyles.addButtonText}>
                Registrar como me senti
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </AppBackground>
      {/* Componente flutuante da Lunia - fora do fundo para evitar sobreposições */}
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
