import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { brand, gradientBackground, palette } from "../theme/colors";
import { MarcaDaguaOrganica } from "./FormaOrganica";

interface Props {
  children: React.ReactNode;
  style?: object;
  /**
   * `light` é o fundo padrão: off-white quente, quase editorial.
   * `dark` é a superfície de marca — roxo profundo com a forma orgânica ao
   * fundo. Usada em telas de entrada, onde a marca precisa aparecer inteira.
   */
  variant?: "light" | "dark" | "purple";
}

export default function AppBackground({
  children,
  style,
  variant = "light",
}: Props) {
  // "purple" é o nome antigo da variante escura; mantido para não quebrar telas.
  const escuro = variant === "dark" || variant === "purple";

  if (escuro) {
    return (
      <LinearGradient
        colors={[brand.plumDeep, brand.plum, brand.plumDeep]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.background, style]}
      >
        {/* Textura orgânica: presença de marca sem virar ilustração. */}
        <MarcaDaguaOrganica
          color={palette.textOnDark}
          style={styles.marcaTopo}
        />
        <MarcaDaguaOrganica
          color={brand.lavender}
          style={styles.marcaBase}
        />

        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientBackground}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.background, style]}
    >
      {/* Mancha vegetal quase imperceptível, só para o off-white não ficar chapado. */}
      <View pointerEvents="none" style={styles.marcaClara}>
        <MarcaDaguaOrganica color={brand.forest} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  marcaTopo: {
    position: "absolute",
    top: -70,
    right: -80,
  },
  marcaBase: {
    position: "absolute",
    bottom: -110,
    left: -90,
  },
  marcaClara: {
    position: "absolute",
    top: 40,
    right: -120,
    opacity: 0.5,
  },
});
