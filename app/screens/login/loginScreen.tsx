import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation";
import { login } from "../../services/authService";
import Toast from "react-native-toast-message";
import { globalStyles } from "../../theme/global";
import { AnimatedLogo } from "../../components/AnimatedLogo";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";


type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

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
      const data = await login(email, senha);

      Toast.show({
        type: "success",
        text1: "Login realizado com sucesso!",
      });

      setTimeout(() => {
        navigation.navigate("Home");
      }, 1000);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro no login",
        text2: "E-mail ou senha inválidos",
      });
      setErroEmail(true);
      setErroSenha(true);
    }
  };

  return (
    <LinearGradient
      colors={["#68d1c9", "#b4f0ec", "#c695da", "#a460bf", "#931b9a"]}
      style={globalStyles.backgroundGradient}
    >
      <AnimatedLogo />

      <Text style={globalStyles.title}>Bem-vinda de volta!</Text>

      <TextInput
        style={[globalStyles.input, erroEmail && styles.inputError]}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErroEmail(false);
        }}
      />

      <View style={[globalStyles.input, styles.passwordContainer, erroSenha && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
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
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={globalStyles.link}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={globalStyles.registerLink}>
          Ainda não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderColor: "#ff4d4d",
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "white",
    marginBottom: 12,
    height: 48,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  passwordInput: {
    flex: 1,
    color: "#333",
  },
});
