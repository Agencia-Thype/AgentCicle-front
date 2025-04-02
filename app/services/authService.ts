import { api } from './api';

export async function login(email: string, senha: string) {
  const response = await api.post('/login', { email, senha });
  return response.data; // access_token
}

export async function registerUser(data: {
    nome: string;
    email: string;
    senha: string;
    confirmacao_senha: string;
  }) {
    const response = await api.post('/register', data);
    return response.data;
  }
  

export async function validarCodigo(email: string, codigo: string) {
  const response = await api.post('/validar-email', {
    email,
    codigo,
  });
  return response.data;
}
