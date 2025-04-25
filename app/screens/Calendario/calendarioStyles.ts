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
    color: "#5C3B3B",
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
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  diaTexto: {
    fontSize: 16,
    color: "#5C3B3B",
    fontWeight: "bold",
  },

  // 🌑 Menstruação
  diaMenstruacao: {
    borderWidth: 2,
    borderColor: "#D9534F",
    borderStyle: "dotted",
    backgroundColor: "#FFF5F5",
  },

  // 🌒 Folicular
  diaFolicular: {
    backgroundColor: "#A7D7C5",
  },

  // 🌕 Ovulatória
  diaOvulatoria: {
    backgroundColor: "#F4C06D",
  },

  // 🌘 Lútea
  diaLutea: {
    backgroundColor: "#D6B0C4",
  },

  // 📍 Hoje
  diaHoje: {
    borderWidth: 2,
    borderColor: "#5C3B3B",
  },
});
