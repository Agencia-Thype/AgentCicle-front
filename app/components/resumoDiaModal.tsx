import React from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { palette } from "../theme/colors";
import { fonts } from "../theme/fonts";

interface Props {
  visible: boolean;
  onClose: () => void;
  resumo: any;
  onDefinirMenstruacao?: (data: Date) => Promise<void>;
  salvandoMenstruacao?: boolean;
}

export default function ResumoDiaModal({ visible, onClose, resumo, onDefinirMenstruacao, salvandoMenstruacao = false }: Props) {
  if (!resumo) return null;

  const data = resumo.data instanceof Date ? resumo.data : new Date(resumo.data);
  const sentimentos = resumo.sentimentos?.length ? resumo.sentimentos.join(", ") : "Não registrados";
  const treino = resumo.treino
    ? `${resumo.treino.tipo || "Treino"} · ${resumo.treino.percentual_conclusao || 0}% concluído`
    : "Não registrado";

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.supertitulo}>DETALHES DO CICLO</Text>
              <Text style={styles.titulo}>Resumo do dia</Text>
              <Text style={styles.data}>{data.toLocaleDateString("pt-BR")}</Text>
            </View>
            <TouchableOpacity style={styles.fechar} onPress={onClose} accessibilityLabel="Fechar resumo">
              <MaterialIcons name="close" size={24} color={palette.purpleDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
            <Info icon="moon-waning-crescent" label="Fase do ciclo" value={resumo.fase || "Não registrada"} />
            <Info icon="heart-pulse" label="Sentimentos" value={sentimentos} />
            <Info icon="notebook-outline" label="Observações" value={resumo.observacao || "Sem observações"} />
            <Info icon="scale-bathroom" label="Peso" value={resumo.peso ? `${resumo.peso} kg` : "Não registrado"} />
            <Info icon="dumbbell" label="Treino" value={treino} />
          </ScrollView>

          {onDefinirMenstruacao && (
            <TouchableOpacity
              style={[styles.botaoMenstruacao, salvandoMenstruacao && styles.botaoDesabilitado]}
              onPress={() => onDefinirMenstruacao(data)}
              disabled={salvandoMenstruacao}
              accessibilityRole="button"
              accessibilityLabel="Definir esta data como início da menstruação"
            >
              {salvandoMenstruacao
                ? <ActivityIndicator color="#fff" />
                : <MaterialCommunityIcons name="calendar-heart" size={22} color="#fff" />}
              <Text style={styles.botaoTexto}>
                {salvandoMenstruacao ? "Atualizando ciclo..." : "Definir como início da menstruação"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Info({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <View style={styles.icone}><MaterialCommunityIcons name={icon} size={22} color={palette.purpleDark} /></View>
      <View style={styles.infoCopy}><Text style={styles.label}>{label}</Text><Text style={styles.valor}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(43, 27, 48, 0.55)", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 44 },
  modal: { width: "100%", maxWidth: 480, maxHeight: "88%", alignSelf: "center", backgroundColor: "#FFFCFA", borderRadius: 24, borderWidth: 1, borderColor: "#E7DCE7", padding: 18, shadowColor: "#2F2033", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  headerCopy: { flex: 1, minWidth: 0 },
  supertitulo: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.6, color: "#907D96" },
  titulo: { fontFamily: fonts.title, fontSize: 25, lineHeight: 30, color: palette.purpleDark, marginTop: 2 },
  data: { fontFamily: fonts.bodyMedium, fontSize: 13, color: "#766B7F", marginTop: 2 },
  fechar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1E8F2", alignItems: "center", justifyContent: "center" },
  scroll: { flexShrink: 1 },
  conteudo: { gap: 8, paddingBottom: 4 },
  info: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 11, padding: 10, borderRadius: 16, backgroundColor: "#F8F3F7" },
  icone: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EADFEB", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoCopy: { flex: 1, minWidth: 0 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, color: palette.purpleDark },
  valor: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: "#5F5667", marginTop: 1 },
  botaoMenstruacao: { minHeight: 50, marginTop: 14, paddingHorizontal: 14, borderRadius: 18, backgroundColor: palette.purple, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  botaoDesabilitado: { opacity: 0.65 },
  botaoTexto: { flexShrink: 1, fontFamily: fonts.bodyBold, fontSize: 13, color: "#fff", textAlign: "center" },
});
