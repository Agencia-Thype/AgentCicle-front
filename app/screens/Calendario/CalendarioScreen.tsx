import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { calendarioStyles } from "./calendarioStyles";
import { globalStyles, themeColors } from "../../theme/global";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { getFasePorData } from "../../utils/cicloUtils";
import { api } from "../../services/api";
import ResumoDiaModal from "app/components/resumoDiaModal";
import LunIAModal from "app/components/LunIA/LuniaModal";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";

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
  const anoAtual = hoje.getFullYear();
  const [dataUltimaMenstruacao, setDataUltimaMenstruacao] =
    useState<Date | null>(null);
  const [modalResumoVisible, setModalResumoVisible] = useState(false);
  const [resumoDia, setResumoDia] = useState<any>(null);

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const [mostrarLunia, setMostrarLunia] = useState(false);
  const [userName, setUserName] = useState("Usuário"); // valor padrão para evitar string vazia
  const [fase, setFase] = useState("folicular"); // valor padrão para evitar string vazia

  useEffect(() => {
    async function buscarUltimaMenstruacao() {
      try {
        const resp = await api.get("/fase-ciclo");
        const dataStr = resp.data?.inicio_ciclo;
        if (dataStr) {
          setDataUltimaMenstruacao(new Date(dataStr));
        }
      } catch (err) {
        console.error("Erro ao buscar fase:", err);
      }
    }

    buscarUltimaMenstruacao();
  }, []);

  const mudarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao;
    if (novoMes > 11) novoMes = 0;
    if (novoMes < 0) novoMes = 11;
    setMesAtual(novoMes);
  };

  const handleSelecionarDia = async (dia: number) => {
    const dataDia = new Date(anoAtual, mesAtual, dia);
    try {
      const response = await api.get(
        `/diario/resumo-do-dia?data=${dataDia.toISOString().split("T")[0]}`
      );
      setResumoDia({ ...response.data, data: dataDia });
      setModalResumoVisible(true);
    } catch (err) {
      console.error("Erro ao buscar resumo do dia", err);
    }
  };

  const getEstiloDia = (data: Date) => {
    if (!dataUltimaMenstruacao) return {};
    const fase = getFasePorData(data, dataUltimaMenstruacao, 28);
    if (fase === "menstruacao") return calendarioStyles.diaMenstruacao;
    if (fase === "folicular") return calendarioStyles.diaFolicular;
    if (fase === "ovulatoria") return calendarioStyles.diaOvulatoria;
    if (fase === "lutea") return calendarioStyles.diaLutea;
    return {};
  };

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <View style={calendarioStyles.container}>
        {/* 🔙 Flechinha de voltar */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 50,
            left: 16,
            zIndex: 10,
            padding: 8,
          }}
        >
          <MaterialIcons name="arrow-back" size={22} color="#5C3B3B" />
        </TouchableOpacity>

        <AnimatedLogo />

        <View style={[calendarioStyles.header, { marginTop: 16 }]}>
          <TouchableOpacity onPress={() => mudarMes(-1)}>
            <MaterialIcons name="chevron-left" size={28} color="#5C3B3B" />
          </TouchableOpacity>
          <Text style={calendarioStyles.headerText}>
            {meses[mesAtual]} {anoAtual}
          </Text>
          <TouchableOpacity onPress={() => mudarMes(1)}>
            <MaterialIcons name="chevron-right" size={28} color="#5C3B3B" />
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
    </LinearGradient>
  );
}
