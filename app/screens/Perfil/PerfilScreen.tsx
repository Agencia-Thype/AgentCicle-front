import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

import { globalStyles } from "../../theme/global";
import { perfilStyles } from "./PerfilStyles";
import {
  updatePerfil,
  getPerfil,
  sincronizarFase,
  excluirConta,
} from "../../services/perfilService";
import CalendarioModal from "../../components/calendario/CalendarioModal";
import { AnimatedLogo } from "app/components/AnimatedLogo";
import FloatingLuniaCoach from "app/components/LunIA/LuniaFloatingMessage";
import LunIAModal from "app/components/LunIA/LuniaModal";
import { useFaseLunar } from "../../hooks/useFaseLunar";
import { palette } from "../../theme/colors";
import { useAuth } from "../../contexts/AuthContext";
import { contaUsaApple, revogarTokenApple } from "../../services/authService";
import { calcularImc, converterNumeroDecimal } from "../../utils/imc";

type PerfilScreenProps = NativeStackScreenProps<RootStackParamList, "Perfil">;

export default function PerfilScreen({ navigation }: PerfilScreenProps) {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataMenstruacao, setDataMenstruacao] = useState(new Date());
  const [duracaoCiclo, setDuracaoCiclo] = useState("28");
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(false);
  const [excluindoConta, setExcluindoConta] = useState(false);
  const [saindoConta, setSaindoConta] = useState(false);

  const { logout } = useAuth();
  // Depois de excluir a conta o guard de primeiro acesso precisa liberar a saída.
  const contaExcluidaRef = useRef(false);
  // O listener de navegação pode executar antes do estado renderizar novamente.
  const perfilSalvoRef = useRef(false);
  const saidaAutorizadaRef = useRef(false);

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

      // addEventListener passou a devolver a inscrição; removeEventListener
      // não existe mais no React Native e lançaria em runtime.
      const inscricao = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => inscricao.remove();
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

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const carregarPerfil = async () => {
      try {
        const perfil = await getPerfil();
        if (perfil && ativo) {
          setAltura(perfil.altura?.toString().replace(".", ",") || "");
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
      return () => {
        ativo = false;
      };
    }, [])
  );

  const imc = useMemo(() => calcularImc(altura, peso), [altura, peso]);

  const handleSalvar = async () => {
    if (!altura || !peso || !objetivo || !dataMenstruacao || !duracaoCiclo) {
      Toast.show({
        type: "error",
        text1: "Preencha todos os campos",
      });
      return;
    }

    const alturaNumerica = converterNumeroDecimal(altura);
    const pesoNumerico = converterNumeroDecimal(peso);
    if (alturaNumerica === null || pesoNumerico === null) {
      Toast.show({
        type: "error",
        text1: "Informe altura e peso válidos",
      });
      return;
    }

    try {
      const payload = {
        altura: alturaNumerica,
        peso_atual: pesoNumerico,
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
        perfilSalvoRef.current = true;
        setIsPrimeiroAcesso(false);

        Toast.show({
          type: "success",
          text1: "Perfil salvo com sucesso!",
          text2: "Bem-vinda ao AgentCicle!",
        });

        // Encerra o fluxo obrigatório e abre a Home imediatamente. O Toast é
        // global e permanece visível durante a troca de tela.
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Perfil atualizado com sucesso!",
        });
        perfilSalvoRef.current = true;
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
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

  const classificacaoImc = (valor: number | null) => {
    if (!valor) return "Preencha altura e peso";
    if (valor < 18.5) return "Abaixo do adequado";
    if (valor < 25) return "Peso adequado";
    if (valor < 30) return "Acima do adequado";
    return "Atenção ao IMC";
  };

  const formatarAlturaDigitada = (texto: string) => {
    const normalizado = texto.replace(".", ",").replace(/[^0-9,]/g, "");
    if (normalizado.includes(",")) {
      const [inteiro, decimal = ""] = normalizado.split(",");
      return `${inteiro.slice(0, 1)},${decimal.slice(0, 2)}`;
    }
    if (normalizado.length >= 3) {
      return `${normalizado.slice(0, 1)},${normalizado.slice(1, 3)}`;
    }
    return normalizado;
  };

  const formatarPesoDigitado = (texto: string) => {
    const normalizado = texto.replace(".", ",").replace(/[^0-9,]/g, "");
    const [inteiro = "", decimal] = normalizado.split(",");
    const inteiroLimitado = inteiro.slice(0, 3);

    return decimal === undefined
      ? inteiroLimitado
      : `${inteiroLimitado},${decimal.slice(0, 2)}`;
  };

  const confirmarExclusaoDefinitiva = () => {
    const avisoApple = contaUsaApple()
      ? " A Apple vai pedir sua confirmação para desvincular o app da sua conta."
      : "";

    Alert.alert(
      "Tem certeza absoluta?",
      "Todos os seus dados serão apagados: histórico do ciclo, treinos, diário de sintomas e conversas com a Lunia. Esta ação não pode ser desfeita." +
        avisoApple,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir definitivamente",
          style: "destructive",
          onPress: executarExclusaoConta,
        },
      ]
    );
  };

  const executarExclusaoConta = async () => {
    setExcluindoConta(true);

    try {
      // Precisa vir antes de apagar a conta: revogar exige sessão ativa.
      // Não faz nada se a usuária não entrou com a Apple.
      await revogarTokenApple();

      await excluirConta();
      contaExcluidaRef.current = true;

      Toast.show({
        type: "success",
        text1: "Conta excluída",
        text2: "Seus dados foram removidos permanentemente.",
      });

      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error: any) {
      console.log("Erro ao excluir conta:", error);
      setExcluindoConta(false);
      Toast.show({
        type: "error",
        text1: "Não foi possível excluir a conta",
        text2: error?.message || "Tente novamente em alguns instantes.",
      });
    }
  };

  const handleExcluirConta = () => {
    Alert.alert(
      "Excluir minha conta",
      "Esta ação é permanente e apaga todos os seus dados do AgentCicle. Você quer continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: confirmarExclusaoDefinitiva,
        },
      ]
    );
  };

  const handleSairConta = async () => {
    if (saindoConta) return;
    setSaindoConta(true);
    saidaAutorizadaRef.current = true;

    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      saidaAutorizadaRef.current = false;
      setSaindoConta(false);
      Toast.show({
        type: "error",
        text1: "Não foi possível sair",
        text2: "Tente novamente.",
      });
    }
  };

  // Impedir navegação para outras telas durante primeiro acesso
  useEffect(() => {
    if (isPrimeiroAcesso) {
      const unsubscribe = navigation.addListener(
        "beforeRemove",
        (e: EventArg<"beforeRemove", true, { action: any }>) => {
          // A conta não existe mais: não há perfil para obrigar a preencher.
          if (contaExcluidaRef.current || perfilSalvoRef.current || saidaAutorizadaRef.current) {
            return;
          }

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

  const campoNumerico = (
    icone: React.ComponentProps<typeof MaterialIcons>["name"],
    titulo: string,
    ajuda: string,
    unidade: string,
    valor: string,
    alterar: (texto: string) => void,
    placeholder: string
  ) => (
    <View style={perfilStyles.card}>
      <View style={perfilStyles.iconCircle}><MaterialIcons name={icone} size={25} color={palette.purpleDark} /></View>
      <View style={perfilStyles.cardFull}>
        <View style={perfilStyles.cardTopRow}>
          <View style={perfilStyles.textColumn}>
            <Text style={perfilStyles.label}>{titulo}</Text>
            <Text style={perfilStyles.helper}>{ajuda}</Text>
          </View>
          <View style={perfilStyles.compactInput}>
            <TextInput placeholder={placeholder} placeholderTextColor={palette.textMuted} value={valor} onChangeText={alterar} keyboardType="decimal-pad" style={perfilStyles.numberInput} />
            <Text style={perfilStyles.unit}>{unidade}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const perfilRedesenhado = (
    <AppBackground>
      <KeyboardAvoidingView style={perfilStyles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={perfilStyles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={perfilStyles.header}>
            {!isPrimeiroAcesso && navigation.canGoBack() && (
              <TouchableOpacity style={perfilStyles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar">
                <MaterialIcons name="arrow-back" size={31} color={palette.purpleDark} />
              </TouchableOpacity>
            )}
            <AnimatedLogo style={perfilStyles.logo} />
          </View>
          <View style={perfilStyles.intro}>
            {isPrimeiroAcesso && <View style={perfilStyles.primeiroAcessoAviso}><Text style={perfilStyles.avisoTexto}>Complete seu perfil para continuar</Text></View>}
            <Text style={perfilStyles.title}>Complete seu perfil</Text>
            <Text style={perfilStyles.subtitle}>Essas informações nos ajudam a personalizar sua experiência no Cíclica.</Text>
          </View>

          {campoNumerico("accessibility-new", "Altura", "Em metros (ex.: 1,64)", "m", altura, (texto) => setAltura(formatarAlturaDigitada(texto)), "1,64")}
          {campoNumerico("monitor-weight", "Peso", "Em kg (ex.: 60)", "kg", peso, (texto) => setPeso(formatarPesoDigitado(texto)), "60")}

          <View style={[perfilStyles.card, { zIndex: 20 }]}>
            <View style={perfilStyles.iconCircle}><MaterialIcons name="track-changes" size={26} color={palette.purpleDark} /></View>
            <View style={perfilStyles.cardFull}>
              <Text style={perfilStyles.label}>Qual seu principal objetivo?</Text>
              <Text style={perfilStyles.helper}>Isso nos ajuda a personalizar seu plano.</Text>
              <DropDownPicker placeholder="Selecione seu objetivo" open={open} value={objetivo} items={itensObjetivo} setOpen={setOpen} setValue={setObjetivo} setItems={setItensObjetivo} style={perfilStyles.dropdown} dropDownContainerStyle={perfilStyles.dropdownContainer} textStyle={perfilStyles.dropdownText} listMode="SCROLLVIEW" searchable searchPlaceholder="Digite para buscar..." />
            </View>
          </View>

          <View style={perfilStyles.card}>
            <View style={perfilStyles.iconCircle}><MaterialIcons name="date-range" size={25} color={palette.purpleDark} /></View>
            <View style={perfilStyles.cardFull}>
              <Text style={perfilStyles.label}>Duração do ciclo</Text>
              <Text style={perfilStyles.helper}>Em média, quantos dias dura o seu ciclo?</Text>
              <View style={perfilStyles.cicloControls}>
                <TouchableOpacity onPress={() => { const valor = parseInt(duracaoCiclo) - 1; if (valor >= 21) setDuracaoCiclo(valor.toString()); }} style={perfilStyles.cicloButton}><Text style={perfilStyles.cicloButtonText}>−</Text></TouchableOpacity>
                <Text style={perfilStyles.cicloValor}>{duracaoCiclo} dias</Text>
                <TouchableOpacity onPress={() => { const valor = parseInt(duracaoCiclo) + 1; if (valor <= 35) setDuracaoCiclo(valor.toString()); }} style={perfilStyles.cicloButton}><Text style={perfilStyles.cicloButtonText}>+</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={perfilStyles.card}>
            <View style={perfilStyles.iconCircle}><MaterialIcons name="calendar-today" size={24} color={palette.purpleDark} /></View>
            <View style={perfilStyles.cardFull}>
              <Text style={perfilStyles.label}>Última menstruação</Text>
              <Text style={perfilStyles.helper}>Selecione a data da sua última menstruação.</Text>
              <TouchableOpacity onPress={() => setShowCalendarioModal(true)} style={perfilStyles.dateButton}>
                <Text style={perfilStyles.dateButtonText}>{formatarData(dataMenstruacao)}</Text>
                <MaterialIcons name="calendar-month" size={23} color={palette.purpleDark} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[perfilStyles.card, perfilStyles.imcCard]}>
            <View style={[perfilStyles.iconCircle, perfilStyles.imcIcon]}><MaterialIcons name="bar-chart" size={27} color={palette.sageDark} /></View>
            <View style={perfilStyles.cardFull}>
              <Text style={perfilStyles.label}>Seu IMC</Text>
              <Text style={perfilStyles.helper}>Calculado a partir da sua altura e peso.</Text>
              <View style={perfilStyles.imcResult}>
                <Text style={perfilStyles.imcValue}>{imc?.toFixed(1) ?? "—"}</Text>
                <View style={perfilStyles.imcBadge}><Text style={perfilStyles.imcBadgeText}>{classificacaoImc(imc)}</Text></View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={perfilStyles.saveButton} onPress={handleSalvar}>
            <Text style={perfilStyles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={perfilStyles.sairContaButton} onPress={handleSairConta} disabled={saindoConta} accessibilityRole="button" accessibilityLabel="Sair da conta">
            <MaterialIcons name="logout" size={18} color={palette.purpleDark} />
            <Text style={perfilStyles.sairContaTexto}>{saindoConta ? "Saindo..." : "Sair da conta"}</Text>
          </TouchableOpacity>
          {!isPrimeiroAcesso && <TouchableOpacity style={perfilStyles.excluirContaButton} onPress={handleExcluirConta} disabled={excluindoConta} accessibilityRole="button" accessibilityLabel="Excluir minha conta"><MaterialIcons name="delete-outline" size={18} color={palette.error} /><Text style={perfilStyles.excluirContaTexto}>{excluindoConta ? "Excluindo..." : "Excluir minha conta"}</Text></TouchableOpacity>}
        </ScrollView>
      </KeyboardAvoidingView>

      <CalendarioModal visible={showCalendarioModal} onClose={() => setShowCalendarioModal(false)} onSelectDate={(date) => setDataMenstruacao(date)} />
    </AppBackground>
  );

  return perfilRedesenhado;

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
          placeholderTextColor={palette.textSecondary}
          value={altura}
          onChangeText={(texto) => setAltura(formatarAlturaDigitada(texto))}
          keyboardType="decimal-pad"
          style={perfilStyles.input}
        />

        <TextInput
          placeholder="Peso atual (kg)"
          placeholderTextColor={palette.textSecondary}
          value={peso}
          onChangeText={(texto) => setPeso(formatarPesoDigitado(texto))}
          keyboardType="decimal-pad"
          style={perfilStyles.input}
        />

        {/* Objetivo */}
        <Text style={perfilStyles.label}>Qual seu principal objetivo?</Text>
        <DropDownPicker
          placeholder="Selecione seu objetivo"
          listMode="SCROLLVIEW"
          open={open}
          value={objetivo}
          items={itensObjetivo}
          setOpen={setOpen}
          setValue={setObjetivo}
          setItems={setItensObjetivo}
          style={{
            backgroundColor: "rgba(214, 69, 63, 0.15)",
            borderColor: palette.error,
            marginBottom: 16,
            borderRadius: 10,
          }}
          dropDownContainerStyle={{
            backgroundColor: "rgba(214, 69, 63, 0.15)",
            borderColor: palette.error,
          }}
          textStyle={{
            color: palette.textPrimary,
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
              color={palette.white}
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

        {!isPrimeiroAcesso && (
          <TouchableOpacity
            style={perfilStyles.excluirContaButton}
            onPress={handleExcluirConta}
            disabled={excluindoConta}
            accessibilityRole="button"
            accessibilityLabel="Excluir minha conta"
          >
            <MaterialIcons
              name="delete-outline"
              size={18}
              color={palette.error}
            />
            <Text style={perfilStyles.excluirContaTexto}>
              {excluindoConta ? "Excluindo..." : "Excluir minha conta"}
            </Text>
          </TouchableOpacity>
        )}
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
