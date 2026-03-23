import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { globalStyles } from "../../theme/global";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import AppBackground from "../../components/AppBackground";

type Props = NativeStackScreenProps<RootStackParamList, "ValidarCodigo">;

export default function ValidarCodigoScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(true);

  const logoRef = useRef(null);
  const nav = useNavigation();

  useEffect(() => {
    const unsubscribe = nav.addListener("beforeRemove", (e) => {
      e.preventDefault();
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          unsubscribe();
          nav.dispatch(e.data.action);
        });
      } else {
        nav.dispatch(e.data.action);
      }
    });
    return unsubscribe;
  }, [nav]);

  const handleRedefinirSenha = async () => {
    if (novaSenha.length < 6) {
      return Toast.show({ type: "error", text1: "Senha muito curta", text2: "Mínimo 6 caracteres." });
    }
    if (novaSenha !== confirmacaoSenha) {
      return Toast.show({ type: "error", text1: "Senhas não coincidem" });
    }
    try {
      const response = await axios.post("http://10.0.2.2:8000/redefinir-senha", {
        email, codigo, nova_senha: novaSenha, confirmacao_senha: confirmacaoSenha,
      });
      if (response.data?.access_token) {
        await AsyncStorage.setItem("auth_token", response.data.access_token);
        await AsyncStorage.setItem("primeiro_acesso", "true");
      }
      Toast.show({ type: "success", text1: "Senha redefinida com sucesso!" });
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          isPrimeiroAcesso ? navigation.reset({ index: 0, routes: [{ name: "Perfil" }] }) : navigation.navigate("Login");
        });
      } else {
        isPrimeiroAcesso ? navigation.reset({ index: 0, routes: [{ name: "Perfil" }] }) : navigation.navigate("Login");
      }
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Erro", text2: error.response?.data?.detail || "Erro ao redefinir senha." });
    }
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <Animatable.Image
          ref={logoRef}
          animation="fadeInDown"
          duration={1000}
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Validar Código</Text>
        <Text style={styles.subtitle}>Digite o código enviado para seu e-mail e escolha sua nova senha</Text>
        <TextInput style={styles.input} placeholder="Código" placeholderTextColor="rgba(238,208,252,0.6)" value={codigo} onChangeText={setCodigo} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Nova senha" placeholderTextColor="rgba(238,208,252,0.6)" secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />
        <TextInput style={styles.input} placeholder="Confirmar nova senha" placeholderTextColor="rgba(238,208,252,0.6)" secureTextEntry value={confirmacaoSenha} onChangeText={setConfirmacaoSenha} />
        <TouchableOpacity style={styles.button} onPress={handleRedefinirSenha}>
          <Text style={styles.buttonText}>Redefinir senha</Text>
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
