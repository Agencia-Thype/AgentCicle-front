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
  // Mesmas cores da tela de Ciclo (screens/Calendario/calendarioStyles.ts).
  diaMenstruacao: {
    borderWidth: 2,
    borderColor: palette.error,
    borderStyle: "dotted",
    backgroundColor: "rgba(214, 69, 63, 0.15)",
  },
  diaFolicular: {
    backgroundColor: "rgba(143, 191, 110, 0.3)",
    borderColor: palette.sageLight,
    borderWidth: 1,
  },
  // Folicular antes da janela fértil: verde mais claro que o da janela fértil.
  diaFolicularClara: {
    backgroundColor: "rgba(143, 191, 110, 0.12)",
    borderColor: "rgba(143, 191, 110, 0.5)",
    borderWidth: 1,
  },
  diaOvulatoria: {
    backgroundColor: "rgba(201, 146, 46, 0.25)",
    borderColor: palette.gold,
    borderWidth: 1,
  },
  diaLutea: {
    backgroundColor: "rgba(43, 27, 68, 0.3)",
    borderColor: palette.textSecondary,
    borderWidth: 1,
  },
  legenda: {
    marginTop: 12,
  },
});
