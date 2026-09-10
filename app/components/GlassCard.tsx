import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { palette, radius } from "../theme/colors";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}

export default function GlassCard({ children, style, padded = true }: Props) {
  return (
    <View style={[styles.wrapper, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.glassBorder,
    backgroundColor: palette.white,
    shadowColor: palette.purpleDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  padded: {
    padding: 20,
  },
});
