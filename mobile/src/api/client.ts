import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'https://biblioteca-api.manguitosv.com/api';
export const TOKEN_KEY = 'auth_token';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: agrega el token JWT a cada petición si existe
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
