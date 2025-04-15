import { StyleSheet } from "react-native";

export const faseCompletaStyles = StyleSheet.create({
  faseTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5C3B3B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  faseNome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7EAA92",
    textAlign: "center",
    marginBottom: 16,
  },
  faseDescricao: {
    fontSize: 15,
    color: "#5C3B3B",
    lineHeight: 22,
    textAlign: "justify",
    marginBottom: 16,
   
    padding: 16,
    borderRadius: 12,
  },
  subtitulo: {
    fontSize: 16,
    color: "#5C3B3B",
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  respostaContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderColor: "#E5DAD1",
    borderWidth: 1,
    marginTop: 24,
  },
  respostaTexto: {
    fontSize: 15,
    color: "#5C3B3B",
    lineHeight: 22,
    textAlign: "justify",
  },
});
