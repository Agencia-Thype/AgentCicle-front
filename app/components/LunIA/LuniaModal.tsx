import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "app/navigation";
import { luniaStyles } from "./LuniaStyles";
import { api } from "app/services/api";
import { LunIAModalProps } from "app/interface/LuniaIAModalInterface";

export default function LunIAModal({
  visivel,
  fase,
  userName,
  onFechar,
}: LunIAModalProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const nomeFormatado = userName?.toLowerCase() || "miga";

  useEffect(() => {
    if (visivel) {
      buscarMensagem();
    }
  }, [visivel]);

  async function buscarMensagem() {
    try {
      setCarregando(true);
      const res = await api.get("/ia/mensagem-entrada?tipo=boas_vindas");
      setMensagem(res.data?.resposta || `Oi, ${nomeFormatado}! 🌸`);
    } catch (err) {
      console.error("Erro ao buscar mensagem da IA", err);
      setMensagem(`Oi, ${nomeFormatado}! 🌸`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={luniaStyles.overlay}>
        <View style={{ width: "100%", alignItems: "center", position: "relative" }}>
          <Image
            source={require("../../assets/logo.png")}
            style={luniaStyles.logo}
            accessibilityLabel="Logo da LunIA"
          />

          <View style={luniaStyles.balao}>
            <View style={luniaStyles.triangulo} />

            <TouchableOpacity
              onPress={onFechar}
              accessibilityLabel="Fechar balão da LunIA"
              style={luniaStyles.fecharAbsoluto}
            >
              <Text style={luniaStyles.fecharTexto}>✕</Text>
            </TouchableOpacity>

            <Text style={luniaStyles.titulo}>
              <Text style={luniaStyles.bold}>LunIA diz:</Text>
            </Text>

            {carregando ? (
              <ActivityIndicator size="small" color="#A56C6C" />
            ) : (
              <Text style={luniaStyles.texto}>{mensagem}</Text>
            )}

            <View style={luniaStyles.botoes}>
              <TouchableOpacity
                onPress={() => {
                  onFechar();
                  navigation.navigate("FaseCompletaScreen");
                }}
                style={luniaStyles.botaoRosa}
              >
                <Text style={luniaStyles.textoBotaoRosa}>Falar com a LunIA</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onFechar();
                  navigation.navigate("TreinoDoDia");
                }}
                style={luniaStyles.botaoVerde}
              >
                <Text style={luniaStyles.textoBotaoVerde}>Ver treino do dia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
