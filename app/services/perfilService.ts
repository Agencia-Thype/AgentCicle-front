import { api } from './api';

export async function getPerfil() {
  try {
    const response = await api.get('/perfil');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
}

export async function updatePerfil(dados: {
  altura: number;
  peso_atual: number;
  objetivo: string;
  data_menstruacao: string;
  duracao_ciclo: number;
}) {
  try {
    const response = await api.put('/perfil', dados);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}
export async function getFaseCiclo() {
  const response = await api.post('/fase-ciclo');
  return response.data;
}

