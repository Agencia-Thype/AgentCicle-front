// hooks/useLuniaBalao.ts
import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export function useLuniaBalao() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const route = useRoute();
  const [balaoData, setBalaoData] = useState(null);
  
  // Verificar autenticação usando apenas AsyncStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setIsAuthenticated(!!token);
        
        // Opcional: buscar dados do usuário caso necessário
        if (token) {
          const userDataString = await AsyncStorage.getItem('user_data');
          if (userDataString) {
            setUserData(JSON.parse(userDataString));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    // Não buscar dados em páginas de autenticação
    const rotaAtual = route.name;
    const rotasNaoAutorizadas = ['Login', 'Register', 'ValidacaoCodigo'];
    
    if (!isAuthenticated || rotasNaoAutorizadas.includes(rotaAtual)) {
      return;
    }
    
    // Função para buscar dados do balão
    const buscarDados = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await api.get('/api/balao-ia', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalaoData(response.data);
      } catch (error) {
        console.error("Erro ao buscar balão", error);
      }
    };
    
    buscarDados();
  }, [isAuthenticated, route.name]);
  
  return { balaoData, isAuthenticated, userData };
}
