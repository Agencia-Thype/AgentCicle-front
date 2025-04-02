import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation';
import { globalStyles } from '../../theme/global';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const logoRef = useRef(null);
  const nav = useNavigation();

  useEffect(() => {
    const unsubscribe = nav.addListener('beforeRemove', (e) => {
      e.preventDefault();

      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          unsubscribe(); // remove listener para evitar acúmulo
          nav.dispatch(e.data.action);
        });
      } else {
        nav.dispatch(e.data.action);
      }
    });

    return unsubscribe;
  }, [nav]);

  const handleSubmit = async () => {
    try {
      await axios.post('http://10.0.2.2:8000/enviar-codigo', { email });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Código enviado para seu e-mail.',
      });

      if (logoRef.current) {
        (logoRef.current as any).fadeOutUp(500).then(() => {
          navigation.navigate('ValidarCodigo', { email });
        });
      } else {
        navigation.navigate('ValidarCodigo', { email });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.detail || 'Erro ao enviar código.',
      });
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

      <Text style={globalStyles.title}>Recuperar senha</Text>
      <Text style={globalStyles.subtitle}>
        Informe seu e-mail para enviarmos o código de verificação
      </Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>Enviar código</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
