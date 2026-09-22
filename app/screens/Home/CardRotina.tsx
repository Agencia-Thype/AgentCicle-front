import React, { useCallback, useEffect, useState } from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { sincronizarLembretesNaAbertura } from "../../services/notificacoes";
import { rotinaService, type RotinaDoDia } from "../../services/rotinaService";
import { palette } from "../../theme/colors";
import { fonts } from "../../theme/fonts";
import { formatarLitros } from "../Rotina/rotinaFormato";
import { homeStyles } from "./homeStyles";

/** Atalho da Home para a rotina de cuidados: doses do dia e água. */
export default function CardRotina({
  onAbrir,
  estilo,
}: {
  onAbrir: () => void;
  /** Cartão da Home nova; sem isso vale o cartão do visual antigo. */
  estilo?: StyleProp<ViewStyle>;
}) {
  const [rotina, setRotina] = useState<RotinaDoDia | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      rotinaService
        .hoje()
        .then((dados) => {
          if (ativo) setRotina(dados);
        })
        .catch(() => undefined);
      return () => {
        ativo = false;
      };
    }, [])
  );

  // Refaz os lembretes uma vez por abertura do app: datas de início e fim dos
  // itens só entram no agendamento quando o plano é recalculado.
  useEffect(() => {
    void sincronizarLembretesNaAbertura();
  }, []);

  let legenda = "Suplementos, remédios e água";
  if (rotina && rotina.total === 0) legenda = "Cadastre o que você usa e receba lembretes";
  else if (rotina?.proxima) {
    legenda = `${rotina.tomadas} de ${rotina.total} · próximo: ${rotina.proxima.nome} às ${rotina.proxima.horario}`;
  } else if (rotina) legenda = `Tudo tomado hoje (${rotina.tomadas} de ${rotina.total})`;

  const agua = rotina?.agua;

  return (
    <TouchableOpacity style={estilo ?? homeStyles.card} onPress={onAbrir} activeOpacity={0.85}>
      <View style={styles.linha}>
        <View style={styles.icone}>
          <MaterialCommunityIcons name="pill" size={19} color={palette.purple} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.titulo}>Minha rotina</Text>
          <Text style={styles.legenda} numberOfLines={2}>
            {legenda}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={palette.purple} />
      </View>

      {agua && (
        <View style={styles.agua}>
          <MaterialCommunityIcons name="water" size={15} color={palette.purpleLight} />
          <View style={styles.trilho}>
            <View style={[styles.preenchido, { width: `${agua.percentual}%` }]} />
          </View>
          <Text style={styles.aguaTexto}>
            {formatarLitros(agua.total_ml)} de {formatarLitros(agua.meta_ml)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: "row", alignItems: "center", gap: 12 },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.lilac,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, minWidth: 0 },
  titulo: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: palette.textPrimary },
  legenda: { fontFamily: fonts.body, fontSize: 12, color: palette.textSecondary, marginTop: 1 },
  agua: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  trilho: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#EDE2EF", overflow: "hidden" },
  preenchido: { height: "100%", borderRadius: 3, backgroundColor: palette.purple },
  aguaTexto: { fontFamily: fonts.bodyMedium, fontSize: 11, color: palette.textSecondary },
});
