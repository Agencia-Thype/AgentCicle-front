import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppBackground from "../../components/AppBackground";
import type { RootStackParamList } from "../../navigation";
import {
  sincronizarLembretesComAviso,
  sincronizarLembretesRotina,
} from "../../services/notificacoes";
import {
  mensagemDeErro,
  rotinaService,
  type CategoriaItem,
  type Frequencia,
  type ItemRotinaPayload,
} from "../../services/rotinaService";
import { palette } from "../../theme/colors";
import { CabecalhoRotina, Chip, SeletorDataHora } from "./RotinaComponentes";
import {
  CATEGORIAS,
  DIAS_SEMANA_CURTO,
  DIAS_SEMANA_NOME,
  dataCurta,
  dataDeISO,
  dataLocalISO,
  horaDeDate,
} from "./rotinaFormato";
import { rotinaStyles as styles } from "./rotinaStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AdicionarItemRotina">;
type Rota = RouteProp<RootStackParamList, "AdicionarItemRotina">;
type Seletor = "horario" | "inicio" | "fim" | null;

const TODOS_OS_DIAS = [0, 1, 2, 3, 4, 5, 6];
const ORDEM_CATEGORIAS: CategoriaItem[] = ["suplemento", "medicamento", "vitamina"];

function inteiroOuNulo(texto: string): number | null {
  const numero = parseInt(texto, 10);
  return Number.isNaN(numero) ? null : numero;
}

