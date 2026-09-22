import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
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
import {
  mensagemDeErro,
  rotinaService,
  type DoseDoDia,
  type ItemRotina,
  type RotinaDoDia,
  type StatusDose,
} from "../../services/rotinaService";
import { palette } from "../../theme/colors";
import { BarraInferior, CabecalhoRotina, FraseLunia } from "./RotinaComponentes";
import {
  CATEGORIAS,
  dataPorExtenso,
  ehNoite,
  formatarLitros,
  resumoDoItem,
  textoMinutos,
} from "./rotinaFormato";
import { rotinaStyles as styles } from "./rotinaStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Rotina">;

const COPOS_ML = [200, 300, 500];

const STATUS: Record<StatusDose, { texto: string; icone: string; cor: string; estilo: object }> = {
  tomado: { texto: "Tomado", icone: "check-circle", cor: palette.sageDark, estilo: styles.statusTomado },
  pendente: { texto: "Pendente", icone: "clock-outline", cor: palette.purple, estilo: styles.statusPendente },
  atrasado: { texto: "Atrasado", icone: "alert-circle-outline", cor: palette.goldDark, estilo: styles.statusAtrasado },
};

const chaveDaDose = (dose: DoseDoDia) => `${dose.item_id}-${dose.horario}`;

function fraseDoDia(rotina: RotinaDoDia): { texto: string; legenda: string } {
  if (rotina.total === 0) {
    return { texto: "Me conte o que você usa.", legenda: "Eu te lembro na hora certa." };
  }
  if (rotina.tomadas === rotina.total) {
    return { texto: "Você está cuidando tão bem de você!", legenda: "Disciplina de hoje, bem-estar de amanhã." };
  }
  const faltam = rotina.total - rotina.tomadas;
  return {
    texto: "Um cuidado de cada vez.",
    legenda: `Falta${faltam === 1 ? "" : "m"} ${faltam} item${faltam === 1 ? "" : "s"} hoje.`,
  };
}

