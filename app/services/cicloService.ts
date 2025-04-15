// cicloService.ts

import { api } from './api';

export async function getFaseCiclo() {
  const response = await api.get('/fase-ciclo');
  return response.data;
}

export async function getDetalhesFaseAtual() {
  const response = await api.get('/fase-atual/detalhes');
  return response.data;
}

export async function registrarMenstruacao(data_inicio: string) {
  const response = await api.post('/registrar-menstruacao', { data_inicio });
  return response.data;
}
