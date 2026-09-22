import React, { useEffect } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home/HomeScreen";
import ForgotPasswordScreen from "../screens/ForgotPassword/ForgotPasswordScreen";
import LoginScreen from "../screens/login/loginScreen";
import RegisterScreen from "../screens/register/registerScreen";
import ValidarEmailScreen from "../screens/ValidarCodigo/validarEmailScreen";
import { useAuth } from "../contexts/AuthContext";
import CalendarioScreen from "../screens/Calendario/CalendarioScreen";
import PerfilScreen from "../screens/Perfil/PerfilScreen";
import TreinoDoDia from "../screens/Treino/TreinoDoDiaScreen";
import VideoPlayerScreen from "../screens/VideoPlayers/VideoPlayesScreen";
import SintomasScreen from "../screens/Sintomas/SintomasScreen";
import FaseCompletaScreen from "../screens/IA/faseCompletaScreen";
import RelatorioMensalScreen from "../screens/Relatorio/RelatorioMensalScreen";
import DiagnosticoScreen from "../screens/Diagnostico/DiagnosticoScreen";
import KegelScreen from "../screens/Kegel/KegelScreen";
import RotinaScreen from "../screens/Rotina/RotinaScreen";
import AdicionarItemScreen from "../screens/Rotina/AdicionarItemScreen";
import AguaScreen from "../screens/Rotina/AguaScreen";
import HistoricoRotinaScreen from "../screens/Rotina/HistoricoRotinaScreen";
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
  Rotina: undefined;
  /** Sem itemId, cadastra um item novo. */
  AdicionarItemRotina: { itemId?: number } | undefined;
  AguaDoDia: undefined;
  HistoricoRotina: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Telas que funcionam sem sessão (ValidarEmail vem logo após o cadastro).
const ROTAS_PUBLICAS: (keyof RootStackParamList)[] = [
  "Login",
  "Register",
  "ForgotPassword",
  "ValidarEmail",
];

const transparentHeaderOptions = {
  headerTransparent: true,
  headerTitleStyle: { color: "#fff" },
  headerTintColor: "#fff",
};

export function Routes() {
  // A tela inicial é determinada pelo AuthContext (fonte única de verdade
  // do estado de autenticação, já resolvido antes de Routes ser montado).
  const { isAuthenticated } = useAuth();
  const initialRouteName: keyof RootStackParamList = isAuthenticated ? "Home" : "Login";

  // initialRouteName só vale na montagem. Se a sessão acabar depois (token
  // recusado pelo backend, sessão expirada), a pilha continuava nas telas
  // logadas e cada requisição saía sem token: 401 "Not authenticated".
  useEffect(() => {
    if (isAuthenticated || !navigationRef.isReady()) return;
    const rotaAtual = navigationRef.getCurrentRoute()?.name;
    if (rotaAtual && !ROTAS_PUBLICAS.includes(rotaAtual)) {
      navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [isAuthenticated]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
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
          options={{ headerShown: false }}
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
        <Stack.Screen
          name="Rotina"
          component={RotinaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdicionarItemRotina"
          component={AdicionarItemScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AguaDoDia"
          component={AguaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HistoricoRotina"
          component={HistoricoRotinaScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default withPremiumCheck(Routes);