export default function RotinaScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [rotina, setRotina] = useState<RotinaDoDia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  /** Chave da dose sendo salva, ou "agua". Evita toques duplos. */
  const [salvando, setSalvando] = useState<string | null>(null);
  const [mostrarItens, setMostrarItens] = useState(false);
  const [itens, setItens] = useState<ItemRotina[] | null>(null);

  const carregar = useCallback(async () => {
    try {
      setFalhou(false);
      setRotina(await rotinaService.hoje());
    } catch (error) {
      console.warn("Erro ao carregar a rotina:", error);
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

  const alternarDose = async (dose: DoseDoDia) => {
    if (salvando) return;
    setSalvando(chaveDaDose(dose));
    try {
      const resumo =
        dose.status === "tomado"
          ? await rotinaService.desfazerDose(dose.item_id, dose.horario)
          : await rotinaService.marcarDose(dose.item_id, dose.horario);
      setRotina(resumo);
    } catch (error) {
      Alert.alert("Não foi possível salvar", mensagemDeErro(error, "Tente de novo em instantes."));
    } finally {
      setSalvando(null);
    }
  };

  const beber = async (ml: number) => {
    if (salvando) return;
    setSalvando("agua");
    try {
      const agua = await rotinaService.registrarAgua(ml);
      setRotina((atual) => (atual ? { ...atual, agua } : atual));
    } catch (error) {
      Alert.alert("Não foi possível registrar", mensagemDeErro(error, "Tente de novo em instantes."));
    } finally {
      setSalvando(null);
    }
  };

  const abrirItens = async () => {
    setItens(null);
    setMostrarItens(true);
    try {
      setItens(await rotinaService.itens());
    } catch (error) {
      setMostrarItens(false);
      Alert.alert("Não foi possível carregar", mensagemDeErro(error, "Tente de novo em instantes."));
    }
  };

  const adicionarItem = () => navigation.navigate("AdicionarItemRotina");
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
          <View>
            <Text style={styles.titulo}>Minha rotina</Text>
            <Text style={styles.subtitulo}>Pequenos cuidados, grandes equilíbrios.</Text>
          </View>

          {falhou || !rotina ? (
            <View style={styles.card}>
              <Text style={styles.vazioTitulo}>Não foi possível carregar</Text>
              <Text style={styles.vazioTexto}>Verifique sua conexão e tente de novo.</Text>
              <TouchableOpacity style={[styles.botaoSecundario, { marginTop: 12 }]} onPress={carregar}>
                <Text style={styles.botaoSecundarioTexto}>Tentar de novo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.pillData}
                onPress={() => navigation.navigate("HistoricoRotina")}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="calendar-blank-outline" size={20} color={palette.purpleDark} />
                <Text style={styles.pillDataTexto}>{dataPorExtenso(rotina.data)}</Text>
                <Text style={styles.pillDataContagem}>
                  {rotina.tomadas} de {rotina.total} concluídos
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={palette.purple} />
              </TouchableOpacity>

              <CardProximo
                rotina={rotina}
                ocupado={salvando !== null}
                onTomar={alternarDose}
                onAdicionar={adicionarItem}
              />

              <View style={styles.card}>
                <View style={styles.linhaEntre}>
                  <Text style={styles.secaoTitulo}>Seus itens de hoje</Text>
                  <TouchableOpacity style={styles.link} onPress={abrirItens}>
                    <Text style={styles.linkTexto}>Ver todos</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={palette.purple} />
                  </TouchableOpacity>
                </View>

                {rotina.doses.length === 0 ? (
                  <Text style={[styles.vazioTexto, { marginVertical: 10 }]}>Nada previsto para hoje.</Text>
                ) : (
                  rotina.doses.map((dose, indice) => (
                    <LinhaDose
                      key={chaveDaDose(dose)}
                      dose={dose}
                      primeira={indice === 0}
                      salvando={salvando === chaveDaDose(dose)}
                      bloqueado={salvando !== null}
                      onAlternar={() => alternarDose(dose)}
                    />
                  ))
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.linhaEntre}>
                  <View style={styles.linha}>
                    <MaterialCommunityIcons name="water" size={20} color={palette.purpleLight} />
                    <Text style={styles.secaoTitulo}>Sua hidratação hoje</Text>
                  </View>
                  <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("AguaDoDia")}>
                    <Text style={styles.linkTexto}>Ver mais</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={palette.purple} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.linha, { marginTop: 12, gap: 14 }]}>
                  <AnimatedCircularProgress
                    size={92}
                    width={9}
                    fill={rotina.agua.percentual}
                    tintColor={palette.purple}
                    backgroundColor="#EADFED"
                    lineCap="round"
                  >
                    {() => <MaterialCommunityIcons name="water" size={28} color={palette.purpleLight} />}
                  </AnimatedCircularProgress>

                  <View style={styles.doseCopy}>
                    <Text style={styles.aguaValor}>
                      {formatarLitros(rotina.agua.total_ml)}{" "}
                      <Text style={styles.aguaMeta}>de {formatarLitros(rotina.agua.meta_ml)}</Text>
                    </Text>
                    <Text style={styles.aguaMeta}>{rotina.agua.percentual}% da meta</Text>
                    <View style={[styles.botoesAgua, { marginTop: 8 }]}>
                      {COPOS_ML.map((ml) => (
                        <TouchableOpacity
                          key={ml}
                          style={[styles.botaoAgua, salvando === "agua" && styles.desabilitado]}
                          disabled={salvando !== null}
                          onPress={() => beber(ml)}
                        >
                          <Text style={styles.botaoAguaTexto}>+{ml} ml</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <FraseLunia {...fraseDoDia(rotina)} />

              <TouchableOpacity style={styles.botaoPrimario} onPress={adicionarItem} activeOpacity={0.9}>
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.botaoPrimarioTexto}>Adicionar suplemento ou remédio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => navigation.navigate("HistoricoRotina")}
              >
                <MaterialCommunityIcons name="chart-box-outline" size={18} color={palette.purpleDark} />
                <Text style={styles.botaoSecundarioTexto}>Ver histórico</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <BarraInferior ir={ir} />
      </View>

      <Modal
        visible={mostrarItens}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarItens(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Seus itens</Text>
            <Text style={styles.modalSubtitulo}>Toque em um item para editar ou excluir.</Text>

            {itens === null ? (
              <ActivityIndicator color={palette.purple} style={{ marginVertical: 20 }} />
            ) : itens.length === 0 ? (
              <Text style={[styles.vazioTexto, { marginVertical: 14 }]}>Nenhum item cadastrado.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 360 }}>
                {itens.map((item, indice) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.doseLinha, indice > 0 && styles.doseSeparador]}
                    onPress={() => {
                      setMostrarItens(false);
                      navigation.navigate("AdicionarItemRotina", { itemId: item.id });
                    }}
                  >
                    <MaterialCommunityIcons
                      name={CATEGORIAS[item.categoria].icone as any}
                      size={20}
                      color={palette.purpleDark}
                    />
                    <View style={styles.doseCopy}>
                      <Text style={styles.doseNome} numberOfLines={1}>
                        {item.nome}
                      </Text>
                      <Text style={styles.doseDetalhe} numberOfLines={1}>
                        {resumoDoItem(item)}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={palette.purple} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botaoSecundario, { flex: 1 }]}
                onPress={() => setMostrarItens(false)}
              >
                <Text style={styles.botaoSecundarioTexto}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoPrimario, { flex: 1, height: 48 }]}
                onPress={() => {
                  setMostrarItens(false);
                  adicionarItem();
                }}
              >
                <Text style={styles.botaoPrimarioTexto}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppBackground>
  );
}

