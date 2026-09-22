import React, { useEffect, useRef, useState } from "react";
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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { registerUser, signInWithGoogleCredential } from "../../services/authService";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import * as Google from "expo-auth-session/providers/google";
import {
  googleAuthConfig,
  googleConfigurado,
} from "../../services/googleAuthConfig";
import BotaoApple from "../../components/BotaoApple";
import { palette } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

const senhaRegex = {
  maiuscula: /[A-Z]/,
  minuscula: /[a-z]/,
  numero: /\d/,
  especial: /[@$!%*?&]/,
  tamanho: /.{6,}/,
};

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

function GoogleLogo() {
  return (
    <Svg width={21} height={21} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.61 20H24v8h11.3C33.65 32.66 29.22 36 24 36c-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-4Z" />
      <Path fill="#FF3D00" d="m6.31 14.69 6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4c-7.68 0-14.35 4.34-17.69 10.69Z" />
      <Path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.98 13.41-5.19l-6.19-5.24A11.91 11.91 0 0 1 24 36c-5.2 0-9.61-3.32-11.27-7.95l-6.52 5.02A20 20 0 0 0 24 44Z" />
      <Path fill="#1976D2" d="M43.61 20H24v8h11.3a12.04 12.04 0 0 1-4.08 5.57l6.19 5.24C36.97 39.21 44 34 44 24c0-1.34-.14-2.65-.39-4Z" />
    </Svg>
  );
}

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erroCampos, setErroCampos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const logoRef = useRef<any>(null);
  const nav = useNavigation();

  const [, googleResponse, promptGoogleLogin] = Google.useAuthRequest(googleAuthConfig);

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

  useEffect(() => {
    if (googleResponse?.type !== "success") return;
    const idToken = googleResponse.authentication?.idToken;
    if (!idToken) return;

    (async () => {
      setGoogleLoading(true);
      const user = await signInWithGoogleCredential(idToken);
      setGoogleLoading(false);
      if (user) {
        navigation.navigate("Home", { justLoggedIn: true });
      }
    })();
  }, [googleResponse]);

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
      return Toast.show({ type: "error", text1: "Senhas não coincidem" });
    }

    const senhaValida = Object.values(requisitos).every(Boolean);
    if (!senhaValida) {
      return Toast.show({
        type: "error",
        text1: "Senha inválida",
        text2: "Preencha todos os requisitos da senha.",
      });
    }

    setIsLoading(true);
    const user = await registerUser({ nome, email, senha });
    setIsLoading(false);

    if (!user) return;

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
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={23} color="#F8EDDE" />
            </TouchableOpacity>
            <AnimatedLogo ref={logoRef} style={styles.logo} />

            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece sua jornada com a Lunia</Text>

            <View style={styles.formContainer}>
              <TextInput
                style={[styles.input, erroCampos && !nome && styles.inputError]}
                placeholder="Nome"
                placeholderTextColor="#C4B2C0"
                value={nome}
                onChangeText={(text) => {
                  setNome(text);
                  setErroCampos(false);
                }}
              />
              <TextInput
                style={[styles.input, erroCampos && !email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#C4B2C0"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErroCampos(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Senha"
                  placeholderTextColor="#C4B2C0"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                  <Ionicons
                    name={mostrarSenha ? "eye-off" : "eye"}
                    size={19}
                    color={palette.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordRulesContainer}>
                <Text style={[styles.ruleItem, requisitos.maiuscula && styles.valid]}>
                  ✓ 1 letra maiúscula
                </Text>
                <Text style={[styles.ruleItem, requisitos.minuscula && styles.valid]}>
                  ✓ 1 letra minúscula
                </Text>
                <Text style={[styles.ruleItem, requisitos.numero && styles.valid]}>
                  ✓ 1 número
                </Text>
                <Text style={[styles.ruleItem, requisitos.especial && styles.valid]}>
                  ✓ 1 caractere especial
                </Text>
                <Text style={[styles.ruleItem, requisitos.tamanho && styles.valid]}>
                  ✓ Mínimo 6 caracteres
                </Text>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirme a senha"
                  placeholderTextColor="#C4B2C0"
                  secureTextEntry={!mostrarConfirmarSenha}
                  value={confirmacaoSenha}
                  onChangeText={setConfirmacaoSenha}
                />
                <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
                  <Ionicons
                    name={mostrarConfirmarSenha ? "eye-off" : "eye"}
                    size={19}
                    color={palette.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={palette.white} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <BotaoApple
                onSucesso={() => navigation.navigate("Home", { justLoggedIn: true })}
              />

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => googleConfigurado && promptGoogleLogin()}
                disabled={googleLoading || !googleConfigurado}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#4285F4" size="small" />
                ) : (
                  <>
                    <GoogleLogo />
                    <Text style={styles.googleButtonText}>Continuar com Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  logoRef.current?.animateOut(() => {
                    navigation.replace("Login");
                  })
                }
              >
                <Text style={styles.link}>Já tem conta? <Text style={styles.linkStrong}>Entrar</Text></Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#241126" },
  scrollContent: { flexGrow: 1, paddingBottom: 28 },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 26,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 14,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logo: {
    width: 86,
    height: 86,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 30,
    color: "#F8EDDE",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "#C8B7C4",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 430,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(230,205,223,.28)",
    backgroundColor: "rgba(255,245,252,.075)",
  },
  input: {
    fontFamily: fonts.body,
    height: 50,
    backgroundColor: "rgba(255,255,255,.025)",
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    color: "#FFF7FC",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(226,194,215,.42)",
  },
  inputError: {
    borderColor: palette.error,
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,.025)",
    marginBottom: 8,
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(226,194,215,.42)",
    width: "100%",
  },
  passwordInput: {
    fontFamily: fonts.body,
    flex: 1,
    fontSize: 15,
    color: "#FFF7FC",
  },
  passwordRulesContainer: {
    width: "100%",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  ruleItem: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#AE99AA",
    marginBottom: 2,
  },
  valid: {
    fontFamily: fonts.bodyMedium,
    color: "#A8BF5A",
  },
  button: {
    backgroundColor: "#A756BC",
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginTop: 4,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    color: palette.white,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(220,187,209,.35)",
  },
  dividerText: {
    fontFamily: fonts.body,
    color: "#BFAABA",
    fontSize: 13,
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFBFA",
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 16,
    height: 46,
    width: "100%",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    fontFamily: fonts.bodySemiBold,
    color: "#2F2431",
    fontSize: 13,
  },
  link: {
    fontFamily: fonts.body,
    color: "#C99BE9",
    fontSize: 14,
    textAlign: "center",
  },
  linkStrong: { fontFamily: fonts.bodySemiBold, textDecorationLine: "underline" },
});
