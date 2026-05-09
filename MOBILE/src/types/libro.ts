export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string | null;
  descripcion: string | null;
  anio_publicacion: number | null;
  cantidad_total: number;
  cantidad_disponible: number;
  createdAt: string;
  updatedAt: string;
}

export interface LibrosResponse {
  total: number;
  pagina: number;
  por_pagina: number;
  libros: Libro[];
}

export interface GetLibrosParams {
  q?: string;
  disponible?: boolean;
  page?: number;
  limit?: number;
}
