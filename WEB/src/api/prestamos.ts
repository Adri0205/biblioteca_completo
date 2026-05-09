import api from './axios';
import type { Prestamo, PrestamosResponse, PrestamoFormData } from '../types/prestamo';

export interface GetPrestamosParams {
  estado?: string;
  usuario_id?: number;
  libro_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

export const getPrestamos = (params: GetPrestamosParams) =>
  api.get<PrestamosResponse>('/prestamos', { params }).then((r) => r.data);

export const createPrestamo = (data: PrestamoFormData) =>
  api.post<Prestamo>('/prestamos', data).then((r) => r.data);

export const registrarDevolucion = (id: number) =>
  api.put<Prestamo>(`/prestamos/${id}/devolucion`).then((r) => r.data);
