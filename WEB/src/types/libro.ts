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

export interface LibroFormData {
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string;
  descripcion: string;
  anio_publicacion: string;
  cantidad_total: number;
  cantidad_disponible: number;
}
