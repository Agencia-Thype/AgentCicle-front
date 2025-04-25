import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Image } from "react-native";
import { api } from "app/services/api";

interface Props {
  userName: string;
  onAbrirAssistente: () => void;
  mostrarAssistente?: boolean;
}

export default function FloatingLuniaCoach({ userName, onAbrirAssistente, mostrarAssistente }: Props) {
  const [mensagem, setMensagem] = useState("");
  const [visivel, setVisivel] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const nomeFormatado = userName?.toLowerCase() || "miga";

  useEffect(() => {
    const exibirMensagem = async () => {
      try {
        const res = await api.get("/ia/mensagem-entrada?tipo=balao");
        let msg = res.data?.resposta || "Oi, miga! 🌸";
        msg = msg.replace("{nome}", nomeFormatado);

        setMensagem(msg);
        setVisivel(true);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start();

        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setVisivel(false));
        }, 6000);
      } catch (err) {
        console.error("Erro ao buscar balão da IA", err);
      }
    };

    const intervalo = setInterval(() => {
      if (!mostrarAssistente) exibirMensagem();
    }, 180000);

    if (!mostrarAssistente) exibirMensagem();

    return () => clearInterval(intervalo);
  }, [mostrarAssistente, nomeFormatado]);

  if (mostrarAssistente) return null;

  return (
    <View style={styles.wrapper}>
      {visivel && (
        <Animated.View style={[styles.balaoWrapper, { opacity: fadeAnim }]}>
          <View style={styles.balao}>
            <Text style={styles.texto}>{mensagem}</Text>
            <View style={styles.triangulo} />
          </View>
        </Animated.View>
      )}

      <TouchableOpacity onPress={onAbrirAssistente} style={styles.botao}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "column",
    alignItems: "flex-end",
    zIndex: 9999,
    maxWidth: 300,
  },
  balaoWrapper: {
    marginRight: 8,
  },
  balao: {
    backgroundColor: "#FFF0F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: "relative",
  },
  texto: {
    fontSize: 14,
    color: "#5C3B3B",
    fontStyle: "italic",
    textAlign: "left",
    lineHeight: 20,
  },
  triangulo: {
    position: "absolute",
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFF0F5",
  },
  botao: {
    backgroundColor: "transparent",
    borderRadius: 100,
    padding: 4,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
});
