import apiClient from './client';
import { LoginCredentials, LoginResponse, Usuario } from '../types/auth';

export const loginRequest = (credentials: LoginCredentials): Promise<{ data: LoginResponse }> =>
  apiClient.post('/auth/login', credentials);

export const meRequest = (): Promise<{ data: Usuario }> =>
  apiClient.get('/auth/me');

export const logoutRequest = (): Promise<void> =>
  apiClient.post('/auth/logout');
