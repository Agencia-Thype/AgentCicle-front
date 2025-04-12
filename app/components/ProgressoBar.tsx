import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
  step: number; // de 1 a 4
}

export function ProgressBar({ step }: Props) {
  const etapas = [
    { label: "Perfil", icon: "person", lib: "material" },
    { label: "Ciclo", icon: "calendar-today", lib: "material" },
    { label: "Treino", icon: "dumbbell", lib: "fontawesome" },
    { label: "Sentimentos", icon: "smile", lib: "fontawesome" },
  ];

  const porcentagem = (step / etapas.length) * 100;

  // Valor animado
  const progress = useRef(new Animated.Value(0)).current;

  // Atualiza animação toda vez que step muda
  useEffect(() => {
    Animated.timing(progress, {
      toValue: porcentagem,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [porcentagem]);

  // Convertendo o valor animado para estilo de width
  const animatedWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.iconsContainer}>
        {etapas.map((etapa, index) => {
          const isActive = step >= index + 1;
          const color = isActive ? "#A56C6C" : "#D3B8B8";

          return (
            <View key={index} style={styles.item}>
              {etapa.lib === "fontawesome" ? (
                <FontAwesome5 name={etapa.icon as any} size={20} color={color} />
              ) : (
                <MaterialIcons name={etapa.icon as any} size={24} color={color} />
              )}
              <Text style={[styles.label, { color }]}>{etapa.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Barra de fundo */}
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animatedWidth,
            },
          ]}
        />
      </View>

      {/* Porcentagem */}
      <Text style={styles.percentText}>
        Progresso: {porcentagem.toFixed(0)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
  barBackground: {
    height: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: "#A56C6C",
    borderRadius: 10,
  },
  percentText: {
    marginTop: 6,
    fontSize: 12,
    color: "#5C3B3B",
    textAlign: "right",
    fontWeight: "500",
  },
});
