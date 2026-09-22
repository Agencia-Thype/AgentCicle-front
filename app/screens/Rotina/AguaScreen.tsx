import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import AppBackground from "../../components/AppBackground";
import type { RootStackParamList } from "../../navigation";
import { sincronizarLembretesComAviso } from "../../services/notificacoes";
import { mensagemDeErro, rotinaService, type AguaDoDia } from "../../services/rotinaService";
import { palette } from "../../theme/colors";
import { BarraInferior, CabecalhoRotina, FraseLunia, SeletorDataHora } from "./RotinaComponentes";
import { formatarLitros, horaDeDate } from "./rotinaFormato";
import { rotinaStyles as styles } from "./rotinaStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AguaDoDia">;

const COPOS_ML = [200, 300, 500];

function incentivo(agua: AguaDoDia): { titulo: string; texto: string } {
  if (agua.total_ml === 0) {
    return { titulo: "Vamos começar?", texto: "Um copo agora já conta para a sua meta." };
  }
  if (agua.faltam_ml === 0) {
    return { titulo: "Meta batida!", texto: "Você bebeu tudo o que planejou para hoje." };
  }
  const faltam = formatarLitros(agua.faltam_ml);
  if (agua.percentual >= 70) {
    return { titulo: "Você está quase lá!", texto: `Faltam ${faltam} para atingir sua meta.` };
  }
  return { titulo: "Bom ritmo!", texto: `Faltam ${faltam} para a meta de hoje.` };
}

