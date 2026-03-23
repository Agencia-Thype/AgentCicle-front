import { StyleSheet, Platform } from "react-native";

export const homeStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 8,
    zIndex: 1001,
    position: "relative",
    backgroundColor: "transparent",
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
  },

  dataTexto: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EED0FC",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "capitalize",
  },

  saudacao: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFAC3",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitulo: {
    fontSize: 16,
    color: "#EED0FC",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(63, 28, 101, 0.75)",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  faseMensagem: {
    fontSize: 16,
    color: "#EED0FC",
  },

  treinoTexto: {
    fontSize: 16,
    marginBottom: 12,
    color: "#FFFAC3",
    textAlign: "center",
    fontWeight: "600",
  },

  progressoContainer: {
    marginTop: 16,
    marginBottom: 16,
    width: "100%",
  },

  progressoTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFAC3",
    marginBottom: 8,
  },

  barraContainer: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 6,
    position: "relative",
  },

  barraProgresso: {
    height: "100%",
    borderRadius: 8,
  },

  progressoPorcentagem: {
    marginTop: 4,
    fontSize: 14,
    color: "#EED0FC",
    textAlign: "right",
  },
  addButton: {
    backgroundColor: "#9260CE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 4,
    shadowColor: "#9260CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10000,
  },

  modalMenu: {
    backgroundColor: "#3F1C65",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 50 : 40,
    borderTopWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
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
    color: "#EED0FC",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#3F1C65",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.4)",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#FFFAC3",
  },

  symptomItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(146, 96, 206, 0.3)",
    borderRadius: 10,
    marginVertical: 6,
  },

  selectedSymptom: {
    backgroundColor: "#9260CE",
  },

  symptomText: {
    fontSize: 16,
    color: "#EED0FC",
  },

  modalButton: {
    backgroundColor: "#9260CE",
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
    color: "#FFFAC3",
    fontWeight: "600",
  },
  moedaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  moedaTexto: {
    color: "#FFFAC3",
    fontSize: 16,
    fontWeight: "600",
  },
  faseResumo: {
    fontSize: 14,
    color: "#EED0FC",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  botaoSaibaMais: {
    marginTop: 10,
    alignSelf: "center",
  },

  textoSaibaMais: {
    color: "#FFFAC3",
    textDecorationLine: "underline",
    fontWeight: "500",
    fontSize: 14,
  },
  faseTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFAC3",
    marginBottom: 4,
    textAlign: "left",
  },

  faseNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B1D686",
    textAlign: "center",
  },

  faseDescricao: {
    fontSize: 14,
    color: "#EED0FC",
    lineHeight: 22,
    textAlign: "justify",
    fontWeight: "bold",
    padding: 6,
    borderRadius: 8,
  },

  saibaMaisContainer: {
    alignItems: "flex-end",
  },

  saibaMaisBotao: {
    alignSelf: "flex-end",
    marginTop: 8,
    backgroundColor: "#9260CE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saibaMaisTexto: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },

  recarregarBotao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    alignSelf: "center",
    padding: 6,
  },

  recarregarTexto: {
    color: "#EED0FC",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
});
