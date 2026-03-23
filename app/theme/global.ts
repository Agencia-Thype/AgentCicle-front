import { StyleSheet, Platform } from "react-native";

export const themeColors = {
  gradient: [
    "#1A0733",
    "#3F1C65",
    "#9260CE",
    "#EED0FC",
  ] as [string, string, ...string[]],
  background: "#1A0733",
  button: "#9260CE",
  buttonSecondary: "#A4D562",
  buttonText: "#FFFFFF",
  inputBackground: "rgba(255, 255, 255, 0.12)",
  inputBorder: "#9260CE",
  inputText: "#EED0FC",
  text: "#EED0FC",
  textTitle: "#FFFAC3",
  textDark: "#1A0733",
  accent: "#A4D562",
  accentYellow: "#FFFAC3",
  lilac: "#EED0FC",
  purple: "#9260CE",
  violet: "#3F1C65",
  darkPurple: "#1A0733",
  card: "rgba(63, 28, 101, 0.7)",
  cardBorder: "rgba(146, 96, 206, 0.4)",
  error: "#ff6b6b",
};

export const globalStyles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "space-around",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 150,
    height: 130,
    alignSelf: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 22 : 20,
    fontWeight: "bold",
    color: themeColors.textTitle,
    textAlign: "center",
    marginBottom: 24,
  },

  subtitle: {
    fontSize: Platform.OS === "ios" ? 16 : 14,
    color: themeColors.text,
    textAlign: "center",
    marginBottom: 16,
  },

  input: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    color: "#EED0FC",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(146, 96, 206, 0.5)",
  },

  inputError: {
    borderWidth: 1.5,
    borderColor: themeColors.error,
  },

  button: {
    backgroundColor: themeColors.button,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    shadowColor: "#9260CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 8,
  },

  buttonText: {
    color: themeColors.buttonText,
    fontWeight: "bold",
    fontSize: 18,
  },

  link: {
    color: "#EED0FC",
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },

  registerLink: {
    color: "#FFFAC3",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
  },

  passwordHint: {
    fontSize: 13,
    color: "#EED0FC",
    marginBottom: 8,
    marginLeft: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
