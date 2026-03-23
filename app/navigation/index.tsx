import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "../screens/Home/HomeScreen";
import ForgotPasswordScreen from "../screens/ForgotPassword/ForgotPasswordScreen";
import LoginScreen from "../screens/login/loginScreen";
import RegisterScreen from "../screens/register/registerScreen";
import ValidarCodigoScreen from "../screens/ValidarCodigo/validarCodigoScreen";
import ValidarEmailScreen from "../screens/ValidarCodigo/validarEmailScreen";
import CalendarioScreen from "../screens/Calendario/CalendarioScreen";
import PerfilScreen from "../screens/Perfil/PerfilScreen";
import TreinoDoDia from "../screens/Treino/TreinoDoDiaScreen";
import VideoPlayerScreen from "../screens/VideoPlayers/VideoPlayesScreen";
import SintomasScreen from "../screens/Sintomas/SintomasScreen";
import FaseCompletaScreen from "../screens/IA/faseCompletaScreen";
import RelatorioMensalScreen from "../screens/Relatorio/RelatorioMensalScreen";
import DiagnosticoScreen from "../screens/Diagnostico/DiagnosticoScreen";
import KegelScreen from "../screens/Kegel/KegelScreen";
import { withPremiumCheck } from "../utils/withPremiumCheck";

// Tipos das rotas
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home:
    | {
        showTrialBanner?: boolean;
        justLoggedIn?: boolean;
        forceStatusCheck?: boolean;
      }
    | undefined;
  ForgotPassword: undefined;
  ValidarCodigo: { email: string };
  ValidarEmail: { email: string };
  Calendario: undefined;
  Perfil: undefined;
  TreinoDoDia: undefined;
  VideoPlayer: { url: string };
  Sintomas: undefined;
  FaseCompletaScreen: undefined;
  RelatorioMensal: undefined;
  Diagnostico: undefined;
  Kegel: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const transparentHeaderOptions = {
  headerTransparent: true,
  headerTitleStyle: { color: "#fff" },
  headerTintColor: "#fff",
};

export function Routes() {
  // Determinar a tela inicial baseada na autenticação
  const [initialRouteName, setInitialRouteName] =
    useState<keyof RootStackParamList>("Login");
  const [isReady, setIsReady] = useState(false);

  // Verificar autenticação ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");

        if (token) {
          console.log("Token encontrado, iniciando na Home");
          setInitialRouteName("Home");
        } else {
          console.log("Nenhum token encontrado, iniciando no Login");
          setInitialRouteName("Login");
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        setInitialRouteName("Login");
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  // Mostrar nada enquanto verifica autenticação
  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Cadastro", ...transparentHeaderOptions }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: "Recuperar Senha", ...transparentHeaderOptions }}
        />
        <Stack.Screen
          name="ValidarCodigo"
          component={ValidarCodigoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ValidarEmail"
          component={ValidarEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Calendario"
          component={CalendarioScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            headerTitle: "",
            headerTransparent: true,
            headerTintColor: "#5C3B3B",
          }}
        />
        <Stack.Screen
          name="TreinoDoDia"
          component={TreinoDoDia}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Sintomas"
          component={SintomasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FaseCompletaScreen"
          component={withPremiumCheck(FaseCompletaScreen)}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RelatorioMensal"
          component={withPremiumCheck(RelatorioMensalScreen)}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Diagnostico"
          component={DiagnosticoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Kegel"
          component={KegelScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default withPremiumCheck(Routes);
