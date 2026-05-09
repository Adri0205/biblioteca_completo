import api from './axios';
import type { Libro, LibrosResponse, LibroFormData } from '../types/libro';

export const getLibros = (params: {
  q?: string;
  disponible?: boolean;
  page?: number;
  limit?: number;
}) => api.get<LibrosResponse>('/libros', { params }).then((r) => r.data);

export const getLibroById = (id: number) =>
  api.get<Libro>(`/libros/${id}`).then((r) => r.data);

export const createLibro = (data: LibroFormData) =>
  api.post<Libro>('/libros', data).then((r) => r.data);

export const updateLibro = (id: number, data: Partial<LibroFormData>) =>
  api.put<Libro>(`/libros/${id}`, data).then((r) => r.data);

export const deleteLibro = (id: number) =>
  api.delete(`/libros/${id}`).then((r) => r.data);
