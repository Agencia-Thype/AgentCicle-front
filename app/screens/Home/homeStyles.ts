import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },

  dataTexto: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5B4A44",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "capitalize",
  },

  saudacao: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5B4A44",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitulo: {
    fontSize: 16,
    color: "#7E6464",
    textAlign: "center",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#F9F5F2",
    padding: 20,
    borderRadius: 16,
    marginVertical: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  faseTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#5B4A44",
  },

  faseNome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7D4F4F",
    marginBottom: 2,
  },

  faseMensagem: {
    fontSize: 16,
    color: "#915858",
  },

  treinoTexto: {
    fontSize: 16,
    marginBottom: 12,
    color: "#5B4A44",
    textAlign: "center",
  },

  progressoContainer: {
    marginTop: 16,
    marginBottom: 16,
    width: "100%",
  },

  progressoTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5C3B3B",
    marginBottom: 8,
  },

  barraContainer: {
    height: 14,
    width: "100%",
    backgroundColor: "#EDE5E1",
    borderRadius: 8,
    overflow: "hidden",
  },

  barraProgresso: {
    height: "100%",
    borderRadius: 8,
  },

  progressoPorcentagem: {
    marginTop: 4,
    fontSize: 14,
    color: "#5C3B3B",
    textAlign: "right",
  },

  addButton: {
    backgroundColor: "#91766E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    elevation: 2,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  
  modalMenu: {
    backgroundColor: "#fff",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#5C3B3B",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "85%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#5B4A44",
  },

  symptomItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F5E7E7",
    borderRadius: 10,
    marginVertical: 6,
  },

  selectedSymptom: {
    backgroundColor: "#C8A19C",
  },

  symptomText: {
    fontSize: 16,
    color: "#5B4A44",
  },

  modalButton: {
    backgroundColor: "#91766E",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },

  modalButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  trofeuContainer: {
    marginTop: 16,
    alignItems: "center",
  },

  trofeuImagem: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },

  trofeuTexto: {
    marginTop: 4,
    fontSize: 14,
    color: "#5B4A44",
    fontWeight: "600",
  },
  moedaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  moedaTexto: {
    color: "#5C3B3B",
    fontSize: 16,
    fontWeight: "600",
  },
});
