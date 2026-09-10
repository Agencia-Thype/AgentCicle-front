import { StyleSheet } from "react-native";

import { elevation, palette, radius, spacing } from "../../theme/colors";
import { fonts, overline } from "../../theme/fonts";

/**
 * Home — painel diário do corpo.
 *
 * Hierarquia editorial: fundo off-white respirando, uma saudação em serifada,
 * um card herói escuro que domina a dobra, e o resto em cards claros e baixos
 * que não competem. A cor da fase entra em pontos pequenos — nunca no fundo.
 */
export const homeStyles = StyleSheet.create({
  // ---------------------------------------------------------------- cabeçalho
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 16,
    minHeight: 78,
  },
  headerAcoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  iconeHeader: {
    padding: 7,
    borderRadius: radius.pill,
  },

  content: {
    paddingHorizontal: 28,
    paddingBottom: 132,
  },

  // ---------------------------------------------------------------- saudação
  saudacaoBloco: {
    display: "none",
  },
  saudacao: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: palette.textSecondary,
    marginBottom: 6,
  },
  perguntaDoDia: {
    fontFamily: fonts.title,
    fontSize: 30,
    lineHeight: 38,
    color: palette.textPrimary,
    letterSpacing: -0.3,
  },

  // -------------------------------------------------------------- card herói
  hero: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(86, 53, 92, 0.12)",
    shadowColor: palette.purpleDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 3,
  },
  heroConteudo: {
    paddingHorizontal: 30,
    paddingVertical: 28,
    minHeight: 350,
    backgroundColor: "rgba(255, 250, 253, 0.84)",
  },
  heroMarcaDagua: {
    position: "absolute",
    right: -86,
    top: -18,
    opacity: 0.1,
  },
  heroOverline: {
    ...overline,
    color: palette.purple,
    marginBottom: 10,
    fontFamily: fonts.title,
    fontSize: 18,
    letterSpacing: 0,
    textTransform: "none",
  },
  heroPontoFase: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
  },
  heroLinhaOverline: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroFase: {
    fontFamily: fonts.title,
    fontSize: 45,
    lineHeight: 54,
    color: palette.sage,
    letterSpacing: -0.8,
  },
  heroMensagem: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: "#766C82",
    marginTop: 6,
    maxWidth: "82%",
  },

  // Régua de leitura do corpo: energia / humor / treino
  heroDivisor: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(86, 53, 92, 0.12)",
    marginVertical: 18,
  },
  heroMetricas: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  heroMetrica: {
    flex: 1,
  },
  heroMetricaRotulo: {
    ...overline,
    fontSize: 10,
    color: "#8B8095",
    marginBottom: 5,
  },
  heroMetricaValor: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: palette.purpleDark,
    lineHeight: 19,
  },

  heroBotao: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 0,
    backgroundColor: palette.purple,
  },
  heroBotaoTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: palette.textOnDark,
  },
  heroAtualizar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    alignSelf: "center",
  },
  heroAtualizarTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: palette.textMuted,
  },

  // ------------------------------------------------------------- seções
  secaoRotulo: {
    display: "none",
  },

  // Dois atalhos lado a lado
  linhaAtalhos: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 18,
  },
  atalho: {
    flex: 1,
    backgroundColor: palette.glass,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(86, 53, 92, 0.14)",
    paddingHorizontal: 22,
    paddingVertical: 20,
    minHeight: 116,
    justifyContent: "flex-start",
    gap: 18,
    ...elevation.card,
  },
  atalhoIcone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  atalhoTitulo: {
    fontFamily: fonts.title,
    fontSize: 23,
    lineHeight: 28,
    color: palette.purpleDark,
  },
  atalhoLegenda: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "#655B83",
    marginTop: 4,
  },

  // ------------------------------------------------------------- card padrão
  card: {
    backgroundColor: palette.glass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(86, 53, 92, 0.14)",
    padding: 24,
    marginBottom: 16,
    ...elevation.card,
  },
  cardLinhaTopo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  cardTitulo: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: palette.purpleDark,
  },
  cardValorForte: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: "#655B83",
    letterSpacing: -0.4,
  },

  // Barra de progresso: fina, sem brilho, cor da fase
  barraContainer: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: palette.lilac,
    overflow: "hidden",
  },
  barraProgresso: {
    height: "100%",
    borderRadius: radius.pill,
  },
  progressoLegenda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "#756B8A",
    marginTop: spacing.sm,
  },

  // Conquistas
  conquistaLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  conquistaTrofeu: {
    width: 74,
    height: 74,
    resizeMode: "contain",
  },
  conquistaPontos: {
    fontFamily: fonts.title,
    fontSize: 27,
    color: palette.goldDark,
  },
  conquistaClasse: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: palette.purpleDark,
    marginTop: 3,
  },
  conquistaFaltam: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: palette.textMuted,
    marginTop: 3,
  },

  // ------------------------------------------------------- ação principal
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: palette.purple,
    borderRadius: radius.pill,
    paddingVertical: 18,
    marginTop: 4,
  },
  addButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: palette.textOnDark,
    letterSpacing: 0.2,
  },

  // ------------------------------------------------------------- menu modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(36, 33, 39, 0.42)",
  },
  modalMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "78%",
    backgroundColor: palette.bgDeep,
    paddingTop: 72,
    paddingHorizontal: spacing.lg,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.glassBorder,
  },
  menuItemText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: palette.textPrimary,
  },

  // ------------------------------------------------- modal de sintomas
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(36, 33, 39, 0.42)",
  },
  modalContent: {
    backgroundColor: palette.bgDeep,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: palette.textPrimary,
    marginBottom: spacing.lg,
  },
  symptomItem: {
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.glassBorder,
    backgroundColor: palette.glass,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedSymptom: {
    backgroundColor: palette.lilac,
    borderColor: palette.purpleLight,
  },
  symptomText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: palette.textPrimary,
  },
  modalButton: {
    backgroundColor: palette.purpleDark,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.md,
  },
  modalButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: palette.textOnDark,
  },

  // ------------------------------------------------------------ compatíveis
  // Mantidos porque outras partes da Home ainda os referenciam.
  dataTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: palette.textSecondary,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: palette.textSecondary,
  },
  trofeuContainer: {
    alignItems: "center",
  },
  trofeuImagem: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  trofeuTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: palette.textSecondary,
  },
  moedaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  moedaTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: palette.textPrimary,
  },
});
