/**
 * Tipografia do Cíclica.
 *
 * DM Serif Display carrega a emoção — títulos, nome da fase, frases da marca.
 * DM Sans carrega a função — rótulos, números, botões, corpo de texto.
 *
 * A serifada aparece pouco e grande; a sans faz o resto. É a combinação que
 * marcas de wellness e moda premium usam, e é o que separa "editorial" de
 * "app fofinho".
 *
 * DM Serif Display só existe em Regular por design: o peso vem do tamanho,
 * nunca de negrito sintético. Por isso os três aliases de título apontam para
 * a mesma família.
 */

export const fonts = {
  title: "DMSerifDisplay_400Regular",
  titleSemiBold: "DMSerifDisplay_400Regular",
  titleRegular: "DMSerifDisplay_400Regular",
  /** Itálico da serifada — usar só em citações e frases da marca. */
  titleItalic: "DMSerifDisplay_400Regular_Italic",

  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemiBold: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
};

/**
 * Rótulos em caixa alta com entrelinha aberta — o detalhe que mais "veste" a
 * interface de editorial. Usar em títulos de seção e microrrótulos.
 */
export const overline = {
  fontFamily: fonts.bodyMedium,
  fontSize: 11,
  letterSpacing: 1.4,
  textTransform: "uppercase" as const,
};
