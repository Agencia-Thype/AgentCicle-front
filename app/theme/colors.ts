/**
 * Identidade visual do Cíclica.
 *
 * Direção: editorial e natural — não "app feminino lilás". A base é roxo
 * profundo sobre off-white quente, com verde floresta como segunda cor
 * institucional. Lavanda e verde folha são acentos: aparecem em estados do
 * ciclo, gráficos, badges e microinterações, nunca cobrindo a tela.
 *
 * Regra de uso: tons fechados carregam a marca; tons claros são respiro.
 */

// ---------------------------------------------------------------------------
// Cores da marca
// ---------------------------------------------------------------------------

export const brand = {
  /** Roxo profundo — cor principal da marca. */
  plumDeep: "#38233E",
  /** Ameixa — ação, superfícies escuras. */
  plum: "#56355C",
  /** Lavanda — acento claro. */
  lavender: "#B79AC5",
  /** Lilás suave — fundo de respiro. */
  lilac: "#E9DFF0",

  /** Verde floresta — segunda cor institucional. */
  forest: "#274C3B",
  /** Verde oliva. */
  olive: "#728E45",
  /** Verde folha — acento vivo, usar com parcimônia. */
  leaf: "#A8BF5A",
  /** Verde névoa — fundo de respiro. */
  mist: "#E7ECD9",

  /** Off-white quente — fundo padrão do app. */
  offWhite: "#F7F4EF",
  /** Grafite — texto. */
  graphite: "#242127",
} as const;

/**
 * Tom de apoio, fora da paleta institucional. Existe porque conquistas e
 * troféus precisam de um calor que nenhum dos verdes ou roxos entrega. É um
 * bronze dessaturado, escolhido para não brigar com o off-white nem com o
 * verde floresta. Usar só em gamificação.
 */
const bronze = "#8C6E4A";

// ---------------------------------------------------------------------------
// Paleta da interface
// ---------------------------------------------------------------------------

export const palette = {
  // Fundos — off-white quente, com variação quase imperceptível.
  bgDeep: brand.offWhite,
  bgMid: "#F4F1E9",
  bgSoft: "#EFEBE1",

  // Superfícies escuras da marca.
  ink: brand.plumDeep,
  inkSoft: brand.plum,

  // Roxo — ação principal.
  purple: brand.plum,
  purpleLight: brand.lavender,
  purpleDark: brand.plumDeep,

  // Verde — segunda cor institucional, progresso e sucesso.
  sage: brand.olive,
  sageLight: brand.leaf,
  sageDark: brand.forest,

  // Gamificação.
  gold: bronze,
  goldDark: "#6F5638",

  // Texto sobre fundo claro.
  textPrimary: brand.graphite,
  textSecondary: "#5B5560",
  textMuted: "rgba(36, 33, 39, 0.48)",
  /** Texto sobre superfícies escuras (card herói, botões cheios). */
  textOnDark: "#F7F4EF",
  textOnDarkMuted: "rgba(247, 244, 239, 0.72)",

  // Superfícies de card sobre o off-white.
  glass: "#FFFDFA",
  glassStrong: "#F1EDE4",
  glassBorder: "#E4DED2",
  /** Fio de contorno sobre superfície escura. */
  borderOnDark: "rgba(247, 244, 239, 0.16)",

  // Respiro colorido.
  lilac: brand.lilac,
  mist: brand.mist,

  // Estados.
  error: "#A8443C",
  success: brand.olive,
  warning: bronze,

  white: "#FFFFFF",
  black: "#000000",
} as const;

// ---------------------------------------------------------------------------
// Fases do ciclo
// ---------------------------------------------------------------------------

export type FaseCiclo = "Menstruação" | "Folicular" | "Ovulatória" | "Lútea";

export type IdentidadeFase = {
  /** Cor sólida: ícone, linha do tempo, ponto no gráfico. */
  cor: string;
  /** Fundo de respiro para badges e manchas suaves. */
  tint: string;
  /** Gradiente do card herói. */
  gradiente: [string, string];
  /** Leitura curta do corpo naquela fase. */
  energia: string;
  humor: string;
  treino: string;
};

/**
 * Cada fase tem cor própria, mas ela não toma a tela: entra no gráfico, no
 * ícone, na linha do tempo e em manchas suaves. O app segue premium mesmo
 * quando a fase muda.
 */
export const fases: Record<FaseCiclo, IdentidadeFase> = {
  Menstruação: {
    cor: brand.plum,
    tint: brand.lilac,
    gradiente: [brand.plumDeep, brand.plum],
    energia: "Baixa",
    humor: "Introspectivo",
    treino: "Mobilidade / leveza",
  },
  Folicular: {
    cor: brand.leaf,
    tint: brand.mist,
    gradiente: [brand.forest, "#3A6B50"],
    energia: "Crescente",
    humor: "Otimista",
    treino: "Cardio / novos estímulos",
  },
  Ovulatória: {
    cor: brand.lavender,
    tint: brand.lilac,
    gradiente: [brand.plumDeep, brand.plum],
    energia: "Alta",
    humor: "Confiante",
    treino: "Força / intensidade",
  },
  Lútea: {
    cor: brand.forest,
    tint: brand.mist,
    gradiente: ["#22402F", brand.forest],
    energia: "Decrescente",
    humor: "Sensível",
    treino: "Resistência moderada",
  },
};

/** Fallback seguro enquanto a fase ainda não carregou. */
export const faseNeutra: IdentidadeFase = {
  cor: brand.lavender,
  tint: brand.lilac,
  gradiente: [brand.plumDeep, brand.plum],
  energia: "—",
  humor: "—",
  treino: "—",
};

export function identidadeDaFase(fase?: string | null): IdentidadeFase {
  if (!fase) return faseNeutra;
  return fases[fase as FaseCiclo] ?? faseNeutra;
}

// ---------------------------------------------------------------------------
// Escalas
// ---------------------------------------------------------------------------

export const gradientBackground: [string, string, ...string[]] = [
  palette.bgDeep,
  palette.bgMid,
  palette.bgSoft,
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  /** Cantos generosos do card herói — o que dá o ar editorial. */
  xxl: 36,
  pill: 999,
} as const;

/** Sombras discretas: elevação quase imperceptível, nunca "material". */
export const elevation = {
  card: {
    shadowColor: brand.plumDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  hero: {
    shadowColor: brand.plumDeep,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;

// ---------------------------------------------------------------------------
// Compatibilidade com o formato antigo (themeColors), usado em várias telas.
// ---------------------------------------------------------------------------

export const themeColors = {
  gradient: gradientBackground,
  background: palette.bgDeep,
  button: palette.purple,
  buttonSecondary: palette.sageDark,
  buttonText: palette.textOnDark,
  inputBackground: palette.glass,
  inputBorder: palette.glassBorder,
  inputText: palette.textPrimary,
  text: palette.textPrimary,
  textTitle: palette.purpleDark,
  textDark: palette.textPrimary,
  accent: palette.sage,
  accentYellow: palette.gold,
  lilac: palette.lilac,
  purple: palette.purple,
  violet: palette.purpleLight,
  darkPurple: palette.purpleDark,
  card: palette.glass,
  cardBorder: palette.glassBorder,
  error: palette.error,
};
