import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import DropDownPicker from "react-native-dropdown-picker";

import { globalStyles, themeColors } from "../../theme/global";
import { perfilStyles } from "./PerfilStyles";
import { updatePerfil, getPerfil } from "../../services/perfilService";
import CalendarioModal from "../../components/calendario/CalendarioModal";
import { AnimatedLogo } from "app/components/AnimatedLogo";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";
import LunIAModal from "app/components/LunIA/LuniaModal";

export default function PerfilScreen() {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataMenstruacao, setDataMenstruacao] = useState(new Date());
  const [duracaoCiclo, setDuracaoCiclo] = useState("28");
  const [imc, setImc] = useState<number | null>(null);
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);

  const [open, setOpen] = useState(false);
  const [itensObjetivo, setItensObjetivo] = useState([
    { label: "Emagrecer", value: "Emagrecer" },
    { label: "Ganhar massa muscular", value: "Ganhar massa muscular" },
    { label: "Definição muscular", value: "Definição muscular" },
    { label: "Condicionamento físico", value: "Condicionamento físico" },
    { label: "Saúde e bem-estar", value: "Saúde e bem-estar" },
  ]);
  const [mostrarLunia, setMostrarLunia] = useState(false);
  const [userName, setUserName] = useState(""); // se ainda não tiver
  const [fase, setFase] = useState(""); // se ainda não tiver

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const perfil = await getPerfil();
        if (perfil) {
          setAltura(perfil.altura?.toString() || "");
          setPeso(perfil.peso_atual?.toString() || "");
          setObjetivo(perfil.objetivo || "");
          setDuracaoCiclo(perfil.duracao_ciclo?.toString() || "28");
          if (perfil.data_menstruacao) {
            const data = new Date(perfil.data_menstruacao);
            setDataMenstruacao(data);
          }
        }
      } catch (error) {
        console.log("Erro ao buscar perfil:", error);
      }
    };

    carregarPerfil();
  }, []);

  useEffect(() => {
    if (altura && peso) {
      const alt = parseFloat(altura.replace(",", "."));
      const p = parseFloat(peso);
      if (alt > 0 && p > 0) {
        const resultado = p / (alt * alt);
        setImc(resultado ? parseFloat(resultado.toFixed(1)) : null);
      }
    }
  }, [altura, peso]);

  const handleSalvar = async () => {
    if (!altura || !peso || !objetivo || !dataMenstruacao || !duracaoCiclo) {
      Toast.show({
        type: "error",
        text1: "Preencha todos os campos",
      });
      return;
    }

    try {
      const payload = {
        altura: parseFloat(altura.replace(",", ".")),
        peso_atual: parseFloat(peso),
        objetivo,
        data_menstruacao: dataMenstruacao.toISOString().split("T")[0],
        duracao_ciclo: parseInt(duracaoCiclo),
      };

      await updatePerfil(payload);
      Toast.show({
        type: "success",
        text1: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.log("Erro ao atualizar perfil:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar perfil",
      });
    }
  };

  const formatarData = (data: Date) =>
    data.toLocaleDateString("pt-BR", { timeZone: "UTC" });

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <AnimatedLogo />
      <View style={perfilStyles.container}>
        <Text style={perfilStyles.title}>Complete seu perfil</Text>

        <TextInput
          placeholder="Altura (ex: 1.65)"
          placeholderTextColor="#A56C6C"
          value={altura}
          onChangeText={setAltura}
          keyboardType="decimal-pad"
          style={perfilStyles.input}
        />

        <TextInput
          placeholder="Peso atual (kg)"
          placeholderTextColor="#A56C6C"
          value={peso}
          onChangeText={setPeso}
          keyboardType="decimal-pad"
          style={perfilStyles.input}
        />

        {/* Objetivo */}
        <Text style={perfilStyles.label}>Qual seu principal objetivo?</Text>
        <DropDownPicker
          placeholder="Selecione seu objetivo"
          open={open}
          value={objetivo}
          items={itensObjetivo}
          setOpen={setOpen}
          setValue={setObjetivo}
          setItems={setItensObjetivo}
          style={{
            backgroundColor: "#FFF5F5",
            borderColor: "#E0A2A2",
            marginBottom: 16,
            borderRadius: 10,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#FFF0F0",
            borderColor: "#E0A2A2",
          }}
          textStyle={{
            color: "#5C3B3B",
            fontWeight: "bold",
          }}
          searchable
          searchPlaceholder="Digite para buscar..."
        />

        {/* Duração do ciclo */}
        <View style={perfilStyles.cicloWrapper}>
          <Text style={perfilStyles.label}>Duração do ciclo:</Text>
          <View style={perfilStyles.cicloControls}>
            <TouchableOpacity
              onPress={() => {
                const novoValor = parseInt(duracaoCiclo) - 1;
                if (novoValor >= 21) setDuracaoCiclo(novoValor.toString());
              }}
              style={perfilStyles.cicloButton}
            >
              <Text style={perfilStyles.cicloButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={perfilStyles.cicloValor}>{duracaoCiclo} dias</Text>

            <TouchableOpacity
              onPress={() => {
                const novoValor = parseInt(duracaoCiclo) + 1;
                if (novoValor <= 35) setDuracaoCiclo(novoValor.toString());
              }}
              style={perfilStyles.cicloButton}
            >
              <Text style={perfilStyles.cicloButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data última menstruação */}
        <View style={perfilStyles.dateWrapper}>
          <TouchableOpacity
            onPress={() => setShowCalendarioModal(true)}
            style={perfilStyles.dateButton}
          >
            <MaterialIcons
              name="calendar-today"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={perfilStyles.dateButtonText}>
              Última menstruação: {formatarData(dataMenstruacao)}
            </Text>
          </TouchableOpacity>

          <CalendarioModal
            visible={showCalendarioModal}
            onClose={() => setShowCalendarioModal(false)}
            onSelectDate={(date) => setDataMenstruacao(date)}
          />
        </View>

        {/* IMC */}
        {imc && (
          <View>
            <Text style={perfilStyles.imcTexto}>
              📏 Seu IMC: <Text style={{ fontWeight: "bold" }}>{imc}</Text>
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[globalStyles.button, { elevation: 4 }]}
          onPress={handleSalvar}
        >
          <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>
            Salvar
          </Text>
        </TouchableOpacity>
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
