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
            marginBottom: 20,
          }}
        >
          Relatório do Mês 🌙
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={themeColors.button} />
        ) : (
          fases.map((fase) => {
            const dados = relatorio?.[fase.nome];
            return (
              <View
                key={fase.nome}
                style={{
                  backgroundColor: "#FFF5F5",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 8,
                    color: "#5C3B3B",
                  }}
                >
                  {fase.titulo}
                </Text>

                {dados?.dias_com_treino > 0 ? (
                  <>
                    <Text style={{ marginBottom: 4 }}>
                      Dias com treino: {dados.dias_com_treino}
                    </Text>
                    <Text style={{ marginBottom: 4 }}>
                      Percentual médio: {dados.percentual_medio}%
                    </Text>

                    <BarChart
                      data={{
                        labels: Array.from(
                          { length: dados.dias_com_treino },
                          (_, i) => `${i + 1}`
                        ),
                        datasets: [
                          {
                            data: Array.from(
                              { length: dados.dias_com_treino },
                              () => dados.percentual_medio
                            ),
                          },
                        ],
                      }}
                      width={screenWidth - 64} // margem para alinhar com padding do card
                      height={120}
                      yAxisSuffix="%"
                      yAxisLabel=""
                      fromZero
                      withInnerLines={false}
                      withVerticalLabels={false}
                      chartConfig={{
                        backgroundGradientFrom: "#FFF5F5",
                        backgroundGradientTo: "#FFF5F5",
                        color: () => fase.cor, // manter a cor por fase
                        labelColor: () => "#5C3B3B",
                        barPercentage: 0.5,
                        decimalPlaces: 0,
                        fillShadowGradient: fase.cor, // cor da barra
                        fillShadowGradientOpacity: 1,  // 💡 opacidade total da barra
                        propsForBackgroundLines: {
                          stroke: "transparent",
                        },
                      }}
                      style={{
                        marginTop: 4,
                        borderRadius: 12,
                        alignSelf: "center",
                      }}
                    />

                    <Text style={{ marginTop: 8 }}>
                      Sentimentos:{" "}
                      {dados.sentimentos_frequentes.join(", ") || "-"}
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontStyle: "italic", color: "#888" }}>
                    Nenhum treino registrado nessa fase.
                  </Text>
                )}
              </View>
            );
          })
        )}

        {relatorio && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 16,
              color: "#5C3B3B",
            }}
          >
            🌸 Lembre-se: cada fase tem sua beleza. Obrigada por se cuidar esse
            mês!
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
