import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { registerUser } from "../../services/authService";
import Toast from "react-native-toast-message";
import { themeColors } from "../../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { Ionicons } from "@expo/vector-icons";
import { registerStyles } from "./registerStyles";
import { globalStyles } from "../../theme/global";

const senhaRegex = {
  maiuscula: /[A-Z]/,
  minuscula: /[a-z]/,
  numero: /\d/,
  especial: /[@$!%*?&]/,
  tamanho: /.{6,}/,
};

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erroCampos, setErroCampos] = useState(false);

  const logoRef = useRef<any>(null);
  const nav = useNavigation();

  useEffect(() => {
    const unsubscribe = nav.addListener("beforeRemove", (e) => {
      e.preventDefault();
      logoRef.current?.animateOut(() => {
        unsubscribe();
        nav.dispatch(e.data.action);
      });
    });
    return unsubscribe;
  }, [nav]);

  const validarSenha = (senha: string) => ({
    maiuscula: senhaRegex.maiuscula.test(senha),
    minuscula: senhaRegex.minuscula.test(senha),
    numero: senhaRegex.numero.test(senha),
    especial: senhaRegex.especial.test(senha),
    tamanho: senhaRegex.tamanho.test(senha),
  });

  const requisitos = validarSenha(senha);

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmacaoSenha) {
      setErroCampos(true);
      return Toast.show({
        type: "error",
        text1: "Preencha todos os campos obrigatórios.",
      });
    }

    if (senha !== confirmacaoSenha) {
      return Toast.show({
        type: "error",
        text1: "Senhas não coincidem",
      });
    }

    const senhaValida = Object.values(requisitos).every(Boolean);

    if (!senhaValida) {
      return Toast.show({
        type: "error",
        text1: "Senha inválida",
        text2: "Preencha todos os requisitos da senha.",
      });
    }

    try {
      const data = await registerUser({
        nome,
        email,
        senha,
        confirmacao_senha: confirmacaoSenha,
      });

      if (!data) throw new Error("Erro inesperado");

      Toast.show({
        type: "success",
        text1: "Cadastro realizado!",
        text2: "Verifique seu e-mail para validar.",
      });

      logoRef.current?.fadeOutUp(500).then(() => {
        navigation.navigate("ValidarEmail", { email });
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro no cadastro",
        text2:
          error.response?.data?.detail ||
          error.message ||
          "Erro inesperado. Tente novamente.",
      });
    }
  };

  return (
    <LinearGradient
      colors={themeColors.gradient}
      style={globalStyles.backgroundGradient}
    >
      <AnimatedLogo ref={logoRef} />

      <Text style={globalStyles.title}>Criar Conta</Text>

      <TextInput
        style={[
          globalStyles.input,
          erroCampos && !nome && styles.inputError,
        ]}
        placeholder="Nome"
        value={nome}
        onChangeText={(text) => {
          setNome(text);
          setErroCampos(false);
        }}
      />
      <TextInput
        style={[
          globalStyles.input,
          erroCampos && !email && styles.inputError,
        ]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErroCampos(false);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={registerStyles.passwordContainer}>
        <TextInput
          style={registerStyles.inputSenha}
          placeholder="Senha"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
          <Ionicons
            name={mostrarSenha ? "eye" : "eye-off"}
            size={24}
            color="#999"
            style={registerStyles.iconEye}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordRulesContainer}>
        <Text style={[styles.ruleItem, requisitos.maiuscula && styles.valid]}>
          ✔ 1 letra maiúscula
        </Text>
        <Text style={[styles.ruleItem, requisitos.minuscula && styles.valid]}>
          ✔ 1 letra minúscula
        </Text>
        <Text style={[styles.ruleItem, requisitos.numero && styles.valid]}>
          ✔ 1 número
        </Text>
        <Text style={[styles.ruleItem, requisitos.especial && styles.valid]}>
          ✔ 1 caractere especial
        </Text>
        <Text style={[styles.ruleItem, requisitos.tamanho && styles.valid]}>
          ✔ Mínimo 6 caracteres
        </Text>
      </View>

      <View style={registerStyles.passwordContainer}>
        <TextInput
          style={registerStyles.inputSenha}
          placeholder="Confirme a senha"
          secureTextEntry={!mostrarConfirmarSenha}
          value={confirmacaoSenha}
          onChangeText={setConfirmacaoSenha}
        />
        <TouchableOpacity
          onPress={() =>
            setMostrarConfirmarSenha(!mostrarConfirmarSenha)
          }
        >
          <Ionicons
            name={mostrarConfirmarSenha ? "eye" : "eye-off"}
            size={24}
            color="#999"
            style={registerStyles.iconEye}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
        <Text style={globalStyles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          logoRef.current?.animateOut(() => {
            navigation.replace("Login");
          })
        }
      >
        <Text style={globalStyles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderColor: "#ff4d4d",
    borderWidth: 1.5,
  },
  passwordRulesContainer: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  ruleItem: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 2,
  },
  valid: {
    color: "#00ffb2",
    fontWeight: "bold",
  },
});
