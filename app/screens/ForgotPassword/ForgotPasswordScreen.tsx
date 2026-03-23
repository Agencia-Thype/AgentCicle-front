import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import AppBackground from "../../components/AppBackground";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
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
    try {
      await axios.post("http://10.0.2.2:8000/enviar-codigo", { email });
      Toast.show({ type: "success", text1: "Sucesso", text2: "Código enviado para seu e-mail." });
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => navigation.navigate("ValidarCodigo", { email }));
      } else navigation.navigate("ValidarCodigo", { email });
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Erro", text2: error.response?.data?.detail || "Erro ao enviar código." });
    }
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <Animatable.Image ref={logoRef} animation="fadeInDown" duration={1000} source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>Informe seu e-mail para enviarmos o código de verificação</Text>
        <TextInput style={styles.input} placeholder="Seu e-mail" placeholderTextColor="rgba(238,208,252,0.6)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Enviar código</Text>
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
  button: { backgroundColor: "#9260CE", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 8, shadowColor: "#9260CE", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
