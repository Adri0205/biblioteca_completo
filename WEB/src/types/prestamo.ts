import type { Usuario } from './usuario';
import type { Libro } from './libro';

export type EstadoPrestamo = 'activo' | 'devuelto' | 'vencido';

export interface Prestamo {
  id: number;
  usuario_id: number;
  libro_id: number;
  fecha_prestamo: string;
  fecha_limite: string;
  fecha_devolucion: string | null;
  estado: EstadoPrestamo;
  usuario?: Pick<Usuario, 'id' | 'nombre' | 'correo'>;
  libro?: Pick<Libro, 'id' | 'titulo' | 'autor' | 'categoria' | 'isbn'>;
  createdAt: string;
  updatedAt: string;
}

export interface PrestamosResponse {
  total: number;
  pagina: number;
  por_pagina: number;
  prestamos: Prestamo[];
}

export interface PrestamoFormData {
  usuario_id: number;
  libro_id: number;
  dias_prestamo?: number;
}
