import React, { useRef, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import AppBackground from "../../components/AppBackground";

type Props = NativeStackScreenProps<RootStackParamList, "ValidarEmail">;

export default function ValidarEmailScreen({ navigation }: Props) {
  const logoRef = useRef(null);
  const nav = useNavigation();
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [codigo, setCodigo] = useState("");
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    const unsubscribe = nav.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => { unsubscribe(); nav.dispatch(e.data.action); });
      } else { nav.dispatch(e.data.action); }
    });
    return unsubscribe;
  }, [nav]);

  const handleValidarEmail = async () => {
    if (!codigo) return Toast.show({ type: "error", text1: "Código obrigatório" });
    try {
      await axios.post("http://10.0.2.2:8000/validar-email", { email, codigo });
      Toast.show({ type: "success", text1: "E-mail validado com sucesso!" });
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => navigation.navigate("Login"));
      } else navigation.navigate("Login");
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Erro", text2: error.response?.data?.detail || "Erro ao validar e-mail." });
    }
  };

  const handleReenviarCodigo = async () => {
    setReenviando(true);
    try {
      await axios.post("http://10.0.2.2:8000/enviar-codigo", { email });
      Toast.show({ type: "success", text1: "Código reenviado" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Erro ao reenviar" });
    } finally {
      setTimeout(() => setReenviando(false), 3000);
    }
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <Animatable.Image ref={logoRef} animation="fadeInDown" duration={1000} source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Validar E-mail</Text>
        <Text style={styles.subtitle}>
          Digite o código enviado para:{"\n"}
          <Text style={{ fontWeight: "bold", color: "#FFFAC3" }}>{email}</Text>
        </Text>
        <TextInput style={styles.input} placeholder="Código de verificação" placeholderTextColor="rgba(238,208,252,0.6)" keyboardType="numeric" value={codigo} onChangeText={setCodigo} />
        <TouchableOpacity style={styles.button} onPress={handleValidarEmail}>
          <Text style={styles.buttonText}>Validar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReenviarCodigo} disabled={reenviando}>
          <Text style={styles.link}>{reenviando ? "Reenviando..." : "Reenviar código"}</Text>
        </TouchableOpacity>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "bold", color: "#FFFAC3", textAlign: "center", marginBottom: 8, fontFamily: "LobsterTwo_700Bold" },
  subtitle: { fontSize: 14, color: "#EED0FC", textAlign: "center", marginBottom: 24 },
  input: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 14, color: "#EED0FC", borderWidth: 1, borderColor: "rgba(146,96,206,0.6)" },
  button: { backgroundColor: "#9260CE", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 8, marginBottom: 16, shadowColor: "#9260CE", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { color: "#EED0FC", textAlign: "center", marginTop: 12, textDecorationLine: "underline" },
});
