import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Routes } from "./navigation";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Routes />
      <Toast />
    </GestureHandlerRootView>
  );
}
