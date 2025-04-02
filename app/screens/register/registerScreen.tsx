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
import { globalStyles } from "../../theme/global";
import { useNavigation } from "@react-navigation/native";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { Ionicons } from '@expo/vector-icons';
import { registerStyles } from "./registerStyles";

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
  const logoRef = useRef<any>(null);
  const nav = useNavigation();

  useEffect(() => {
    const unsubscribe = nav.addListener("beforeRemove", (e) => {
      e.preventDefault();

      if (logoRef.current?.fadeOutUp) {
        logoRef.current.fadeOutUp(500).then(() => {
          unsubscribe();
          nav.dispatch(e.data.action);
        });
      } else {
        nav.dispatch(e.data.action);
      }
    });

    return unsubscribe;
  }, [nav]);

  const validarSenha = (senha: string) => {
    return {
      maiuscula: senhaRegex.maiuscula.test(senha),
      minuscula: senhaRegex.minuscula.test(senha),
      numero: senhaRegex.numero.test(senha),
      especial: senhaRegex.especial.test(senha),
      tamanho: senhaRegex.tamanho.test(senha),
    };
  };

  const requisitos = validarSenha(senha);

  const handleRegister = async () => {
    if (senha !== confirmacaoSenha) {
      return Toast.show({
        type: "error",
        text1: "Senhas não coincidem",
        text2: "Confirme sua senha corretamente.",
      });
    }

    const senhaValida = Object.values(requisitos).every((item) => item);

    if (!senhaValida) {
      return Toast.show({
        type: "error",
        text1: "Senha inválida",
        text2: "Preencha todos os requisitos da senha.",
      });
    }

    try {
      await registerUser({
        nome,
        email,
        senha,
        confirmacao_senha: confirmacaoSenha,
      });

      Toast.show({
        type: "success",
        text1: "Cadastro realizado!",
        text2: "Verifique seu e-mail para validar.",
      });

      if (logoRef.current?.fadeOutUp) {
        logoRef.current.fadeOutUp(500).then(() => {
          navigation.navigate("ValidarEmail", { email });
        });
      } else {
        navigation.navigate("ValidarEmail", { email });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2:
          error.response?.data?.detail ||
          error.message ||
          "Erro ao cadastrar. Tente novamente.",
      });
    }
  };

  return (
    <LinearGradient
      colors={["#68d1c9", "#b4f0ec", "#c695da", "#a460bf", "#931b9a"]}
      style={globalStyles.backgroundGradient}
    >
      <AnimatedLogo ref={logoRef} />

      <Text style={globalStyles.title}>Criar Conta</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        <Text style={[styles.ruleItem, requisitos.maiuscula && styles.valid]}>✔ 1 letra maiúscula</Text>
        <Text style={[styles.ruleItem, requisitos.minuscula && styles.valid]}>✔ 1 letra minúscula</Text>
        <Text style={[styles.ruleItem, requisitos.numero && styles.valid]}>✔ 1 número</Text>
        <Text style={[styles.ruleItem, requisitos.especial && styles.valid]}>✔ 1 caractere especial</Text>
        <Text style={[styles.ruleItem, requisitos.tamanho && styles.valid]}>✔ Mínimo 6 caracteres</Text>
      </View>

      <View style={registerStyles.passwordContainer}>
        <TextInput
          style={registerStyles.inputSenha}
          placeholder="Confirme a senha"
          secureTextEntry={!mostrarConfirmarSenha}
          value={confirmacaoSenha}
          onChangeText={setConfirmacaoSenha}
        />
        <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
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

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={globalStyles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  passwordRulesContainer: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  ruleItem: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 2,
  },
  valid: {
    color: '#00ffb2',
    fontWeight: 'bold',
  },
});
