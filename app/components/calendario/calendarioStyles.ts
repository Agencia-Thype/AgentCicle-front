import { StyleSheet } from "react-native";
import { palette, radius } from "../../theme/colors";

export const calendarioStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(43, 27, 68, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: palette.white,
    padding: 20,
    borderRadius: radius.xl,
    width: "90%",
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: palette.glassBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  // Sete colunas exatas: cada dia cai sob o seu dia da semana.
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "bold",
    color: palette.textSecondary,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: palette.textPrimary,
    fontWeight: "bold",
  },
  diaSelecionado: {
    backgroundColor: palette.purple,
  },
  diaHoje: {
    borderColor: palette.purple,
    borderWidth: 1.5,
  },
  diaMenstruacao: {
    borderWidth: 2,
    borderColor: "#E08D8D",
    borderStyle: "dotted",
  },
  diaFolicular: {
    backgroundColor: palette.sageLight,
  },
  diaOvulatoria: {
    backgroundColor: palette.gold,
  },
  diaLutea: {
    backgroundColor: palette.purpleLight,
  },
});