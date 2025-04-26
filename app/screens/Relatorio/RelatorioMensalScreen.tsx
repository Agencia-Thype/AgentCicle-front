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
import { LinearGradient } from "expo-linear-gradient";
import { globalStyles, themeColors } from "../../theme/global";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "../../services/api";

const screenWidth = Dimensions.get("window").width;

export default function RelatorioMensalScreen() {
  const navigation = useNavigation();
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarRelatorio = async () => {
      try {
        const now = new Date();
        const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
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
    { nome: "menstruacao", titulo: "🌑 Menstruação", cor: "#A56C6C" },
    { nome: "folicular", titulo: "🌒 Folicular", cor: "#7EAA92" },
    { nome: "ovulatoria", titulo: "🌕 Ovulatória", cor: "#F4B860" },
    { nome: "lutea", titulo: "🌘 Lútea", cor: "#B283A3" },
  ];

  const percentuais = fases.map(
    (fase) => relatorio?.[fase.nome]?.percentual_medio || 0
  );

  return (
    <LinearGradient
      colors={themeColors.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={globalStyles.backgroundGradient}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ position: "absolute", top: 48, left: 16, zIndex: 10 }}
      >
        <MaterialIcons name="arrow-back" size={22} color="#5C3B3B" />
      </TouchableOpacity>

      <ScrollView style={{ paddingTop: 80, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#5C3B3B",
            marginBottom: 16,
          }}
        >
          Comparativo por fase
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={themeColors.button} />
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {fases.map((fase) => {
                const dados = relatorio?.[fase.nome];
                return (
                  <View
                    key={fase.nome}
                    style={{
                      backgroundColor: "#FFFFFFDD",
                      borderRadius: 16,
                      padding: 14,
                      width: "48%",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: fase.cor,
                      }}
                    >
                      {fase.titulo}
                    </Text>
                    {dados?.dias_com_treino > 0 ? (
                      <>
                        <Text style={{ marginTop: 4 }}>
                          Dias com treino: {dados.dias_com_treino}
                        </Text>
                        <Text style={{ color: "#5C3B3B", fontWeight: "600" }}>
                          Percentual médio:{" "}
                          <Text style={{ color: fase.cor }}>
                            {dados.percentual_medio}%
                          </Text>
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={{
                          fontStyle: "italic",
                          color: "#999",
                          marginTop: 4,
                        }}
                      >
                        Nenhum treino registrado.
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <BarChart
              data={{
                labels: ["Menstruação", "Folicular", "Ovulatória", "Lútea"],
                datasets: [{ data: percentuais }],
              }}
              width={screenWidth - 32}
              height={180}
              yAxisLabel="" // 👈 Adicione isso
              yAxisSuffix="%"
              fromZero
              chartConfig={{
                backgroundGradientFrom: "#FFF",
                backgroundGradientTo: "#FFF",
                decimalPlaces: 0,
                color: () => "#B283A3",
                labelColor: () => "#5C3B3B",
                fillShadowGradient: "#B283A3",
                fillShadowGradientOpacity: 1,
              }}
              style={{
                marginTop: 20,
                borderRadius: 12,
                alignSelf: "center",
              }}
            />

            {/* Sentimentos mais frequentes */}
            <Text
              style={{ marginTop: 20, fontWeight: "600", color: "#5C3B3B" }}
            >
              Sentimentos mais frequentes
            </Text>
            <Text style={{ fontSize: 16, marginTop: 6 }}>
              🥺 Cansada 🧘‍♀️ Calma 😠 Irritada
            </Text>

            {/* Mensagem motivacional */}
            <View
              style={{
                backgroundColor: "#fff8f8",
                borderRadius: 16,
                padding: 16,
                marginTop: 24,
              }}
            >
              <Text
                style={{ fontWeight: "600", fontSize: 14, color: "#5C3B3B" }}
              >
                Você esteve mais ativa na fase{" "}
                <Text style={{ fontWeight: "bold", color: "#7EAA92" }}>
                  Folicular
                </Text>{" "}
                este mês, com <Text style={{ fontWeight: "bold" }}>90%</Text> de
                treinos concluídos e sentimentos como{" "}
                <Text style={{ fontWeight: "bold" }}>calma</Text> e{" "}
                <Text style={{ fontWeight: "bold" }}>alívio</Text>. Continue
                assim! 🌸
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
