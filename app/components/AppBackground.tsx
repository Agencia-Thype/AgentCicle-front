import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: object;
}

export default function AppBackground({ children, style }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/bg-roxo.png")}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
