import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import SintomasScreen from "app/screens/Sintomas/SintomasScreen";



// Tipos das rotas
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  ValidarCodigo: { email: string };
  ValidarEmail: { email: string };
  Calendario: undefined;
  Perfil: undefined;
  TreinoDoDia: undefined;
  VideoPlayer: { url: string };
  Sintomas: undefined; 
};

// Stack Navigator tipado
const Stack = createNativeStackNavigator<RootStackParamList>();

// Configuração de header transparente para reutilizar
const transparentHeaderOptions = {
  headerTransparent: true,
  headerTitleStyle: { color: "#fff" },
  headerTintColor: "#fff", // seta de voltar
};

export function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
          options={{ title: "Validar Código", ...transparentHeaderOptions }}
        />
        <Stack.Screen
          name="ValidarEmail"
          component={ValidarEmailScreen}
          options={{ title: "Validar E-mail" }}
        />
        <Stack.Screen
          name="Calendario"
          component={CalendarioScreen}
          options={{ title: "Calendário" }}
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
          options={{ title: "Treino do Dia" }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{ title: "Vídeo do Exercício" }}
        />
        <Stack.Screen name="Sintomas" component={SintomasScreen} options={{ title: "Sintomas" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
