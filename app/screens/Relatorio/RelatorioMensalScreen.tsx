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
    { nome: "menstruacao", titulo: "Menstruação", cor: "#ff6b6b" },
    { nome: "folicular", titulo: "Folicular", cor: "#B1D686" },
    { nome: "ovulatoria", titulo: "Ovulatória", cor: "#FFFAC3" },
    { nome: "lutea", titulo: "Lútea", cor: "#EED0FC" },
  ];

  const percentuais = fases.map((fase) => relatorio?.[fase.nome]?.percentual_medio || 0);

  return (
    <AppBackground>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ position: "absolute", top: 50, left: 16, zIndex: 10, backgroundColor: "rgba(146,96,206,0.3)", borderRadius: 20, padding: 8 }}
      >
        <MaterialIcons name="arrow-back" size={22} color="#EED0FC" />
      </TouchableOpacity>

      <ScrollView style={{ paddingTop: 80, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFAC3", marginBottom: 16, fontFamily: "LobsterTwo_700Bold" }}>
          Relatório do Mês
        </Text>
        <Text style={{ fontSize: 16, color: "#EED0FC", marginBottom: 20 }}>
          Comparativo por fase
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#9260CE" />
        ) : (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {fases.map((fase) => {
                const dados = relatorio?.[fase.nome];
                return (
                  <View
                    key={fase.nome}
                    style={{
                      backgroundColor: "rgba(63, 28, 101, 0.75)",
                      borderRadius: 16,
                      padding: 14,
                      width: "48%",
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "rgba(146, 96, 206, 0.4)",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 15, color: fase.cor, marginBottom: 6 }}>
                      {fase.titulo}
                    </Text>
                    {dados?.dias_com_treino > 0 ? (
                      <>
                        <Text style={{ color: "#EED0FC", fontSize: 13 }}>
                          Dias com treino: {dados.dias_com_treino}
                        </Text>
                        <Text style={{ color: "#EED0FC", fontWeight: "600", fontSize: 13 }}>
                          Média:{" "}
                          <Text style={{ color: fase.cor }}>{dados.percentual_medio}%</Text>
                        </Text>
                      </>
                    ) : (
                      <Text style={{ fontStyle: "italic", color: "rgba(238,208,252,0.5)", marginTop: 4, fontSize: 13 }}>
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
                backgroundGradientFrom: "#3F1C65",
                backgroundGradientTo: "#1A0733",
                decimalPlaces: 0,
                color: () => "#9260CE",
                labelColor: () => "#EED0FC",
                fillShadowGradient: "#9260CE",
                fillShadowGradientOpacity: 1,
              }}
              style={{ marginTop: 20, borderRadius: 12, alignSelf: "center" }}
            />

            <Text style={{ marginTop: 20, fontWeight: "600", color: "#FFFAC3", fontSize: 15 }}>
              Sentimentos mais frequentes
            </Text>
            <Text style={{ fontSize: 15, marginTop: 6, color: "#EED0FC" }}>
              Cansada · Calma · Irritada
            </Text>

            <View style={{
              backgroundColor: "rgba(63, 28, 101, 0.75)",
              borderRadius: 16,
              padding: 16,
              marginTop: 24,
              marginBottom: 40,
              borderWidth: 1,
              borderColor: "rgba(146, 96, 206, 0.4)",
            }}>
              <Text style={{ fontWeight: "600", fontSize: 14, color: "#EED0FC" }}>
                Você esteve mais ativa na fase{" "}
                <Text style={{ fontWeight: "bold", color: "#B1D686" }}>Folicular</Text>{" "}
                este mês, com <Text style={{ fontWeight: "bold", color: "#FFFAC3" }}>90%</Text> de
                treinos concluídos. Continue assim!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </AppBackground>
  );
}
