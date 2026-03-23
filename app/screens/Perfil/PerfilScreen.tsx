import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import AppBackground from "../../components/AppBackground";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import DropDownPicker from "react-native-dropdown-picker";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import type { EventArg } from "@react-navigation/native";

import { globalStyles, themeColors } from "../../theme/global";
import { perfilStyles } from "./PerfilStyles";
import {
  updatePerfil,
  getPerfil,
  sincronizarFase,
} from "../../services/perfilService";
import CalendarioModal from "../../components/calendario/CalendarioModal";
import { AnimatedLogo } from "app/components/AnimatedLogo";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";
import LunIAModal from "app/components/LunIA/LuniaModal";
import { useFaseLunar } from "../../hooks/useFaseLunar";

type PerfilScreenProps = NativeStackScreenProps<RootStackParamList, "Perfil">;

export default function PerfilScreen({ navigation }: PerfilScreenProps) {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataMenstruacao, setDataMenstruacao] = useState(new Date());
  const [duracaoCiclo, setDuracaoCiclo] = useState("28");
  const [imc, setImc] = useState<number | null>(null);
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(false);

  // Usando o hook de fase lunar
  const { fase, mensagem, recarregar: atualizarFaseLunar } = useFaseLunar();

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
  // A variável fase agora vem do hook useFaseLunar

  // Verificar se é primeiro acesso
  useEffect(() => {
    const verificarPrimeiroAcesso = async () => {
      try {
        const primeiroAcesso = await AsyncStorage.getItem("primeiro_acesso");
        setIsPrimeiroAcesso(primeiroAcesso === "true");
      } catch (error) {
        console.log("Erro ao verificar primeiro acesso:", error);
      }
    };

    verificarPrimeiroAcesso();
  }, []);

  // Bloquear botão voltar no Android durante primeiro acesso
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isPrimeiroAcesso) {
          alertaPreenchimentoObrigatorio();
          return true; // Impede o comportamento padrão de voltar
        }
        return false; // Permite o comportamento padrão de voltar
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isPrimeiroAcesso])
  );

  // Alerta de preenchimento obrigatório
  const alertaPreenchimentoObrigatorio = () => {
    Alert.alert(
      "Completar perfil obrigatório",
      "Você precisa preencher e salvar seu perfil antes de continuar usando o aplicativo.",
      [{ text: "Entendi", style: "default" }]
    );
  };

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
      const result = await updatePerfil(payload);

      // Atualiza a fase lunar usando o hook após atualização do perfil
      await atualizarFaseLunar();

      // Se for primeiro acesso, marcar como concluído e redirecionar para Home
      if (isPrimeiroAcesso) {
        await AsyncStorage.setItem("primeiro_acesso", "false");

        Toast.show({
          type: "success",
          text1: "Perfil salvo com sucesso!",
          text2: "Bem-vinda ao AgentCicle!",
        });

        // Redirecionar para a Home após salvar o perfil
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        }, 1500); // Pequeno delay para que o Toast seja visível
      } else {
        Toast.show({
          type: "success",
          text1: "Perfil atualizado com sucesso!",
        });
      }
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

  // Impedir navegação para outras telas durante primeiro acesso
  useEffect(() => {
    if (isPrimeiroAcesso) {
      const unsubscribe = navigation.addListener(
        "beforeRemove",
        (e: EventArg<"beforeRemove", true, { action: any }>) => {
          // Permitir apenas navegação para a Home após salvar
          if (
            e.data.action.type === "NAVIGATE" &&
            e.data.action.payload?.name === "Home"
          ) {
            return;
          }

          // Prevenir navegação para qualquer outra tela
          e.preventDefault();
          alertaPreenchimentoObrigatorio();
        }
      );

      return unsubscribe;
    }
  }, [navigation, isPrimeiroAcesso]);

  return (
    <AppBackground>
      <View style={{ marginTop: 60 }}>
        <AnimatedLogo />
      </View>
      <View style={perfilStyles.container}>
        {isPrimeiroAcesso && (
          <View style={perfilStyles.primeiroAcessoAviso}>
            <Text style={perfilStyles.avisoTexto}>
              Complete seu perfil para continuar
            </Text>
          </View>
        )}

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

      {!isPrimeiroAcesso && (
        <FloatingLuniaCoach
          userName={userName}
          mostrarAssistente={mostrarLunia}
          onAbrirAssistente={() => setMostrarLunia(true)}
        />
      )}

      {!isPrimeiroAcesso && (
        <LunIAModal
          visivel={mostrarLunia}
          onFechar={() => setMostrarLunia(false)}
          fase={fase}
          userName={userName}
        />
      )}
    </AppBackground>
  );
}
