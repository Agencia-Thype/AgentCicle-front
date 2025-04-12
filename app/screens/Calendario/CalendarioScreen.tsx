import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { calendarioStyles } from "./calendarioStyles";
import { globalStyles } from "../../theme/global";
import { AnimatedLogo } from "../../components/AnimatedLogo";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function CalendarioScreen() {
  const hoje = new Date();
  const navigation = useNavigation();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const anoAtual = hoje.getFullYear();

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const mudarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao;
    if (novoMes > 11) novoMes = 0;
    if (novoMes < 0) novoMes = 11;
    setMesAtual(novoMes);
  };

//   useEffect(() => {
//     const fetchFase = async () => {
//       try {
//         const ciclo = await getFaseCiclo();
//         console.log('Fase atual:', ciclo.fase);
//         // Aqui você pode aplicar a lógica pra colorir os dias do calendário
//       } catch (error) {
//         console.log('Erro ao buscar fase do ciclo:', error);
//       }
//     };
  
//     fetchFase();
//   }, []);

  return (
    <LinearGradient
      colors={["#FFF0F0", "#FFD7D7", "#FDECEC"]}
      style={globalStyles.backgroundGradient}
    >
      <View style={calendarioStyles.container}>
        <AnimatedLogo />

        {/* Cabeçalho com mês */}
        <View style={calendarioStyles.header}>
          <TouchableOpacity onPress={() => mudarMes(-1)}>
            <MaterialIcons name="chevron-left" size={28} color="#5C3B3B" />
          </TouchableOpacity>
          <Text style={calendarioStyles.headerText}>
            {meses[mesAtual]} {anoAtual}
          </Text>
          <TouchableOpacity onPress={() => mudarMes(1)}>
            <MaterialIcons name="chevron-right" size={28} color="#5C3B3B" />
          </TouchableOpacity>
        </View>

        {/* Grade de dias */}
        <FlatList
          data={dias}
          numColumns={7}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <View style={calendarioStyles.diaBox}>
              <Text style={calendarioStyles.diaTexto}>{item}</Text>
            </View>
          )}
          contentContainerStyle={calendarioStyles.grid}
        />
      </View>
    </LinearGradient>
  );
}
