import React, { useEffect, useState } from "react";
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import LuniaAnimada from "../../components/LuniaAnimada";
import { palette } from "../../theme/colors";
import { rotinaStyles as styles } from "./rotinaStyles";

/** Header das telas da rotina: wordmark ao centro e voltar à esquerda. */
export function CabecalhoRotina({ onVoltar }: { onVoltar: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onVoltar}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        hitSlop={8}
        accessibilityLabel="Voltar"
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color={palette.purpleDark} />
      </Pressable>
      <View style={styles.brand}>
        <Text style={styles.brandName}>Cíclica</Text>
        <Text style={styles.brandTag}>SEU CICLO, SUA FORÇA.</Text>
      </View>
    </View>
  );
}

/** A mesma barra das outras telas. A rotina é aberta pela Home, então nenhum item fica ativo. */
export function BarraInferior({ ir }: { ir: (rota: string) => void }) {
  return (
    <View style={styles.bottomNav}>
      <Nav icon="home-outline" label="Início" onPress={() => ir("Home")} />
      <Nav icon="calendar-month-outline" label="Ciclo" onPress={() => ir("Calendario")} />
      <Nav icon="meditation" label="Kegel" onPress={() => ir("Kegel")} />
      <Nav icon="dumbbell" label="Treinos" onPress={() => ir("TreinoDoDia")} />
      <Nav icon="pill" label="Rotina" onPress={() => ir("Rotina")} />
      <Nav icon="account-outline" label="Perfil" onPress={() => ir("Perfil")} />
    </View>
  );
}

function Nav({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={25} color="#756D89" />
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Chip({
  texto,
  ativo,
  icone,
  onPress,
}: {
  texto: string;
  ativo?: boolean;
  icone?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.chip, ativo && styles.chipAtivo]} onPress={onPress}>
      {icone && (
        <MaterialCommunityIcons
          name={icone as any}
          size={15}
          color={ativo ? "#fff" : palette.purpleDark}
        />
      )}
      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{texto}</Text>
    </TouchableOpacity>
  );
}

/** Balão da Lunia com uma frase curta. */
export function FraseLunia({ texto, legenda }: { texto: string; legenda?: string }) {
  return (
    <View style={styles.lunia}>
      <LuniaAnimada estado="complete" progresso={1} largura={54} />
      <View style={styles.doseCopy}>
        <Text style={styles.luniaTexto}>{texto}</Text>
        {!!legenda && <Text style={styles.luniaLegenda}>{legenda}</Text>}
      </View>
    </View>
  );
}

/**
 * Seletor de data ou horário. No Android o sistema já abre um diálogo; no iOS o
 * seletor fica dentro de um modal com confirmar, para a escolha não valer a
 * cada giro da roda.
 */
export function SeletorDataHora({
  visivel,
  modo,
  valor,
  minimo,
  onConfirmar,
  onCancelar,
}: {
  visivel: boolean;
  modo: "date" | "time";
  valor: Date;
  minimo?: Date;
  onConfirmar: (data: Date) => void;
  onCancelar: () => void;
}) {
  const [temporario, setTemporario] = useState(valor);

  useEffect(() => {
    if (visivel) setTemporario(valor);
  }, [visivel]);

  if (!visivel) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={valor}
        mode={modo}
        is24Hour
        minimumDate={minimo}
        onChange={(evento, data) => {
          if (evento.type === "set" && data) onConfirmar(data);
          else onCancelar();
        }}
      />
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <DateTimePicker
            value={temporario}
            mode={modo}
            display="spinner"
            is24Hour
            locale="pt-BR"
            minimumDate={minimo}
            onChange={(_, data) => data && setTemporario(data)}
          />
          <View style={styles.modalBotoes}>
            <TouchableOpacity style={[styles.botaoSecundario, { flex: 1 }]} onPress={onCancelar}>
              <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoPrimario, { flex: 1, height: 48 }]}
              onPress={() => onConfirmar(temporario)}
            >
              <Text style={styles.botaoPrimarioTexto}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
