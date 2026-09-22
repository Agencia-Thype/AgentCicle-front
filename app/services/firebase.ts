import { getApps, getApp, initializeApp } from "firebase/app";
// @ts-expect-error getReactNativePersistence existe no build React Native do
// Firebase (resolvido pelo Metro via package.json "react-native"), mas não
// está presente nos types gerados para o build padrão. Ver firebase/firebase-js-sdk#9316.
// No target web, o Metro resolve o build browser (sem essa função) - por isso
// o fallback para getAuth() abaixo é necessário, não só um detalhe de tipos.
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const apiKey = Platform.select({
  android: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY,
  ios: process.env.EXPO_PUBLIC_FIREBASE_IOS_API_KEY,
  default: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
}) || process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

const appId = Platform.select({
  android: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_APP_ID,
  ios: process.env.EXPO_PUBLIC_FIREBASE_IOS_APP_ID,
  default: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}) || process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId,
};

if (!firebaseConfig.apiKey) {
  console.warn(
    "[firebase] EXPO_PUBLIC_FIREBASE_* não configurado no .env - autenticação não vai funcionar até isso ser preenchido."
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function criarAuth() {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Build web (sem getReactNativePersistence) ou Fast Refresh (já inicializado)
    try {
      return getAuth(firebaseApp);
    } catch (e) {
      console.error("[firebase] Falha ao inicializar o Auth:", e);
      return getAuth();
    }
  }
}

export const auth = criarAuth();
