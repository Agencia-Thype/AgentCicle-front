import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { palette } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

// Mesmas cores dos dias nos calendários (calendarioStyles): a legenda tem de
// ser o retrato do que aparece na grade.
const ITENS = [
  { label: "Menstruação", fundo: "rgba(214, 69, 63, 0.15)", borda: palette.error, pontilhada: true },
  { label: "Folicular", fundo: "rgba(143, 191, 110, 0.12)", borda: "rgba(143, 191, 110, 0.5)" },
  { label: "Fértil", fundo: "rgba(143, 191, 110, 0.3)", borda: palette.sageLight },
  { label: "Ovulação", fundo: "rgba(201, 146, 46, 0.25)", borda: palette.gold },
  { label: "Lútea", fundo: "rgba(43, 27, 68, 0.3)", borda: palette.textSecondary },
];

export default function CalendarioLegenda({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.container, style]}>
      {ITENS.map((item) => (
        <View key={item.label} style={styles.item}>
          <View
            style={[
              styles.ponto,
              { backgroundColor: item.fundo, borderColor: item.borda },
              item.pontilhada && styles.pontilhada,
            ]}
          />
          <Text style={styles.texto}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 34,
    borderRadius: 14,
    backgroundColor: "#F4EDF3",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    paddingVertical: 6,
    rowGap: 4,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 3 },
  ponto: { width: 14, height: 14, borderRadius: 7, borderWidth: 1 },
  pontilhada: { borderWidth: 2, borderStyle: "dotted" },
  texto: { fontFamily: fonts.body, fontSize: 8, color: "#5F566F" },
});
