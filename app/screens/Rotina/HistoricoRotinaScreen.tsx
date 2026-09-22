import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AppBackground from "../../components/AppBackground";
import type { RootStackParamList } from "../../navigation";
import { rotinaService, type DiaHistorico, type HistoricoRotina } from "../../services/rotinaService";
import { palette } from "../../theme/colors";
import { BarraInferior, CabecalhoRotina } from "./RotinaComponentes";
import { DIAS_SEMANA_CURTO, dataDeISO, dataPorExtenso, formatarLitros } from "./rotinaFormato";
import { rotinaStyles as styles } from "./rotinaStyles";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "HistoricoRotina">;
type Periodo = 7 | 30;

const MAX_ESQUECIDAS = 12;

interface Coluna {
  chave: string;
  /** 0 a 100; null quando não havia nada previsto no dia. */
  valor: number | null;
  cor: string;
  rotulo: string;
}

export default function HistoricoRotinaScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [periodo, setPeriodo] = useState<Periodo>(7);
  const [historico, setHistorico] = useState<HistoricoRotina | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    rotinaService
      .historico(periodo)
      .then((dados) => {
        if (!ativo) return;
        setHistorico(dados);
        setFalhou(false);
      })
      .catch((error) => {
        console.warn("Erro ao carregar o histórico da rotina:", error);
        if (ativo) setFalhou(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [periodo, tentativa]);

  const ir = (rota: string) => navigation.navigate(rota as never);

  /** Rótulo do eixo: letra do dia na semana; no mês, só alguns números para não embolar. */
  const rotuloDoDia = (dia: DiaHistorico, indice: number, total: number) => {
    const data = dataDeISO(dia.data);
    if (periodo === 7) return DIAS_SEMANA_CURTO[data.getDay()];
    return indice % 5 === 0 || indice === total - 1 ? String(data.getDate()) : "";
  };

  const cronologico = historico ? [...historico.dias].reverse() : [];
  const meta = historico?.resumo.meta_agua_ml ?? 0;

  const colunasDoses: Coluna[] = cronologico.map((dia, indice) => ({
    chave: dia.data,
    valor: dia.adesao,
    cor: dia.adesao === 100 ? palette.sage : palette.purple,
    rotulo: rotuloDoDia(dia, indice, cronologico.length),
  }));

  const colunasAgua: Coluna[] = cronologico.map((dia, indice) => ({
    chave: dia.data,
    valor: meta ? Math.min(100, Math.round((dia.agua_ml / meta) * 100)) : 0,
    cor: dia.bateu_meta_agua ? palette.sage : palette.purpleLight,
    rotulo: rotuloDoDia(dia, indice, cronologico.length),
  }));

  const esquecidas = historico
    ? historico.dias
        .flatMap((dia) => dia.esquecidas.map((dose) => ({ ...dose, data: dia.data })))
        .slice(0, MAX_ESQUECIDAS)
    : [];

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
            <Text style={styles.titulo}>Seu histórico</Text>
            <Text style={styles.subtitulo}>Constância que vira cuidado.</Text>
          </View>

          <View style={styles.alternador}>
            {([7, 30] as Periodo[]).map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[styles.alternadorOpcao, periodo === opcao && styles.alternadorAtivo]}
                onPress={() => setPeriodo(opcao)}
                accessibilityState={{ selected: periodo === opcao }}
              >
                <Text style={[styles.alternadorTexto, periodo === opcao && styles.alternadorTextoAtivo]}>
                  {opcao} dias
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {carregando && !historico ? (
            <ActivityIndicator size="large" color={palette.purple} style={{ marginTop: 40 }} />
          ) : falhou || !historico ? (
            <View style={styles.card}>
              <Text style={styles.vazioTitulo}>Não foi possível carregar</Text>
              <Text style={styles.vazioTexto}>Verifique sua conexão e tente de novo.</Text>
              <TouchableOpacity
                style={[styles.botaoSecundario, { marginTop: 12 }]}
                onPress={() => setTentativa((n) => n + 1)}
              >
                <Text style={styles.botaoSecundarioTexto}>Tentar de novo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[{ gap: 12 }, carregando && styles.desabilitado]}>
              <View style={styles.metricas}>
                <Metrica
                  valor={historico.resumo.adesao === null ? "—" : `${historico.resumo.adesao}%`}
                  rotulo="das doses tomadas"
                />
                <Metrica
                  valor={String(historico.sequencia_rotina)}
                  rotulo={`dia${historico.sequencia_rotina === 1 ? "" : "s"} seguidos com tudo tomado`}
                />
                <Metrica
                  valor={`${historico.resumo.dias_meta_agua}/${historico.dias.length}`}
                  rotulo="dias na meta de água"
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.secaoTitulo}>Doses por dia</Text>
                {historico.resumo.doses_previstas === 0 ? (
                  <Text style={[styles.vazioTexto, { marginVertical: 12 }]}>
                    Nenhuma dose prevista nesse período.
                  </Text>
                ) : (
                  <>
                    <Text style={styles.ajuda}>
                      {historico.resumo.doses_tomadas} de {historico.resumo.doses_previstas} doses tomadas
                    </Text>
                    <Grafico colunas={colunasDoses} />
                  </>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.secaoTitulo}>Hidratação</Text>
                <Text style={styles.ajuda}>
                  Média de {formatarLitros(historico.resumo.media_agua_ml)} por dia · meta de{" "}
                  {formatarLitros(meta)} · sequência de {historico.sequencia_agua} dia
                  {historico.sequencia_agua === 1 ? "" : "s"}
                </Text>
                <Grafico colunas={colunasAgua} />
              </View>

              {historico.itens.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.secaoTitulo}>Por item</Text>
                  {historico.itens.map((item, indice) => (
                    <View key={item.item_id} style={[styles.doseLinha, indice > 0 && styles.doseSeparador]}>
                      <View style={styles.doseCopy}>
                        <View style={styles.linhaEntre}>
                          <Text style={styles.doseNome} numberOfLines={1}>
                            {item.nome}
                          </Text>
                          <Text style={styles.doseDetalhe}>
                            {item.tomadas}/{item.previstas}
                          </Text>
                        </View>
                        <View style={[styles.linha, { marginTop: 6 }]}>
                          <View style={styles.progresso}>
                            <View
                              style={[
                                styles.progressoPreenchido,
                                { width: `${item.adesao ?? 0}%` },
                                item.adesao === 100 && { backgroundColor: palette.sage },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.card}>
                <Text style={styles.secaoTitulo}>O que ficou para trás</Text>
                {esquecidas.length === 0 ? (
                  <Text style={[styles.vazioTexto, { marginVertical: 12 }]}>
                    Nada esquecido nesse período. Que constância!
                  </Text>
                ) : (
                  esquecidas.map((dose, indice) => (
                    <View
                      key={`${dose.data}-${dose.item_id}-${dose.horario}`}
                      style={[styles.doseLinha, indice > 0 && styles.doseSeparador]}
                    >
                      <MaterialCommunityIcons name="alert-circle-outline" size={18} color={palette.goldDark} />
                      <View style={styles.doseCopy}>
                        <Text style={styles.doseNome} numberOfLines={1}>
                          {dose.nome}
                        </Text>
                        <Text style={styles.doseDetalhe}>
                          {dataPorExtenso(dose.data)} · {dose.horario}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}
        </ScrollView>

        <BarraInferior ir={ir} />
      </View>
    </AppBackground>
  );
}

function Metrica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.metrica}>
      <Text style={styles.metricaValor}>{valor}</Text>
      <Text style={styles.metricaRotulo}>{rotulo}</Text>
    </View>
  );
}

function Grafico({ colunas }: { colunas: Coluna[] }) {
  return (
    <View style={styles.grafico}>
      {colunas.map((coluna) => (
        <View key={coluna.chave} style={styles.barraColuna}>
          <View style={styles.barraTrilho}>
            {coluna.valor !== null && coluna.valor > 0 && (
              <View
                style={[
                  styles.barraPreenchida,
                  // Um mínimo visível para "tomou pouco" não sumir no gráfico.
                  { height: `${Math.max(coluna.valor, 6)}%`, backgroundColor: coluna.cor },
                ]}
              />
            )}
          </View>
          <Text style={styles.barraRotulo}>{coluna.rotulo}</Text>
        </View>
      ))}
    </View>
  );
}
