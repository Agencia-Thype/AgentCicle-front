import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { emailFoiVerificado, reenviarEmailVerificacao } from "../../services/authService";
import { fonts } from "../../theme/fonts";

type Props = NativeStackScreenProps<RootStackParamList, "ValidarEmail">;

export default function ValidarEmailScreen({ navigation }: Props) {
  const logoRef = useRef(null);
  const nav = useNavigation();
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    const unsubscribe = nav.addListener("beforeRemove", (event) => {
      event.preventDefault();
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          unsubscribe();
          nav.dispatch(event.data.action);
        });
      } else {
        nav.dispatch(event.data.action);
      }
    });
    return unsubscribe;
  }, [nav]);

  const handleJaVerifiquei = async () => {
    setVerificando(true);
    const verificado = await emailFoiVerificado();
    setVerificando(false);
    if (verificado) {
      Toast.show({ type: "success", text1: "E-mail verificado com sucesso!" });
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => navigation.navigate("Home"));
      } else {
        navigation.navigate("Home");
      }
    } else {
      Toast.show({ type: "error", text1: "Ainda não verificado", text2: "Clique no link enviado para o seu e-mail antes de continuar." });
    }
  };

  const handleReenviar = async () => {
    setReenviando(true);
    const sucesso = await reenviarEmailVerificacao();
    setReenviando(false);
    Toast.show({ type: sucesso ? "success" : "error", text1: sucesso ? "E-mail reenviado" : "Erro ao reenviar" });
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <View style={styles.brand}>
          <Animatable.Image ref={logoRef} animation="fadeInDown" duration={800} source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>Cíclica</Text>
          <Text style={styles.brandTag}>MAIS CICLOS, MAIS VOCÊ</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Confira seu e-mail</Text>
          <Text style={styles.subtitle}>Enviamos um link de verificação para:{"\n"}<Text style={styles.emailDestaque}>{email}</Text></Text>
          <TouchableOpacity style={styles.buttonTouch} onPress={handleJaVerifiquei} disabled={verificando} activeOpacity={0.86}>
            <LinearGradient colors={["#8B4CA5", "#C06AC6"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.button}>
              {verificando ? <ActivityIndicator color="#FFF7FC" size="small" /> : <Text style={styles.buttonText}>Já verifiquei, continuar</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendButton} onPress={handleReenviar} disabled={reenviando}>
            <Text style={styles.link}>{reenviando ? "Reenviando..." : "Reenviar e-mail"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#241126" },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 30, paddingBottom: 50 },
  brand: { alignItems: "center", marginBottom: 28 },
  logo: { width: 104, height: 82, alignSelf: "center" },
  brandName: { fontFamily: fonts.title, fontSize: 43, lineHeight: 46, color: "#F8EDB7", letterSpacing: 1 },
  brandTag: { fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 2.6, color: "#CDB9C8", marginTop: 2 },
  card: { width: "100%", maxWidth: 430, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 24, borderRadius: 28, borderWidth: 1, borderColor: "rgba(230,205,223,.28)", backgroundColor: "rgba(255,245,252,.075)" },
  title: { fontFamily: fonts.title, fontSize: 28, color: "#F8EDDE", textAlign: "center", marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: "#C8B7C4", textAlign: "center", marginBottom: 24 },
  emailDestaque: { fontFamily: fonts.bodySemiBold, color: "#F4E8A9" },
  buttonTouch: { width: "100%", borderRadius: 25, overflow: "hidden" },
  button: { height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,230,250,.7)" },
  buttonText: { fontFamily: fonts.bodySemiBold, color: "#FFF7FC", fontSize: 16 },
  resendButton: { alignSelf: "center", paddingTop: 20, paddingHorizontal: 12 },
  link: { fontFamily: fonts.bodyMedium, color: "#C99BE9", textAlign: "center", textDecorationLine: "underline", fontSize: 14 },
});
