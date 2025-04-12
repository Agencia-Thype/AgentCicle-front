import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { calendarioStyles as styles } from "./calendarioStyles";
import { api } from "../../services/api";
import Toast from "react-native-toast-message";
import { getFasePorData, FaseCiclo } from "../../utils/cicloUtils";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (date: Date) => void;
}

export default function CalendarioModal({ visible, onClose, onSelectDate }: Props) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [dataUltimaMenstruacao, setDataUltimaMenstruacao] = useState<Date | null>(null);
  const [primeiroDiaPermitido, setPrimeiroDiaPermitido] = useState<Date | null>(null);
  const cicloDias = 28;

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const dias = Array.from({ length: primeiroDiaSemana + diasNoMes }, (_, i) =>
    i < primeiroDiaSemana ? null : i - primeiroDiaSemana + 1
  );

  useEffect(() => {
    if (!visible) return;

    async function fetchMenstruacao() {
      try {
        const response = await api.get("/fase-ciclo");
        const dataStr = response.data?.inicio_ciclo;

        if (dataStr) {
          const data = new Date(dataStr);
          setDataUltimaMenstruacao(data);

          const limite = new Date(data);
          limite.setDate(limite.getDate() - 30);
          setPrimeiroDiaPermitido(limite);
        }
      } catch (err) {
        console.error("Erro ao buscar ciclo:", err);
      }
    }

    fetchMenstruacao();
  }, [visible]);

  const mudarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao;
    let novoAno = anoAtual;
    if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    } else if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    }
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const registrarMenstruacao = async (data: Date) => {
    try {
      const response = await api.post("/registrar-menstruacao", {
        data_inicio: data.toISOString().split("T")[0],
      });
  
      const fase = response.data.fase_atual?.fase;
      const mensagem = response.data.fase_atual?.mensagem;
  
      Toast.show({
        type: "success",
        text1: `🌙 ${fase}`,
        text2: mensagem || "Fase atual atualizada",
      });
  
      setDataUltimaMenstruacao(data);
  
    } catch (error: any) {
      if (error.response?.status === 409) {
        Toast.show({
          type: "info",
          text1: "Já existe registro para essa data",
          text2: error.response.data.detail,
        });
      } else {
        console.error("Erro ao registrar menstruação", error);
        Toast.show({
          type: "error",
          text1: "Erro ao registrar menstruação",
          text2: "Tente novamente.",
        });
      }
    }
  };
  

  const handleSelectDay = async (dia: number) => {
    const data = new Date(anoAtual, mesAtual, dia);
    setDataSelecionada(data);
    await registrarMenstruacao(data);
    if (onSelectDate) onSelectDate(data);
  };

  const getFaseCiclo = (data: Date): FaseCiclo => {
    if (!dataUltimaMenstruacao || !primeiroDiaPermitido) return null;
    if (data < primeiroDiaPermitido) return null;
    return getFasePorData(data, dataUltimaMenstruacao, cicloDias);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animatable.View animation="fadeInUp" duration={400} style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => mudarMes(-1)}>
              <MaterialIcons name="chevron-left" size={28} color="#5C3B3B" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{meses[mesAtual]} {anoAtual}</Text>
            <TouchableOpacity onPress={() => mudarMes(1)}>
              <MaterialIcons name="chevron-right" size={28} color="#5C3B3B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
            <Text style={{ color: '#5C3B3B', fontWeight: 'bold' }}>Fechar</Text>
          </TouchableOpacity>

          <View style={styles.grid}>
            {dias.map((dia, index) => {
              if (!dia) return <View key={index} style={styles.dayBoxPlaceholder} />;

              const dataDia = new Date(anoAtual, mesAtual, dia);
              const isHoje = dataDia.toDateString() === hoje.toDateString();

              const fase = getFaseCiclo(dataDia);

              let estiloExtra = {};
              if (dataSelecionada?.toDateString() === dataDia.toDateString()) {
                estiloExtra = styles.diaSelecionado;
              } else if (fase === "menstruacao") {
                estiloExtra = styles.diaMenstruacao;
              } else if (fase === "folicular") {
                estiloExtra = styles.diaFolicular;
              } else if (fase === "ovulatoria") {
                estiloExtra = styles.diaOvulatoria;
              } else if (fase === "lutea") {
                estiloExtra = styles.diaLutea;
              } else if (isHoje) {
                estiloExtra = styles.diaHoje;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayBox, estiloExtra]}
                  onPress={() => handleSelectDay(dia)}
                >
                  <Text style={styles.dayText}>{dia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}
