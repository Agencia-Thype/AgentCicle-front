import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { resetPassword } from "../../services/authService";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import AppBackground from "../../components/AppBackground";
import { palette, spacing, radius } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const logoRef = useRef(null);
  const nav = useNavigation();

  useEffect(() => {
    const unsubscribe = nav.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => { unsubscribe(); nav.dispatch(e.data.action); });
      } else nav.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [nav]);

  const handleSubmit = async () => {
    if (!email) return;
    setEnviando(true);
    const sucesso = await resetPassword(email);
    setEnviando(false);

    if (sucesso) {
      Toast.show({
        type: "success",
        text1: "E-mail enviado",
        text2: "Confira sua caixa de entrada para redefinir a senha.",
      });
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => navigation.navigate("Login"));
      } else {
        navigation.navigate("Login");
      }
    }
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <Animatable.Image ref={logoRef} animation="fadeInDown" duration={1000} source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>Informe seu e-mail e enviaremos um link para redefinir sua senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu e-mail"
          placeholderTextColor={palette.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={enviando}>
          <Text style={styles.buttonText}>{enviando ? "Enviando..." : "Enviar link"}</Text>
        </TouchableOpacity>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  logo: { width: 96, height: 96, alignSelf: "center", marginBottom: spacing.md },
  title: { fontFamily: fonts.title, fontSize: 26, color: palette.gold, textAlign: "center", marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: palette.textSecondary, textAlign: "center", marginBottom: spacing.xl },
  input: {
    fontFamily: fonts.body,
    backgroundColor: palette.glass,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: spacing.md,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.glassBorder,
  },
  button: {
    backgroundColor: palette.purple,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  buttonText: { fontFamily: fonts.bodySemiBold, color: palette.white, fontSize: 16 },
});
