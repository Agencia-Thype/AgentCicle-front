import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/index";
import { identidadeDaFase } from "../../theme/colors";
import { auth } from "../../services/firebase";
import { getPerfil } from "../../services/perfilService";
import { getDetalhesFaseAtual } from "../../services/cicloService";
import { api, ehPerfilIncompleto } from "../../services/api";
import { getWeekDateRange } from "../../utils/getWeekDateRange";
import { useFaseLunar } from "../../hooks/useFaseLunar";
import { useAssinatura } from "../../contexts/AssinaturaContext";
import { usePremiumModal } from "../../utils/premiumModalController";
import { useAuth } from "../../contexts/AuthContext";
import { COBRANCA_ATIVA } from "../../config/monetizacao";
import HomeVisual from "./HomeVisual";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ route }: Props) {
  // Parâmetros recebidos da navegação
  const params = route.params;
  const [menuVisible, setMenuVisible] = useState(false);
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
  const [trofeuUri, setTrofeuUri] = useState<any>(null);
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [classeAtual, setClasseAtual] = useState<string>("");
  const [diasRestantes, setDiasRestantes] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Hooks para assinatura e premium
  const { verificarStatus, status } = useAssinatura();
  const { showModal } = usePremiumModal();
  const { logout } = useAuth();

  /**
   * Aviso do teste grátis na Home: quantos dias ainda restam.
   *
   * Só aparece com a cobrança ligada. No modo gratuito o app não pode falar de
   * assinatura, e ninguém perde acesso quando o trial vence.
   */
  const avisoTrial =
    COBRANCA_ATIVA && status?.trialAtivo && !status?.assinaturaAtiva
      ? { dias: Math.max(0, Number(status.diasRestantesTrial ?? 0)) }
      : null;

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
      onSair={async () => {
        setMenuVisible(false);
        await logout();
      }}
      onAbrirClasse={() => setModalAberto(true)}
      onFecharClasse={() => setModalAberto(false)}
      avisoTrial={avisoTrial}
      onAssinar={() => showModal()}
    />
  );
}
