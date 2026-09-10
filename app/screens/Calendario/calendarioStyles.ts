import { StyleSheet } from "react-native";
import { palette } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

export const calendarioStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: palette.gold,
    fontFamily: fonts.title,
  },
  grid: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  diaBox: {
    width: 40,
    height: 40,
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "rgba(130, 87, 219, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(130, 87, 219, 0.3)",
  },
  diaTexto: {
    fontSize: 16,
    color: palette.textSecondary,
    fontWeight: "bold",
  },
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
  diaHoje: {
    borderWidth: 2,
    borderColor: palette.gold,
  },
});
