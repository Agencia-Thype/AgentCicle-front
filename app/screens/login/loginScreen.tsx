import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { login } from "../../services/authService";
import Toast from "react-native-toast-message";
import { globalStyles, themeColors } from "../../theme/global";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAssinatura } from "../../contexts/AssinaturaContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Acessando o contexto de assinatura
  const { verificarStatus } = useAssinatura();

  const handleLogin = async () => {
    if (!email || !senha) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios",
        text2: "Preencha o e-mail e a senha.",
      });
      setErroEmail(true);
      setErroSenha(true);
      return;
    }

    try {
      setIsLoading(true);
      const data = await login(email, senha);
      if (!data) return;

      // Armazenando com a chave auth_token que o interceptor espera
      await AsyncStorage.setItem("auth_token", data.access_token);

      // Verificação mais detalhada do token para debug
      console.log(
        "Token armazenado:",
        data.access_token.substring(0, 10) + "..."
      );
      console.log("Tamanho do token:", data.access_token.length);

      // Verificar se o token tem partes JWT válidas (header.payload.signature)
      const tokenParts = data.access_token.split(".");
      if (tokenParts.length !== 3) {
        console.warn(
          "AVISO: Token não parece ser um JWT válido (não tem 3 partes)"
        );
      }

      // Mostrar feedback imediato ao usuário
      Toast.show({
        type: "success",
        text1: "Login realizado com sucesso!",
      });

      // Verificar status de assinatura do usuário após login bem-sucedido
      try {
        // Espera um momento para o token ser processado pelo interceptor
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log(
          "[LoginScreen] Iniciando verificação de status após login..."
        );

        // Verifica o status de assinatura (sempre forçando no login)
        // Este é o momento estratégico mais importante para verificar o status
        await verificarStatus(true); // true = força verificação da API
        console.log("[LoginScreen] Verificação de status concluída após login");

        // Definir um parâmetro para informar a Home que acabamos de fazer login
        // e ela deve mostrar o banner de trial se necessário
        navigation.navigate("Home", {
          showTrialBanner: true,
          justLoggedIn: true,
        });
      } catch (statusError) {
        console.error(
          "Erro ao verificar status de assinatura após login:",
          statusError
        );

        // Mesmo com erro, redireciona para a home
        // O app tentará verificar o status novamente na próxima inicialização
        navigation.navigate("Home", { justLoggedIn: true });
      }
    } catch (error) {
      console.log("Erro inesperado no login:", error);
      Toast.show({
        type: "error",
        text1: "Erro inesperado",
        text2: "Tente novamente em instantes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <AnimatedLogo style={styles.logo} />
        </View>

        <Text style={styles.title}>Bem-vinda de volta!</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, erroEmail && styles.inputError]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErroEmail(false);
            }}
          />

          <View
            style={[styles.passwordContainer, erroSenha && styles.inputError]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Senha"
              placeholderTextColor="#999"
              secureTextEntry={!senhaVisivel}
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                setErroSenha(false);
              }}
            />
            <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
              <Ionicons
                name={senhaVisivel ? "eye-off" : "eye"}
                size={20}
                color="#333"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerContainer}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerLink}>
              Ainda não tem conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5C3B3B",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#5C3B3B",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputError: {
    borderColor: "#ff4d4d",
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "100%",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#7EAA92",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  linkContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  link: {
    color: "#5C3B3B",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  registerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#5C3B3B",
    fontSize: 14,
    textAlign: "center",
  },
});
