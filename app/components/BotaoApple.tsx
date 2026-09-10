import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import Toast from "react-native-toast-message";
import type { User } from "firebase/auth";

import { appleDisponivel, iniciarLoginApple } from "../services/appleAuth";
import { signInWithAppleCredential } from "../services/authService";
import { palette, radius } from "../theme/colors";

interface BotaoAppleProps {
  onSucesso: (user: User) => void | Promise<void>;
}

/**
 * Botão "Continuar com a Apple".
 *
 * Usa o componente nativo da Apple de propósito: as diretrizes proíbem recriar
 * o botão com estilo próprio. Renderiza null fora do iOS, onde o Sign in with
 * Apple não existe.
 */
export default function BotaoApple({ onSucesso }: BotaoAppleProps) {
  const [disponivel, setDisponivel] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;

    appleDisponivel().then((resultado) => {
      if (ativo) setDisponivel(resultado);
    });

    return () => {
      ativo = false;
    };
  }, []);

  if (!disponivel) {
    return null;
  }

  const entrarComApple = async () => {
    setCarregando(true);

    try {
      const dados = await iniciarLoginApple();

      // null = a usuária fechou a folha da Apple. Não é erro.
      if (!dados) return;

      const user = await signInWithAppleCredential(dados);
      if (user) {
        await onSucesso(user);
      }
    } catch (error) {
      console.error("Erro no login com Apple:", error);
      Toast.show({
        type: "error",
        text1: "Erro no login com Apple",
        text2: "Tente novamente em alguns instantes.",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      {carregando ? (
        <View style={styles.carregando}>
          <ActivityIndicator color={palette.textPrimary} size="small" />
        </View>
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={radius.md}
          style={styles.botao}
          onPress={entrarComApple}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  // Mesma altura do botão do Google: a Apple exige destaque equivalente.
  botao: {
    width: "100%",
    height: 50,
  },
  carregando: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
