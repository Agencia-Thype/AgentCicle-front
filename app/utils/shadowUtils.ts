import { Platform } from "react-native";

/**
 * Utilitário para criar sombras consistentes entre iOS e Android
 * @param elevation Nível de elevação (1-24)
 * @returns Objeto de estilo com sombras adequadas para ambas plataformas
 */
export const createShadow = (elevation: number) => {
  return Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: elevation === 1 ? 1 : elevation === 2 ? 1.5 : elevation / 2,
        },
        shadowOpacity: elevation * 0.05,
        shadowRadius: elevation === 1 ? 2.5 : elevation === 2 ? 3 : elevation,
      }
    : {
        elevation,
      };
};
