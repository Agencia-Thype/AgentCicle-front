import { StyleSheet, Platform } from "react-native";
import { palette, themeColors, spacing, radius } from "./colors";
import { fonts } from "./fonts";

export { themeColors, palette, spacing, radius };

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
    paddingHorizontal: spacing.lg,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },

  logo: {
    width: 140,
    height: 120,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },

  title: {
    fontFamily: fonts.title,
    fontSize: Platform.OS === "ios" ? 30 : 28,
    lineHeight: Platform.OS === "ios" ? 38 : 36,
    color: palette.purpleDark,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
  },

  subtitle: {
    fontFamily: fonts.body,
    fontSize: Platform.OS === "ios" ? 15 : 14,
    color: palette.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  input: {
    fontFamily: fonts.body,
    backgroundColor: palette.glass,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: spacing.md,
    color: palette.textPrimary,
    width: "100%",
    borderWidth: 1,
    borderColor: palette.glassBorder,
  },

  inputError: {
    borderWidth: 1.5,
    borderColor: palette.error,
  },

  button: {
    backgroundColor: palette.purpleDark,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    width: "100%",
    marginTop: spacing.xs,
  },

  buttonText: {
    fontFamily: fonts.bodyMedium,
    color: palette.textOnDark,
    fontSize: 15,
    letterSpacing: 0.2,
  },

  link: {
    fontFamily: fonts.body,
    color: palette.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },

  registerLink: {
    fontFamily: fonts.bodyMedium,
    color: palette.purple,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  passwordHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: palette.textMuted,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },

  card: {
    backgroundColor: palette.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.glassBorder,
    padding: spacing.md,
    marginVertical: spacing.sm,
    width: "100%",
  },
});
