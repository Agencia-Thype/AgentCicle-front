import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import axios from "axios";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { globalStyles } from "../../theme/global";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "ValidarCodigo">;

export default function ValidarCodigoScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

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
      return Toast.show({
        type: "error",
        text1: "Senha muito curta",
        text2: "A senha precisa ter no mínimo 6 caracteres.",
      });
    }

    if (novaSenha !== confirmacaoSenha) {
      return Toast.show({
        type: "error",
        text1: "Senhas não coincidem",
        text2: "Verifique a confirmação da senha.",
      });
    }

    try {
      await axios.post("http://10.0.2.2:8000/redefinir-senha", {
        email,
        codigo,
        nova_senha: novaSenha,
        confirmacao_senha: confirmacaoSenha,
      });

      Toast.show({
        type: "success",
        text1: "Senha redefinida com sucesso!",
      });

      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          navigation.navigate("Login");
        });
      } else {
        navigation.navigate("Login");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: error.response?.data?.detail || "Erro ao redefinir senha.",
      });
    }
  };

  return (
    <LinearGradient
      colors={["#FFD7D7", "#F3B6B6", "#E0A2A2", "#C38888", "#A56C6C"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <Animatable.Image
        ref={logoRef}
        animation="fadeInDown"
        duration={1000}
        source={require("../../assets/logo.png")}
        style={{
          width: 100,
          height: 100,
          alignSelf: "center",
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        resizeMode="contain"
      />

      <Text style={globalStyles.title}>Validar Código</Text>
      <Text style={globalStyles.subtitle}>
        Digite o código que foi enviado para seu e-mail e escolha sua nova senha
      </Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Código"
        value={codigo}
        onChangeText={setCodigo}
        keyboardType="numeric"
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Nova senha"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Confirmar nova senha"
        secureTextEntry
        value={confirmacaoSenha}
        onChangeText={setConfirmacaoSenha}
      />

      <TouchableOpacity
        style={globalStyles.button}
        onPress={handleRedefinirSenha}
      >
        <Text style={globalStyles.buttonText}>Redefinir senha</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
