import React from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { fonts } from "../theme/fonts";
import { radius } from "../theme/colors";

type Props = {
  message: string;
  type: "success" | "error";
};

/**
 * Toast animado.
 *
 * Os estilos ficam aqui: antes o componente lia `perfilStyles.toast` e
 * `perfilStyles.toastText`, que não existem naquele arquivo — o componente
 * quebraria ao ser montado.
 */
export const AnimatedToast = ({ message, type }: Props) => {
  return (
    <Animatable.View
      animation="fadeInDown"
      duration={500}
      style={[
        styles.toast,
        { backgroundColor: type === "success" ? "#A5D6A7" : "#EF9A9A" },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: "#2B1B44",
    textAlign: "center",
  },
});
