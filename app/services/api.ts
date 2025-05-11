import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'https://sua-url-real-do-backend.com', // Substitua pela URL real
});

// Lista de endpoints que podem ser acessados sem autenticação
const endpointsSemAuth = ['/login', '/register', '/validar-email'];

// Interceptor para incluir o token
api.interceptors.request.use(
  async (config) => {
    // Se for um endpoint que exige autenticação
    if (!endpointsSemAuth.some(endpoint => config.url?.includes(endpoint))) {
      const token = await AsyncStorage.getItem('auth_token');
      
      // Se não tiver token e não for um endpoint público, cancela a requisição
      if (!token) {
        // Opção 1: Cancela a requisição
        const controller = new AbortController();
        controller.abort();
        return { ...config, signal: controller.signal };
        
        // Opção 2: Continua com a requisição (vai falhar, mas sem mostrar erros)
        // config.headers.Authorization = 'Bearer invalid-token';
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
