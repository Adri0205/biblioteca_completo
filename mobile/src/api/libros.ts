import apiClient from './client';
import { GetLibrosParams, Libro, LibrosResponse } from '../types/libro';

export const getLibros = (params: GetLibrosParams = {}): Promise<{ data: LibrosResponse }> => {
  const query: Record<string, string> = {};

  if (params.q)           query.q         = params.q;
  if (params.disponible)  query.disponible = 'true';
  if (params.page)        query.page       = String(params.page);
  if (params.limit)       query.limit      = String(params.limit);

  return apiClient.get('/libros', { params: query });
};

export const getLibroById = (id: number): Promise<{ data: Libro }> =>
  apiClient.get(`/libros/${id}`);