function CardProximo({
  rotina,
  ocupado,
  onTomar,
  onAdicionar,
}: {
  rotina: RotinaDoDia;
  ocupado: boolean;
  onTomar: (dose: DoseDoDia) => void;
  onAdicionar: () => void;
}) {
  const { proxima, total, tomadas } = rotina;

  if (total === 0) {
    return (
      <TouchableOpacity style={[styles.card, styles.cardLilas, styles.linha]} onPress={onAdicionar}>
        <View style={styles.proximoIcone}>
          <MaterialCommunityIcons name="plus" size={30} color={palette.purpleDark} />
        </View>
        <View style={styles.doseCopy}>
          <Text style={styles.proximoNome}>Monte sua rotina</Text>
          <Text style={styles.proximoDose}>
            Cadastre os suplementos, vitaminas e remédios que você usa.
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (!proxima) {
    return (
      <View style={[styles.card, styles.cardVerde, styles.linha]}>
        <View style={[styles.proximoIcone, styles.proximoIconeVerde]}>
          <MaterialCommunityIcons name="check" size={30} color={palette.sageDark} />
        </View>
        <View style={styles.doseCopy}>
          <Text style={styles.proximoRotulo}>Tudo em dia</Text>
          <Text style={styles.proximoNome}>
            {tomadas} de {total} tomados
          </Text>
          <Text style={styles.proximoDose}>Nada mais para hoje.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardLilas, styles.linha]}>
      <View style={styles.proximoIcone}>
        <MaterialCommunityIcons
          name={CATEGORIAS[proxima.categoria].icone as any}
          size={30}
          color={palette.purpleDark}
        />
      </View>
      <View style={styles.doseCopy}>
        <Text style={styles.proximoRotulo}>
          {textoMinutos(proxima.minutos)} · {proxima.horario}
        </Text>
        <Text style={styles.proximoNome} numberOfLines={1}>
          {proxima.nome}
        </Text>
        {!!proxima.dosagem && <Text style={styles.proximoDose}>{proxima.dosagem}</Text>}
      </View>
      <TouchableOpacity
        style={[styles.botaoTomei, ocupado && styles.desabilitado]}
        disabled={ocupado}
        onPress={() => onTomar(proxima)}
        accessibilityLabel={`Marcar ${proxima.nome} como tomado`}
      >
        <MaterialCommunityIcons name="check" size={16} color="#fff" />
        <Text style={styles.botaoTomeiTexto}>Tomei</Text>
      </TouchableOpacity>
    </View>
  );
}

function LinhaDose({
  dose,
  primeira,
  salvando,
  bloqueado,
  onAlternar,
}: {
  dose: DoseDoDia;
  primeira: boolean;
  salvando: boolean;
  bloqueado: boolean;
  onAlternar: () => void;
}) {
  const status = STATUS[dose.status];
  const noite = ehNoite(dose.horario);

  return (
    <View style={[styles.doseLinha, !primeira && styles.doseSeparador]}>
      <Text style={styles.doseHora}>{dose.horario}</Text>
      <MaterialCommunityIcons
        name={noite ? "weather-night" : "weather-sunny"}
        size={20}
        color={noite ? palette.purpleDark : palette.gold}
      />
      <View style={styles.doseCopy}>
        <Text style={styles.doseNome} numberOfLines={1}>
          {dose.nome}
        </Text>
        {!!dose.dosagem && (
          <Text style={styles.doseDetalhe} numberOfLines={1}>
            {dose.dosagem}
          </Text>
        )}
        {dose.estoque_baixo && <Text style={styles.alertaEstoque}>Estoque acabando</Text>}
      </View>
      <TouchableOpacity
        style={[styles.status, status.estilo, bloqueado && !salvando && styles.desabilitado]}
        onPress={onAlternar}
        disabled={bloqueado}
        accessibilityLabel={
          dose.status === "tomado" ? `Desmarcar ${dose.nome}` : `Marcar ${dose.nome} como tomado`
        }
      >
        {salvando ? (
          <ActivityIndicator size="small" color={status.cor} />
        ) : (
          <MaterialCommunityIcons name={status.icone as any} size={15} color={status.cor} />
        )}
        <Text style={[styles.statusTexto, { color: status.cor }]}>{status.texto}</Text>
      </TouchableOpacity>
    </View>
  );
}
