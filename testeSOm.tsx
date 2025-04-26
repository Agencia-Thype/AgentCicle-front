import React from 'react';
import { View, Button } from 'react-native';
import { Audio } from 'expo-av';

export default function TesteSom() {
  const tocarSom = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/beep_execucao.mp3') // caminho real do arquivo
      );
      await sound.playAsync();
    } catch (error) {
      console.warn("Erro ao carregar som:", error);
    }
  };

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="Testar Som" onPress={tocarSom} />
    </View>
  );
}
