import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { login, signInWithGoogleCredential } from "../../services/authService";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  googleAuthConfig,
  googleConfigurado,
} from "../../services/googleAuthConfig";
import { useAssinatura } from "../../contexts/AssinaturaContext";
import { fonts } from "../../theme/fonts";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

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

export default function LoginScreen({ navigation }: Props) {
  const { height } = useWindowDimensions();
  const compacto = height < 760;
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { verificarStatus } = useAssinatura();

  const [, googleResponse, promptGoogleLogin] = Google.useAuthRequest(googleAuthConfig);

  useEffect(() => {
    if (googleResponse?.type !== "success") return;

    const idToken = googleResponse.authentication?.idToken;
    if (!idToken) return;

    (async () => {
      setGoogleLoading(true);
      const user = await signInWithGoogleCredential(idToken);
      setGoogleLoading(false);
      if (user) {
        await irParaHomeAposLogin();
      }
    })();
  }, [googleResponse]);

  const irParaHomeAposLogin = async () => {
    Toast.show({ type: "success", text1: "Login realizado com sucesso!" });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await verificarStatus(true);
      navigation.navigate("Home", { showTrialBanner: true, justLoggedIn: true });
    } catch (statusError) {
      navigation.navigate("Home", { justLoggedIn: true });
    }
  };

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
      const user = await login(email, senha);
      if (!user) return;

      await irParaHomeAposLogin();
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
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, compacto && styles.scrollCompact]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, compacto && styles.containerCompact]}>
              <View style={styles.brand}>
                <View style={styles.logoSeal}>
                  <Ionicons name="sparkles" size={20} color="#F4E8A9" style={styles.logoSparkle} />
                  <Image
                    source={require("../../assets/logo.png")}
                    resizeMode="contain"
                    style={styles.luniaLogo}
                  />
                </View>
                <Text style={styles.brandName}>Cíclica</Text>
                <Text style={styles.brandTag}>MAIS CICLOS, MAIS VOCÊ</Text>
              </View>

              <View style={styles.welcome}>
                <Text style={styles.subtitle}>
                  Continue sua jornada com a Lunia
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={[styles.field, erroEmail && styles.inputError]}>
                  <Ionicons name="mail-outline" size={21} color="#D7C4D3" />
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#C4B2C0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErroEmail(false);
                    }}
                  />
                </View>

                <View style={[styles.field, erroSenha && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={21} color="#D7C4D3" />
                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#C4B2C0"
                    secureTextEntry={!senhaVisivel}
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text);
                      setErroSenha(false);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setSenhaVisivel(!senhaVisivel)}
                    hitSlop={12}
                  >
                    <Ionicons
                      name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                      size={23}
                      color="#D7C4D3"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.loginTouch, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.86}
                >
                  <LinearGradient
                    colors={["#8B4CA5", "#C06AC6"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.loginButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF7FC" size="small" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>Entrar</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

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
                  style={styles.forgot}
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.registerContainer}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.registerText}>Ainda não tem conta? </Text>
                <Text style={styles.registerLink}>Cadastre-se</Text>
              </TouchableOpacity>

              <View style={styles.bottomSpacer} />
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#241126" },
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  scrollCompact: { paddingBottom: 12 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    minHeight: 790,
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 26,
    width: "100%",
  },
  containerCompact: { minHeight: 720, paddingTop: 12, paddingBottom: 16 },
  brand: { alignItems: "center", marginBottom: 25 },
  logoSeal: {
    width: 125,
    height: 105,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(244,232,169,.9)",
    borderRadius: 63,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: -2,
  },
  logoSparkle: { position: "absolute", top: -10, alignSelf: "center" },
  luniaLogo: { width: 105, height: 82 },
  brandName: { fontFamily: fonts.title, fontSize: 48, lineHeight: 51, color: "#F8EDB7", letterSpacing: 1 },
  brandTag: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 3, color: "#CDB9C8", marginTop: 2 },
  welcome: { marginBottom: 25, alignItems: "center" },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 25,
    color: "#C8B7C4",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 430,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 17,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(230,205,223,.28)",
    backgroundColor: "rgba(255,245,252,.075)",
  },
  field: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(226, 194, 215, 0.42)",
    backgroundColor: "rgba(255,255,255,0.025)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 12,
  },
  input: {
    fontFamily: fonts.body,
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#FFF7FC",
  },
  inputError: { borderColor: "#FF879F", borderWidth: 1.5 },
  forgot: { alignSelf: "center", paddingTop: 17, paddingBottom: 1 },
  forgotText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C99BE9", textDecorationLine: "underline" },
  loginTouch: { width: "100%", borderRadius: 32, overflow: "hidden" },
  loginButton: {
    height: 50,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(255,230,250,.7)",
  },
  loginButtonText: { fontFamily: fonts.bodyMedium, color: "#FFF7FC", fontSize: 18 },
  buttonDisabled: { opacity: 0.5 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 17 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(220,187,209,.35)" },
  dividerText: { fontFamily: fonts.body, color: "#BFAABA", fontSize: 13, marginHorizontal: 17 },
  googleButton: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 16,
    width: "100%",
    backgroundColor: "#FFFBFA",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: { fontFamily: fonts.bodySemiBold, color: "#2F2431", fontSize: 13 },
  registerContainer: { flexDirection: "row", alignItems: "center", alignSelf: "center", marginTop: 27 },
  registerText: { fontFamily: fonts.body, color: "#EEE2EA", fontSize: 15 },
  registerLink: { fontFamily: fonts.bodySemiBold, color: "#F4E8A9", fontSize: 15, textDecorationLine: "underline" },
  bottomSpacer: { flex: 1, minHeight: 24 },
});
