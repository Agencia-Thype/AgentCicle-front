import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "../../services/api";
import AppBackground from "../../components/AppBackground";
import { palette } from "../../theme/colors";
import { fonts } from "../../theme/fonts";

const screenWidth = Dimensions.get("window").width;

export default function RelatorioMensalScreen() {
  const navigation = useNavigation();
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarRelatorio = async () => {
      try {
        const now = new Date();
        const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const response = await api.get(`/relatorio/mensal?mes=${mes}`);
        setRelatorio(response.data);
      } catch (error) {
        console.error("Erro ao buscar relatório:", error);
      } finally {
        setLoading(false);
      }
    };
    buscarRelatorio();
  }, []);

  const fases = [
    { nome: "menstruacao", titulo: "Menstruação", cor: palette.error },
    { nome: "folicular", titulo: "Folicular", cor: palette.sageLight },
    { nome: "ovulatoria", titulo: "Ovulatória", cor: palette.gold },
    { nome: "lutea", titulo: "Lútea", cor: palette.textSecondary },
  ];

  const percentuais = fases.map((fase) => relatorio?.[fase.nome]?.percentual_medio || 0);

  return (
    <AppBackground>
      <ScrollView style={{ paddingTop: 80, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: palette.gold, marginBottom: 16, fontFamily: fonts.title }}>
          Relatório do Mês
        </Text>
        <Text style={{ fontSize: 16, color: palette.textSecondary, marginBottom: 20 }}>
          Comparativo por fase
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={palette.purple} />
        ) : (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {fases.map((fase) => {
                const dados = relatorio?.[fase.nome];
                return (
                  <View
                    key={fase.nome}
                    style={{
                      backgroundColor: "rgba(130, 87, 219, 0.11)",
                      borderRadius: 16,
                      padding: 14,
                      width: "48%",
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "rgba(130, 87, 219, 0.4)",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 15, color: fase.cor, marginBottom: 6 }}>
                      {fase.titulo}
                    </Text>
                    {dados?.dias_com_treino > 0 ? (
                      <>
                        <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
                          Dias com treino: {dados.dias_com_treino}
                        </Text>
                        <Text style={{ color: palette.textSecondary, fontWeight: "600", fontSize: 13 }}>
                          Média:{" "}
                          <Text style={{ color: fase.cor }}>{dados.percentual_medio}%</Text>
                        </Text>
                      </>
                    ) : (
                      <Text style={{ fontStyle: "italic", color: "rgba(43, 27, 68, 0.5)", marginTop: 4, fontSize: 13 }}>
                        Nenhum treino registrado.
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <BarChart
              data={{
                labels: ["Mens.", "Folic.", "Ovul.", "Lútea"],
                datasets: [{ data: percentuais }],
              }}
              width={screenWidth - 32}
              height={180}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero
              chartConfig={{
                backgroundGradientFrom: palette.bgSoft,
                backgroundGradientTo: palette.bgDeep,
                decimalPlaces: 0,
                color: () => palette.purple,
                labelColor: () => palette.textSecondary,
                fillShadowGradient: palette.purple,
                fillShadowGradientOpacity: 1,
              }}
              style={{ marginTop: 20, borderRadius: 12, alignSelf: "center" }}
            />

            <Text style={{ marginTop: 20, fontWeight: "600", color: palette.gold, fontSize: 15 }}>
              Sentimentos mais frequentes
            </Text>
            <Text style={{ fontSize: 15, marginTop: 6, color: palette.textSecondary }}>
              Cansada · Calma · Irritada
            </Text>

            <View style={{
              backgroundColor: "rgba(130, 87, 219, 0.11)",
              borderRadius: 16,
              padding: 16,
              marginTop: 24,
              marginBottom: 40,
              borderWidth: 1,
              borderColor: "rgba(130, 87, 219, 0.4)",
            }}>
              <Text style={{ fontWeight: "600", fontSize: 14, color: palette.textSecondary }}>
                Você esteve mais ativa na fase{" "}
                <Text style={{ fontWeight: "bold", color: palette.sageLight }}>Folicular</Text>{" "}
                este mês, com <Text style={{ fontWeight: "bold", color: palette.gold }}>90%</Text> de
                treinos concluídos. Continue assim!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </AppBackground>
  );
}
