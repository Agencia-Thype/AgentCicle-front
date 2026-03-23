import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { login } from "../../services/authService";
import Toast from "react-native-toast-message";
import { globalStyles, themeColors } from "../../theme/global";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAssinatura } from "../../contexts/AssinaturaContext";
import AppBackground from "../../components/AppBackground";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { verificarStatus } = useAssinatura();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setErroEmail(false);
    setErroSenha(false);

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

    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "E-mail inválido",
        text2: "Por favor, insira um e-mail válido.",
      });
      setErroEmail(true);
      return;
    }

    try {
      setIsLoading(true);
      const data = await login(email, senha);
      if (!data) return;

      await AsyncStorage.setItem("auth_token", data.access_token);

      Toast.show({
        type: "success",
        text1: "Login realizado com sucesso!",
      });

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await verificarStatus(true);
        navigation.navigate("Home", {
          showTrialBanner: true,
          justLoggedIn: true,
        });
      } catch (statusError) {
        navigation.navigate("Home", { justLoggedIn: true });
      }
    } catch (error) {
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
    <AppBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
            placeholderTextColor="rgba(238, 208, 252, 0.6)"
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
              placeholderTextColor="rgba(238, 208, 252, 0.6)"
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
                color="#EED0FC"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
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
    color: "#FFFAC3",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#EED0FC",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.6)",
  },
  inputError: {
    borderColor: "#ff6b6b",
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.6)",
    width: "100%",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#EED0FC",
  },
  loginButton: {
    backgroundColor: "#9260CE",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#9260CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  linkContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  link: {
    color: "#EED0FC",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  registerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#FFFAC3",
    fontSize: 14,
    textAlign: "center",
  },
});
