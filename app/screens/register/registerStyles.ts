// app/screens/register/registerStyles.ts
import { StyleSheet } from "react-native";

export const registerStyles = StyleSheet.create({
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputSenha: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  iconEye: {
    marginLeft: 8,
  },
});
