import { StyleSheet } from "react-native";

export const calendarioStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFF0F0",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxHeight: "70%",
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
    color: "#5C3B3B",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  dayBox: {
    width: 36,
    height: 36,
    marginVertical: 6,
    borderRadius: 18,
    backgroundColor: "#F9E6E6",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#5C3B3B",
    fontWeight: "bold",
  },
  dayBoxPlaceholder: {
    width: 36,
    height: 36,
    marginVertical: 6,
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  diaSelecionado: {
    backgroundColor: "#91766E",
  },
  diaHoje: {
    borderColor: "#5C3B3B",
    borderWidth: 1.5,
  },
  diaMenstruacao: {
    borderWidth: 2,
    borderColor: "#D9534F",
    borderStyle: "dotted",
  },
  diaFolicular: {
    backgroundColor: "#A7D7C5",
  },
  diaOvulatoria: {
    backgroundColor: "#F4C06D",
  },
  diaLutea: {
    backgroundColor: "#D6B0C4",
  },
});