export default function AdicionarItemScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Rota>();
  const itemId = route.params?.itemId;
  const editando = itemId !== undefined;

  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [seletor, setSeletor] = useState<Seletor>(null);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<CategoriaItem>("suplemento");
  const [dosagem, setDosagem] = useState("");
  const [frequencia, setFrequencia] = useState<Frequencia>("todos_os_dias");
  const [dias, setDias] = useState<number[]>(TODOS_OS_DIAS);
  const [horarios, setHorarios] = useState<string[]>(["08:00"]);
  const [dataInicio, setDataInicio] = useState(dataLocalISO());
  const [dataFim, setDataFim] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [indicadoMedico, setIndicadoMedico] = useState(false);
  const [lembreteAtivo, setLembreteAtivo] = useState(true);
  const [controleEstoque, setControleEstoque] = useState(false);
  const [estoqueAtual, setEstoqueAtual] = useState("");
  const [estoqueAlerta, setEstoqueAlerta] = useState("5");

  useEffect(() => {
    if (itemId === undefined) return;
    let ativo = true;

    rotinaService
      .item(itemId)
      .then((item) => {
        if (!ativo) return;
        setNome(item.nome);
        setCategoria(item.categoria);
        setDosagem(item.dosagem ?? "");
        setFrequencia(item.frequencia);
        setDias(item.frequencia === "dias_especificos" ? item.dias_semana : TODOS_OS_DIAS);
        setHorarios(item.horarios);
        setDataInicio(item.data_inicio);
        setDataFim(item.data_fim);
        setObservacoes(item.observacoes ?? "");
        setIndicadoMedico(item.indicado_medico);
        setLembreteAtivo(item.lembrete_ativo);
        setControleEstoque(item.controle_estoque);
        setEstoqueAtual(item.estoque_atual?.toString() ?? "");
        setEstoqueAlerta(item.estoque_alerta?.toString() ?? "5");
      })
      .catch((error) => {
        if (!ativo) return;
        Alert.alert("Não foi possível abrir o item", mensagemDeErro(error, "Tente de novo em instantes."));
        navigation.goBack();
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [itemId]);

  const escolherFrequencia = (nova: Frequencia) => {
    setFrequencia(nova);
    if (nova === "todos_os_dias") setDias(TODOS_OS_DIAS);
  };

  /** Tirar um dia de "todos os dias" vira "dias específicos"; marcar os 7 volta. */
  const alternarDia = (dia: number) => {
    const base = frequencia === "todos_os_dias" ? TODOS_OS_DIAS : dias;
    const novos = base.includes(dia)
      ? base.filter((d) => d !== dia)
      : [...base, dia].sort((a, b) => a - b);

    if (novos.length === TODOS_OS_DIAS.length) {
      escolherFrequencia("todos_os_dias");
      return;
    }
    setFrequencia("dias_especificos");
    setDias(novos);
  };

  const valorDoSeletor = (): Date => {
    if (seletor === "inicio") return dataDeISO(dataInicio);
    if (seletor === "fim") return dataDeISO(dataFim ?? dataInicio);
    const agora = new Date();
    agora.setMinutes(0, 0, 0);
    return agora;
  };

  const confirmarSeletor = (data: Date) => {
    const atual = seletor;
    setSeletor(null);
    if (atual === "horario") {
      const horario = horaDeDate(data);
      setHorarios((lista) => Array.from(new Set([...lista, horario])).sort());
    } else if (atual === "inicio") {
      setDataInicio(dataLocalISO(data));
    } else if (atual === "fim") {
      setDataFim(dataLocalISO(data));
    }
  };

  const problemaNoFormulario = (): string | null => {
    if (!nome.trim()) return "Informe o nome do item.";
    if (horarios.length === 0) return "Adicione pelo menos um horário.";
    if (frequencia === "dias_especificos" && dias.length === 0) {
      return "Escolha pelo menos um dia da semana.";
    }
    if (dataFim && dataFim < dataInicio) return "A data de fim não pode ser antes da data de início.";
    return null;
  };

  const salvar = async () => {
    const problema = problemaNoFormulario();
    if (problema) {
      Alert.alert("Confira os dados", problema);
      return;
    }

    const payload: ItemRotinaPayload = {
      nome: nome.trim(),
      categoria,
      dosagem: dosagem.trim() || null,
      frequencia,
      dias_semana: frequencia === "dias_especificos" ? dias : [],
      horarios,
      data_inicio: dataInicio,
      data_fim: dataFim,
      observacoes: observacoes.trim() || null,
      indicado_medico: indicadoMedico,
      lembrete_ativo: lembreteAtivo,
      controle_estoque: controleEstoque,
      estoque_atual: controleEstoque ? inteiroOuNulo(estoqueAtual) : null,
      estoque_alerta: controleEstoque ? inteiroOuNulo(estoqueAlerta) : null,
    };

    setSalvando(true);
    try {
      if (itemId !== undefined) await rotinaService.atualizarItem(itemId, payload);
      else await rotinaService.criarItem(payload);
      await sincronizarLembretesComAviso(lembreteAtivo);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Não foi possível salvar", mensagemDeErro(error, "Tente de novo em instantes."));
    } finally {
      setSalvando(false);
    }
  };

  const excluir = () => {
    if (itemId === undefined) return;
    Alert.alert(
      "Excluir item",
      `Remover "${nome}" da sua rotina? O histórico dos dias anteriores continua salvo.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await rotinaService.excluirItem(itemId);
              await sincronizarLembretesRotina();
              navigation.goBack();
            } catch (error) {
              Alert.alert("Não foi possível excluir", mensagemDeErro(error, "Tente de novo em instantes."));
            }
          },
        },
      ]
    );
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <CabecalhoRotina onVoltar={() => navigation.goBack()} />

        {carregando ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={palette.purple} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { gap: 16 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text style={styles.titulo}>{editando ? "Editar item" : "Adicionar item"}</Text>
              <Text style={styles.subtitulo}>
                Inclua um suplemento, vitamina ou medicamento na sua rotina.
              </Text>
            </View>

            <Campo icone="pill" rotulo="Nome do item">
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Ômega 3"
                placeholderTextColor={palette.textMuted}
                maxLength={80}
              />
            </Campo>

            <View style={{ gap: 8 }}>
              <Text style={styles.rotulo}>Categoria</Text>
              <View style={styles.chips}>
                {ORDEM_CATEGORIAS.map((opcao) => (
                  <Chip
                    key={opcao}
                    texto={CATEGORIAS[opcao].rotulo}
                    icone={CATEGORIAS[opcao].icone}
                    ativo={categoria === opcao}
                    onPress={() => setCategoria(opcao)}
                  />
                ))}
              </View>
            </View>

            <Campo icone="beaker-outline" rotulo="Dosagem">
              <TextInput
                style={styles.input}
                value={dosagem}
                onChangeText={setDosagem}
                placeholder="Ex.: 1 cápsula, 500 mg, 1 comprimido"
                placeholderTextColor={palette.textMuted}
                maxLength={60}
              />
            </Campo>

            <Campo icone="sync" rotulo="Frequência">
              <View style={styles.chips}>
                <Chip
                  texto="Todos os dias"
                  ativo={frequencia === "todos_os_dias"}
                  onPress={() => escolherFrequencia("todos_os_dias")}
                />
                <Chip
                  texto="Dias específicos"
                  ativo={frequencia === "dias_especificos"}
                  onPress={() => escolherFrequencia("dias_especificos")}
                />
              </View>
            </Campo>

            <Campo icone="clock-outline" rotulo="Horários">
              <View style={styles.chips}>
                {horarios.map((horario) => (
                  <View key={horario} style={styles.chip}>
                    <Text style={styles.chipTexto}>{horario}</Text>
                    <TouchableOpacity
                      onPress={() => setHorarios((lista) => lista.filter((h) => h !== horario))}
                      hitSlop={8}
                      accessibilityLabel={`Remover ${horario}`}
                    >
                      <MaterialCommunityIcons name="close" size={15} color={palette.purpleDark} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.chip, styles.chipAdicionar]}
                  onPress={() => setSeletor("horario")}
                  accessibilityLabel="Adicionar horário"
                >
                  <MaterialCommunityIcons name="plus" size={18} color={palette.purpleDark} />
                </TouchableOpacity>
              </View>
            </Campo>

            <Campo icone="calendar-week" rotulo="Dias da semana">
              <View style={styles.dias}>
                {DIAS_SEMANA_CURTO.map((letra, dia) => {
                  const ativo = frequencia === "todos_os_dias" || dias.includes(dia);
                  return (
                    <TouchableOpacity
                      key={dia}
                      style={[styles.dia, ativo && styles.diaAtivo]}
                      onPress={() => alternarDia(dia)}
                      accessibilityLabel={DIAS_SEMANA_NOME[dia]}
                      accessibilityState={{ selected: ativo }}
                    >
                      <Text style={[styles.diaTexto, ativo && styles.diaTextoAtivo]}>{letra}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Campo>

            <Campo icone="calendar-range">
              <View style={styles.datas}>
                <View style={styles.dataCampo}>
                  <Text style={styles.rotulo}>Data de início</Text>
                  <TouchableOpacity style={styles.dataBotao} onPress={() => setSeletor("inicio")}>
                    <Text style={styles.dataTexto}>{dataCurta(dataInicio)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dataCampo}>
                  <Text style={styles.rotulo} numberOfLines={1}>
                    Data de fim (opcional)
                  </Text>
                  <TouchableOpacity style={styles.dataBotao} onPress={() => setSeletor("fim")}>
                    <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={palette.textMuted} />
                    <Text style={[styles.dataTexto, !dataFim && styles.dataPlaceholder]}>
                      {dataFim ? dataCurta(dataFim) : "Selecionar"}
                    </Text>
                    {dataFim && (
                      <TouchableOpacity
                        onPress={() => setDataFim(null)}
                        hitSlop={8}
                        accessibilityLabel="Limpar data de fim"
                      >
                        <MaterialCommunityIcons name="close" size={15} color={palette.purpleDark} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Campo>

            <Interruptor
              icone="shield-check-outline"
              titulo="Indicado por médico"
              descricao="Esse item foi prescrito por um profissional de saúde."
              valor={indicadoMedico}
              onMudar={setIndicadoMedico}
            />
            <Interruptor
              icone="bell-outline"
              titulo="Ativar lembrete"
              descricao="Receba notificações nos horários selecionados."
              valor={lembreteAtivo}
              onMudar={setLembreteAtivo}
            />
            <Interruptor
              icone="package-variant-closed"
              titulo="Controle de estoque (opcional)"
              descricao="Avise quando estiver acabando."
              valor={controleEstoque}
              onMudar={setControleEstoque}
            />

            {controleEstoque && (
              <View style={styles.estoqueLinha}>
                <View style={styles.dataCampo}>
                  <Text style={styles.rotulo}>Quantidade atual</Text>
                  <TextInput
                    style={styles.input}
                    value={estoqueAtual}
                    onChangeText={(texto) => setEstoqueAtual(texto.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    placeholder="Ex.: 30"
                    placeholderTextColor={palette.textMuted}
                    maxLength={4}
                  />
                </View>
                <View style={styles.dataCampo}>
                  <Text style={styles.rotulo}>Avisar quando restar</Text>
                  <TextInput
                    style={styles.input}
                    value={estoqueAlerta}
                    onChangeText={(texto) => setEstoqueAlerta(texto.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    placeholder="Ex.: 5"
                    placeholderTextColor={palette.textMuted}
                    maxLength={3}
                  />
                </View>
              </View>
            )}

            <Campo icone="note-text-outline" rotulo="Observações">
              <TextInput
                style={[styles.input, styles.inputMultilinha]}
                value={observacoes}
                onChangeText={setObservacoes}
                placeholder="Ex.: tomar depois do café da manhã"
                placeholderTextColor={palette.textMuted}
                multiline
                maxLength={500}
              />
            </Campo>

            <TouchableOpacity
              style={[styles.botaoPrimario, salvando && styles.desabilitado]}
              onPress={salvar}
              disabled={salvando}
              activeOpacity={0.9}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.botaoPrimarioTexto}>Salvar item</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {editando && (
              <TouchableOpacity style={styles.botaoSecundario} onPress={excluir}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={palette.error} />
                <Text style={[styles.botaoSecundarioTexto, styles.botaoPerigoTexto]}>Excluir item</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <SeletorDataHora
        visivel={seletor !== null}
        modo={seletor === "horario" ? "time" : "date"}
        valor={valorDoSeletor()}
        minimo={seletor === "fim" ? dataDeISO(dataInicio) : undefined}
        onConfirmar={confirmarSeletor}
        onCancelar={() => setSeletor(null)}
      />
    </AppBackground>
  );
}

function Campo({
  icone,
  rotulo,
  children,
}: {
  icone: string;
  rotulo?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.campo}>
      <View style={styles.campoIcone}>
        <MaterialCommunityIcons name={icone as any} size={21} color={palette.purpleDark} />
      </View>
      <View style={styles.campoCorpo}>
        {!!rotulo && <Text style={styles.rotulo}>{rotulo}</Text>}
        {children}
      </View>
    </View>
  );
}

function Interruptor({
  icone,
  titulo,
  descricao,
  valor,
  onMudar,
}: {
  icone: string;
  titulo: string;
  descricao: string;
  valor: boolean;
  onMudar: (valor: boolean) => void;
}) {
  return (
    <View style={styles.interruptor}>
      <View style={styles.campoIcone}>
        <MaterialCommunityIcons name={icone as any} size={21} color={palette.purpleDark} />
      </View>
      <View style={[styles.campoCorpo, { gap: 1 }]}>
        <Text style={styles.rotulo}>{titulo}</Text>
        <Text style={styles.ajuda}>{descricao}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onMudar}
        trackColor={{ false: "#DDD3DF", true: palette.purpleDark }}
        thumbColor="#FFFFFF"
        accessibilityLabel={titulo}
      />
    </View>
  );
}
