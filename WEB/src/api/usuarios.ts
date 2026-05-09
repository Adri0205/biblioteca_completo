import api from './axios';
import type { Usuario, UsuarioFormData } from '../types/usuario';

export const getUsuarios = () =>
  api.get<Usuario[]>('/usuarios').then((r) => r.data);

export const createUsuario = (data: UsuarioFormData) =>
  api.post<Usuario>('/usuarios', data).then((r) => r.data);

export const updateUsuario = (id: number, data: Partial<UsuarioFormData>) =>
  api.put<Usuario>(`/usuarios/${id}`, data).then((r) => r.data);

export const deleteUsuario = (id: number) =>
  api.delete(`/usuarios/${id}`).then((r) => r.data);
