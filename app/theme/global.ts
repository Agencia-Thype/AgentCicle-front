// globalStyles.ts
import { StyleSheet } from "react-native";

export const gradientColors = ["#C471ED", "#F64F59", "#12c2e9"]; // sua paleta misturada 💜💖💙

export const globalStyles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#931b9a", // roxo profundo que se destaca no topo
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    height: 48,
    borderColor: '#dca6e3',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
  backgroundColor: '#D363B3',
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
},
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    color: "#fff",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  registerLink: {
    marginTop: 24,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  passwordHint: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});
