import { api } from './api';
import Toast from 'react-native-toast-message';

export async function login(email: string, senha: string): Promise<{ access_token: string } | null> {
  try {
    const response = await api.post('/login', { email, senha });
    return response.data;
  } catch (error: any) {
    console.log('Erro no login:', error);
    Toast.show({
      type: 'error',
      text1: 'Erro no login',
      text2: 'E-mail ou senha inválidos.',
    });
    return null;
  }
}

export async function registerUser(data: {
  nome: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
}): Promise<any | null> {
  try {
    const response = await api.post('/register', data);
    return response.data;
  } catch (error: any) {
    console.log('Erro no cadastro:', error);
    Toast.show({
      type: 'error',
      text1: 'Erro no cadastro',
      text2: error?.response?.data?.detail || 'Verifique os dados e tente novamente.',
    });
    return null;
  }
}

export async function validarCodigo(email: string, codigo: string): Promise<any | null> {
  try {
    const response = await api.post('/validar-email', {
      email,
      codigo,
    });
    return response.data;
  } catch (error: any) {
    console.log('Erro na validação do código:', error);
    Toast.show({
      type: 'error',
      text1: 'Código inválido',
      text2: 'Verifique o código enviado para o seu e-mail.',
    });
    return null;
  }
}
