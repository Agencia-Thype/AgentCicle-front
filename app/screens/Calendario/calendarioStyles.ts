import { StyleSheet } from "react-native";

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
    color: "#FFFAC3",
    fontFamily: "LobsterTwo_700Bold",
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
    backgroundColor: "rgba(63, 28, 101, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.3)",
  },
  diaTexto: {
    fontSize: 16,
    color: "#EED0FC",
    fontWeight: "bold",
  },
  diaMenstruacao: {
    borderWidth: 2,
    borderColor: "#ff6b6b",
    borderStyle: "dotted",
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  diaFolicular: {
    backgroundColor: "rgba(177, 214, 134, 0.4)",
    borderColor: "#B1D686",
    borderWidth: 1,
  },
  diaOvulatoria: {
    backgroundColor: "rgba(255, 250, 195, 0.4)",
    borderColor: "#FFFAC3",
    borderWidth: 1,
  },
  diaLutea: {
    backgroundColor: "rgba(238, 208, 252, 0.3)",
    borderColor: "#EED0FC",
    borderWidth: 1,
  },
  diaHoje: {
    borderWidth: 2,
    borderColor: "#FFFAC3",
  },
});
