export type EstadoPrestamo = 'activo' | 'devuelto' | 'vencido';

export interface LibroPrestamo {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string | null;
}

export interface Prestamo {
  id: number;
  usuario_id: number;
  libro_id: number;
  fecha_prestamo: string;
  fecha_limite: string;
  fecha_devolucion: string | null;
  estado: EstadoPrestamo;
  libro: LibroPrestamo;
}

export interface PrestamosResponse {
  total: number;
  pagina: number;
  por_pagina: number;
  prestamos: Prestamo[];
}

export interface GetMisPrestamosParams {
  estado?: EstadoPrestamo;
  page?: number;
  limit?: number;
}
