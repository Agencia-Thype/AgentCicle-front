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
    paddingHorizontal: 4,
    gap: 6,
  },
  diaBox: {
    width: 42,
    height: 42,
    margin: 6,
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  diaTexto: {
    fontSize: 16,
    color: "#5C3B3B",
    fontWeight: "bold",
  },
});
