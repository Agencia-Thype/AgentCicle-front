import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from '../../theme/global';
import Toast from 'react-native-toast-message';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ValidarEmail'>;

export default function ValidarEmailScreen({ navigation }: Props) {
  const logoRef = useRef(null);
  const nav = useNavigation();
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [codigo, setCodigo] = useState('');
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    const unsubscribe = nav.addListener('beforeRemove', (e) => {
      e.preventDefault();
      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          unsubscribe();
          nav.dispatch(e.data.action);
        });
      } else {
        nav.dispatch(e.data.action);
      }
    });
    return unsubscribe;
  }, [nav]);

  const handleValidarEmail = async () => {
    if (!codigo) {
      return Toast.show({
        type: 'error',
        text1: 'Código obrigatório',
        text2: 'Digite o código que você recebeu por e-mail.',
      });
    }

    try {
      await axios.post('http://10.0.2.2:8000/validar-email', { email, codigo });

      Toast.show({
        type: 'success',
        text1: 'E-mail validado com sucesso!',
      });

      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          navigation.navigate('Login');
        });
      } else {
        navigation.navigate('Login');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.detail || 'Erro ao validar e-mail.',
      });
    }
  };

  const handleReenviarCodigo = async () => {
    setReenviando(true);
    try {
      await axios.post('http://10.0.2.2:8000/enviar-codigo', { email });
      Toast.show({
        type: 'success',
        text1: 'Código reenviado',
        text2: 'Verifique sua caixa de e-mail',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao reenviar',
        text2: error.response?.data?.detail || 'Tente novamente em instantes.',
      });
    } finally {
      setTimeout(() => setReenviando(false), 3000); // desativa temporariamente
    }
  };

  return (
    <LinearGradient
      colors={['#68d1c9', '#b4f0ec', '#c695da', '#a460bf', '#931b9a']}
      style={globalStyles.backgroundGradient}
    >
      <Animatable.Image
        ref={logoRef}
        animation="fadeInDown"
        duration={1000}
        source={require('../../assets/logo.png')}
        style={{
          width: 100,
          height: 100,
          alignSelf: 'center',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        resizeMode="contain"
      />

      <Text style={globalStyles.title}>Validar E-mail</Text>
      <Text style={globalStyles.subtitle}>
        Digite o código que foi enviado para:
        {"\n"}
        <Text style={{ fontWeight: 'bold', color: '#fff' }}>{email}</Text>
      </Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Código de verificação"
        keyboardType="numeric"
        value={codigo}
        onChangeText={setCodigo}
      />

      <TouchableOpacity style={globalStyles.button} onPress={handleValidarEmail}>
        <Text style={globalStyles.buttonText}>Validar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleReenviarCodigo}
        disabled={reenviando}
      >
        <Text style={globalStyles.link}>
          {reenviando ? 'Reenviando...' : 'Reenviar código'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
