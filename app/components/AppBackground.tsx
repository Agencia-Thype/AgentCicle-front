import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
