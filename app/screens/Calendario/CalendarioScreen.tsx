import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import AppBackground from "../../components/AppBackground";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { calendarioStyles } from "./calendarioStyles";
import { globalStyles, themeColors } from "../../theme/global";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import {
  DURACAO_MENSTRUACAO_PADRAO,
  dataLocalDeISO,
  duracaoCicloValida,
  ehDiaFertil,
  getFasePorData,
  posicaoNoCiclo,
} from "../../utils/cicloUtils";
import { api } from "../../services/api";
import { dataLocalISO } from "../Rotina/rotinaFormato";
import { CHAVES, lerUltimo, salvarDoDia } from "../../services/cacheDoDia";
import ResumoDiaModal from "app/components/resumoDiaModal";
import LunIAModal from "app/components/LunIA/LuniaModal";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";
import { palette } from "../../theme/colors";
import CalendarVisual from "./CalendarVisual";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function CalendarioScreen() {
  const hoje = new Date();
  const navigation = useNavigation();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [dataUltimaMenstruacao, setDataUltimaMenstruacao] =
    useState<Date | null>(null);
  // Duração do ciclo informada no Perfil; chega junto com /fase-ciclo.
  const [duracaoCiclo, setDuracaoCiclo] = useState(28);
  const [duracaoMenstruacao, setDuracaoMenstruacao] = useState(DURACAO_MENSTRUACAO_PADRAO);
  const [modalResumoVisible, setModalResumoVisible] = useState(false);
  const [resumoDia, setResumoDia] = useState<any>(null);
  const [salvandoMenstruacao, setSalvandoMenstruacao] = useState(false);

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const [mostrarLunia, setMostrarLunia] = useState(false);
  const [userName, setUserName] = useState("Usuário"); // valor padrão para evitar string vazia
  const [fase, setFase] = useState("folicular"); // valor padrão para evitar string vazia

  useEffect(() => {
    const aplicar = (dados: any) => {
      if (dados?.fase) setFase(dados.fase);
      if (dados?.inicio_ciclo) setDataUltimaMenstruacao(dataLocalDeISO(dados.inicio_ciclo));
      if (dados?.duracao_ciclo) setDuracaoCiclo(duracaoCicloValida(dados.duracao_ciclo));
      if (dados?.duracao_menstruacao) setDuracaoMenstruacao(dados.duracao_menstruacao);
    };
    // Abre com o último ciclo conhecido; a rede só confirma.
    let chegouDaRede = false;
    lerUltimo<any>(CHAVES.faseCiclo).then((salvo) => {
      if (salvo && !chegouDaRede) aplicar(salvo);
    });

    async function buscarUltimaMenstruacao() {
      try {
        const resp = await api.get("/fase-ciclo");
        chegouDaRede = true;
        aplicar(resp.data);
        salvarDoDia(CHAVES.faseCiclo, resp.data);
      } catch (err) {
        console.error("Erro ao buscar fase:", err);
      }
    }

    buscarUltimaMenstruacao();
  }, []);

  const mudarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao;
    let novoAno = anoAtual;
    if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }
    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    }
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const handleSelecionarDia = async (dia: number) => {
    const dataDia = new Date(anoAtual, mesAtual, dia);
    try {
      const response = await api.get(
        `/diario/resumo-do-dia?data=${dataLocalISO(dataDia)}`
      );
      setResumoDia({ ...response.data, data: dataDia });
      setModalResumoVisible(true);
    } catch (err) {
      console.error("Erro ao buscar resumo do dia", err);
    }
  };

  const getEstiloDia = (data: Date) => {
    if (!dataUltimaMenstruacao) return {};
    const fase = getFasePorData(data, dataUltimaMenstruacao, duracaoCiclo, duracaoMenstruacao);
    if (fase === "menstruacao") return calendarioStyles.diaMenstruacao;
    if (fase === "ovulatoria") return calendarioStyles.diaOvulatoria;
    // A janela fértil se sobrepõe ao fim da folicular e ao começo da lútea;
    // é o verde "Fértil" da legenda.
    if (ehDiaFertil(data, dataUltimaMenstruacao, duracaoCiclo, duracaoMenstruacao)) return calendarioStyles.diaFolicular;
    if (fase === "lutea") return calendarioStyles.diaLutea;
    return {};
  };

  const definirInicioMenstruacao = async (data: Date) => {
    setSalvandoMenstruacao(true);
    try {
      const dataInicio = dataLocalISO(data);
      const response = await api.post("/registrar-menstruacao", {
        data_inicio: dataInicio,
      });
      const faseAtual = response.data?.fase_atual?.fase;

      setDataUltimaMenstruacao(dataLocalDeISO(dataInicio));
      if (faseAtual) setFase(faseAtual);
      setModalResumoVisible(false);
      await AsyncStorage.setItem("atualizarHome", "true");

      Toast.show({
        type: "success",
        text1: "Ciclo atualizado",
        text2: `${data.toLocaleDateString("pt-BR")} foi definida como início da menstruação.`,
      });
    } catch (error: any) {
      const detalhe = error?.response?.data?.detail;
      Toast.show({
        type: "error",
        text1: "Não foi possível atualizar o ciclo",
        text2: typeof detalhe === "string" ? detalhe : "Tente novamente.",
      });
    } finally {
      setSalvandoMenstruacao(false);
    }
  };

  const posicao = dataUltimaMenstruacao
    ? posicaoNoCiclo(hoje, dataUltimaMenstruacao, duracaoCiclo)
    : null;
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();

  return (
    <>
      <CalendarVisual
        navigation={navigation}
        month={meses[mesAtual]}
        monthIndex={mesAtual}
        year={anoAtual}
        daysInMonth={diasNoMes}
        firstWeekday={primeiroDiaSemana}
        phase={fase ? fase.charAt(0).toUpperCase() + fase.slice(1) : "Ovulatória"}
        cycleDay={posicao?.dia ?? null}
        cycleLength={duracaoCiclo}
        nextPeriodDays={posicao?.diasAteProximaMenstruacao ?? null}
        today={hoje}
        onChangeMonth={mudarMes}
        onSelectDay={handleSelecionarDia}
        getDayStyle={getEstiloDia}
      />
      <ResumoDiaModal
        visible={modalResumoVisible}
        onClose={() => setModalResumoVisible(false)}
        resumo={resumoDia}
        onDefinirMenstruacao={definirInicioMenstruacao}
        salvandoMenstruacao={salvandoMenstruacao}
      />
      <FloatingLuniaCoach userName={userName} mostrarAssistente={mostrarLunia} bottomOffset={72} onAbrirAssistente={() => setMostrarLunia(true)} />
      <LunIAModal visivel={mostrarLunia} onFechar={() => setMostrarLunia(false)} fase={fase} userName={userName} />
    </>
  );

  return (
    <AppBackground>
      <View style={calendarioStyles.container}>
        <AnimatedLogo />

        <View style={[calendarioStyles.header, { marginTop: 16 }]}>
          <TouchableOpacity onPress={() => mudarMes(-1)}>
            <MaterialIcons name="chevron-left" size={28} color={palette.textSecondary} />
          </TouchableOpacity>
          <Text style={calendarioStyles.headerText}>
            {meses[mesAtual]} {anoAtual}
          </Text>
          <TouchableOpacity onPress={() => mudarMes(1)}>
            <MaterialIcons name="chevron-right" size={28} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dias}
          numColumns={7}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => {
            const dataDia = new Date(anoAtual, mesAtual, item);
            const isHoje = dataDia.toDateString() === hoje.toDateString();
            return (
              <TouchableOpacity
                style={[
                  calendarioStyles.diaBox,
                  getEstiloDia(dataDia),
                  isHoje && calendarioStyles.diaHoje,
                ]}
                onPress={() => handleSelecionarDia(item)}
              >
                <Text style={calendarioStyles.diaTexto}>{item}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={calendarioStyles.grid}
        />

        <ResumoDiaModal
          visible={modalResumoVisible}
          onClose={() => setModalResumoVisible(false)}
          resumo={resumoDia}
        />
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
    </AppBackground>
  );
}