export default function AguaScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [agua, setAgua] = useState<AguaDoDia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [configurando, setConfigurando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setFalhou(false);
      setAgua(await rotinaService.agua());
    } catch (error) {
      console.warn("Erro ao carregar a hidratação:", error);
      setFalhou(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const executar = async (acao: () => Promise<AguaDoDia>) => {
    if (salvando) return;
    setSalvando(true);
    try {
      setAgua(await acao());
    } catch (error) {
      Alert.alert("Não foi possível salvar", mensagemDeErro(error, "Tente de novo em instantes."));
    } finally {
      setSalvando(false);
    }
  };

  const ir = (rota: string) => navigation.navigate(rota as never);

  if (carregando) {
    return (
      <AppBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.purple} />
        </View>
      </AppBackground>
    );
  }

  const agoraHM = horaDeDate(new Date());

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.screen}>
        <CabecalhoRotina onVoltar={() => navigation.goBack()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tituloLinha}>
            <View style={styles.doseCopy}>
              <Text style={styles.titulo}>Água do dia</Text>
              <Text style={styles.subtitulo}>Hidratar-se também é autocuidado.</Text>
            </View>
            <View style={{ alignItems: "center", gap: 4, paddingTop: 4 }}>
              <Text style={styles.frase}>Mais saúde para o seu amanhã</Text>
              <MaterialCommunityIcons name="heart-outline" size={18} color={palette.purpleDark} />
            </View>
          </View>

          {falhou || !agua ? (
            <View style={styles.card}>
              <Text style={styles.vazioTitulo}>Não foi possível carregar</Text>
              <Text style={styles.vazioTexto}>Verifique sua conexão e tente de novo.</Text>
              <TouchableOpacity style={[styles.botaoSecundario, { marginTop: 12 }]} onPress={carregar}>
                <Text style={styles.botaoSecundarioTexto}>Tentar de novo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.card, { alignItems: "center", paddingVertical: 20 }]}>
                <AnimatedCircularProgress
                  size={212}
                  width={16}
                  fill={agua.percentual}
                  tintColor={palette.purple}
                  backgroundColor="#EADFED"
                  lineCap="round"
                  duration={600}
                >
                  {() => (
                    <View style={styles.anelCentro}>
                      <MaterialCommunityIcons name="water" size={34} color={palette.purpleLight} />
                      <Text style={styles.anelValor}>{formatarLitros(agua.total_ml)}</Text>
                      <Text style={styles.anelMeta}>Meta: {formatarLitros(agua.meta_ml)}</Text>
                    </View>
                  )}
                </AnimatedCircularProgress>

                <Text style={[styles.frase, { width: "auto", marginTop: 12 }]}>
                  Pequenos gestos hoje, mais energia sempre.
                </Text>

                <View style={[styles.botoesAgua, { alignSelf: "stretch", marginTop: 14 }]}>
                  {COPOS_ML.map((ml) => (
                    <TouchableOpacity
                      key={ml}
                      style={[styles.botaoAgua, styles.botaoAguaGrande, salvando && styles.desabilitado]}
                      disabled={salvando}
                      onPress={() => executar(() => rotinaService.registrarAgua(ml))}
                      accessibilityLabel={`Registrar ${ml} mililitros`}
                    >
                      <Text style={[styles.botaoAguaTexto, styles.botaoAguaTextoGrande]}>+{ml} ml</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.card, styles.cardVerde, styles.linha]}>
                <MaterialCommunityIcons name="sprout-outline" size={30} color={palette.sageDark} />
                <View style={styles.doseCopy}>
                  <Text style={styles.doseNome}>{incentivo(agua).titulo}</Text>
                  <Text style={styles.doseDetalhe}>{incentivo(agua).texto}</Text>
                </View>
              </View>

              {agua.registros.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.secaoTitulo}>Registros de hoje</Text>
                  {[...agua.registros].reverse().map((registro, indice) => (
                    <View key={registro.id} style={[styles.registro, indice > 0 && styles.doseSeparador]}>
                      <MaterialCommunityIcons name="cup-water" size={19} color={palette.purpleLight} />
                      <Text style={styles.registroTexto}>+{registro.ml} ml</Text>
                      {!!registro.hora && <Text style={styles.registroHora}>às {registro.hora}</Text>}
                      <TouchableOpacity
                        onPress={() => executar(() => rotinaService.desfazerAgua(registro.id))}
                        disabled={salvando}
                        hitSlop={8}
                        accessibilityLabel={`Apagar registro de ${registro.ml} mililitros`}
                      >
                        <MaterialCommunityIcons name="close" size={17} color={palette.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.card}>
                <View style={styles.linhaEntre}>
                  <View style={styles.linha}>
                    <MaterialCommunityIcons name="clock-outline" size={19} color={palette.purpleDark} />
                    <Text style={styles.secaoTitulo}>Lembretes de hidratação</Text>
                  </View>
                  <TouchableOpacity style={styles.link} onPress={() => setConfigurando(true)}>
                    <Text style={styles.linkTexto}>Editar</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={palette.purple} />
                  </TouchableOpacity>
                </View>

                {!agua.lembretes_ativos || agua.lembretes.length === 0 ? (
                  <Text style={[styles.ajuda, { marginTop: 8 }]}>
                    Lembretes desligados. Toque em Editar para escolher os horários.
                  </Text>
                ) : (
                  <View style={[styles.chips, { marginTop: 10 }]}>
                    {agua.lembretes.map((horario) => {
                      const passou = horario <= agoraHM;
                      return (
                        <View key={horario} style={styles.lembreteChip}>
                          <Text style={styles.chipTexto}>{horario}</Text>
                          <MaterialCommunityIcons
                            name={passou ? "check-circle" : "circle-outline"}
                            size={16}
                            color={passou ? palette.purpleDark : palette.purpleLight}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.card, styles.linha]}
                onPress={() => navigation.navigate("HistoricoRotina")}
                activeOpacity={0.85}
              >
                <View style={styles.sequenciaIcone}>
                  <MaterialCommunityIcons name="fire" size={28} color={palette.gold} />
                </View>
                <View style={styles.doseCopy}>
                  <Text style={styles.doseDetalhe}>Sequência no hábito</Text>
                  <Text style={styles.sequenciaValor}>
                    {agua.sequencia_dias === 0
                      ? "Comece hoje"
                      : `${agua.sequencia_dias} dia${agua.sequencia_dias === 1 ? "" : "s"} seguido${
                          agua.sequencia_dias === 1 ? "" : "s"
                        }`}
                  </Text>
                  <Text style={styles.doseDetalhe}>
                    {agua.sequencia_dias === 0
                      ? "Bata a meta para começar uma sequência."
                      : "Parabéns! Consistência gera bem-estar."}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.purple} />
              </TouchableOpacity>

              <FraseLunia texto="“Cuidar de si é um ato de força.”" legenda="— Lunia" />
            </>
          )}
        </ScrollView>

        <BarraInferior ir={ir} />
      </View>

      {agua && (
        <ConfigAguaModal
          agua={agua}
          visivel={configurando}
          onFechar={() => setConfigurando(false)}
          onSalvo={(nova) => {
            setAgua(nova);
            setConfigurando(false);
          }}
        />
      )}
    </AppBackground>
  );
}

function ConfigAguaModal({
  agua,
  visivel,
  onFechar,
  onSalvo,
}: {
  agua: AguaDoDia;
  visivel: boolean;
  onFechar: () => void;
  onSalvo: (agua: AguaDoDia) => void;
}) {
  const [meta, setMeta] = useState(agua.meta_ml);
  const [lembretes, setLembretes] = useState(agua.lembretes);
  const [ativos, setAtivos] = useState(agua.lembretes_ativos);
  const [escolhendoHorario, setEscolhendoHorario] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!visivel) return;
    setMeta(agua.meta_ml);
    setLembretes(agua.lembretes);
    setAtivos(agua.lembretes_ativos);
  }, [visivel]);

  const ajustarMeta = (delta: number) => setMeta((atual) => Math.min(6000, Math.max(500, atual + delta)));

  const salvar = async () => {
    setSalvando(true);
    try {
      const nova = await rotinaService.configurarAgua({
        meta_ml: meta,
        lembretes,
        lembretes_ativos: ativos,
      });
      onSalvo(nova);
      await sincronizarLembretesComAviso(ativos && lembretes.length > 0);
    } catch (error) {
      Alert.alert("Não foi possível salvar", mensagemDeErro(error, "Tente de novo em instantes."));
    } finally {
      setSalvando(false);
    }
  };

  const horaInicial = () => {
    const agora = new Date();
    agora.setMinutes(0, 0, 0);
    return agora;
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitulo}>Sua hidratação</Text>
            <Text style={styles.modalSubtitulo}>Ajuste a meta e os horários dos lembretes.</Text>

            <Text style={styles.rotulo}>Meta diária</Text>
            <View style={[styles.linhaEntre, { marginVertical: 8 }]}>
              <TouchableOpacity style={styles.stepper} onPress={() => ajustarMeta(-100)} accessibilityLabel="Diminuir meta">
                <MaterialCommunityIcons name="minus" size={22} color={palette.purpleDark} />
              </TouchableOpacity>
              <Text style={styles.metaValor}>{formatarLitros(meta)}</Text>
              <TouchableOpacity style={styles.stepper} onPress={() => ajustarMeta(100)} accessibilityLabel="Aumentar meta">
                <MaterialCommunityIcons name="plus" size={22} color={palette.purpleDark} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setMeta(agua.meta_sugerida.meta_ml)}>
              <Text style={styles.ajuda}>
                Sugestão: {formatarLitros(agua.meta_sugerida.meta_ml)} ({agua.meta_sugerida.motivo}).{" "}
                <Text style={styles.linkTexto}>Usar sugestão</Text>
              </Text>
            </TouchableOpacity>

            <View style={[styles.interruptor, { marginTop: 16 }]}>
              <View style={styles.doseCopy}>
                <Text style={styles.rotulo}>Lembretes</Text>
                <Text style={styles.ajuda}>Notificações ao longo do dia para beber água.</Text>
              </View>
              <Switch
                value={ativos}
                onValueChange={setAtivos}
                trackColor={{ false: "#DDD3DF", true: palette.purpleDark }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Lembretes de hidratação"
              />
            </View>

            {ativos && (
              <View style={[styles.chips, { marginTop: 10 }]}>
                {lembretes.map((horario) => (
                  <View key={horario} style={styles.chip}>
                    <Text style={styles.chipTexto}>{horario}</Text>
                    <TouchableOpacity
                      onPress={() => setLembretes((lista) => lista.filter((h) => h !== horario))}
                      hitSlop={8}
                      accessibilityLabel={`Remover ${horario}`}
                    >
                      <MaterialCommunityIcons name="close" size={15} color={palette.purpleDark} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.chip, styles.chipAdicionar]}
                  onPress={() => setEscolhendoHorario(true)}
                  accessibilityLabel="Adicionar horário"
                >
                  <MaterialCommunityIcons name="plus" size={18} color={palette.purpleDark} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={[styles.botaoSecundario, { flex: 1 }]} onPress={onFechar}>
                <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoPrimario, { flex: 1, height: 48 }, salvando && styles.desabilitado]}
                onPress={salvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoPrimarioTexto}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      <SeletorDataHora
        visivel={escolhendoHorario}
        modo="time"
        valor={horaInicial()}
        onConfirmar={(data) => {
          setEscolhendoHorario(false);
          const horario = horaDeDate(data);
          setLembretes((lista) => Array.from(new Set([...lista, horario])).sort());
        }}
        onCancelar={() => setEscolhendoHorario(false)}
      />
    </Modal>
  );
}
