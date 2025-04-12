import React from "react";
import { Text, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { perfilStyles } from "../screens/Perfil/PerfilStyles";

type Props = {
  message: string;
  type: "success" | "error";
};

export const AnimatedToast = ({ message, type }: Props) => {
  return (
    <Animatable.View
      animation="fadeInDown"
      duration={500}
      style={[
        perfilStyles.toast,
        { backgroundColor: type === "success" ? "#A5D6A7" : "#EF9A9A" },
      ]}
    >
      <Text style={perfilStyles.toastText}>{message}</Text>
    </Animatable.View>
  );
};
