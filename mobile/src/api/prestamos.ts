import apiClient from './client';
import { GetMisPrestamosParams, Prestamo, PrestamosResponse } from '../types/prestamo';

export const getMisPrestamos = (
  params: GetMisPrestamosParams = {},
): Promise<{ data: PrestamosResponse }> => {
  const query: Record<string, string> = {};

  if (params.estado) query.estado = params.estado;
  if (params.page)   query.page   = String(params.page);
  if (params.limit)  query.limit  = String(params.limit);

  return apiClient.get('/prestamos/mis-prestamos', { params: query });
};

export const getPrestamoById = (id: number): Promise<{ data: Prestamo }> =>
  apiClient.get(`/prestamos/${id}`);
