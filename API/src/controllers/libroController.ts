import { Response } from 'express';
import { Op } from 'sequelize';
import Libro from '../models/Libro';
import { AuthRequest } from '../types';

// ─── GET /api/libros ──────────────────────────────────────────────────────────
// Busca libros por título, autor o categoría (query param: q)
// Filtra por disponibilidad (query param: disponible=true)
export const getLibros = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, disponible, page = '1', limit = '10' } = req.query;

  const pageNum  = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const offset   = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};

  if (q) {
    where[Op.or as unknown as string] = [
      { titulo:    { [Op.like]: `%${q}%` } },
      { autor:     { [Op.like]: `%${q}%` } },
      { categoria: { [Op.like]: `%${q}%` } },
    ];
  }

  if (disponible === 'true') {
    where['cantidad_disponible'] = { [Op.gt]: 0 };
  }

  const { count, rows } = await Libro.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['titulo', 'ASC']],
  });

  res.json({
    total: count,
    pagina: pageNum,
    por_pagina: limitNum,
    libros: rows,
  });
};

// ─── GET /api/libros/:id ──────────────────────────────────────────────────────
export const getLibroById = async (req: AuthRequest, res: Response): Promise<void> => {
  const libro = await Libro.findByPk(req.params.id);

  if (!libro) {
    res.status(404).json({ message: 'Libro no encontrado.' });
    return;
  }

  res.json(libro);
};

// ─── POST /api/libros  (solo admin) ──────────────────────────────────────────
export const createLibro = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    titulo, autor, categoria, isbn,
    descripcion, anio_publicacion,
    cantidad_total, cantidad_disponible,
  } = req.body;

  if (!titulo || !autor || !categoria) {
    res.status(400).json({ message: 'titulo, autor y categoria son requeridos.' });
    return;
  }

  const cantTotal = cantidad_total ?? 1;
  const cantDisp  = cantidad_disponible ?? cantTotal;

  if (cantDisp > cantTotal) {
    res.status(400).json({
      message: 'cantidad_disponible no puede ser mayor que cantidad_total.',
    });
    return;
  }

  const libro = await Libro.create({
    titulo,
    autor,
    categoria,
    isbn:              isbn ?? null,
    descripcion:       descripcion ?? null,
    anio_publicacion:  anio_publicacion ?? null,
    cantidad_total:    cantTotal,
    cantidad_disponible: cantDisp,
  });

  res.status(201).json(libro);
};

// ─── PUT /api/libros/:id  (solo admin) ───────────────────────────────────────
export const updateLibro = async (req: AuthRequest, res: Response): Promise<void> => {
  const libro = await Libro.findByPk(req.params.id);

  if (!libro) {
    res.status(404).json({ message: 'Libro no encontrado.' });
    return;
  }

  const {
    titulo, autor, categoria, isbn,
    descripcion, anio_publicacion,
    cantidad_total, cantidad_disponible,
  } = req.body;

  const nuevoTotal = cantidad_total    ?? libro.cantidad_total;
  const nuevoDisp  = cantidad_disponible ?? libro.cantidad_disponible;

  if (nuevoDisp > nuevoTotal) {
    res.status(400).json({
      message: 'cantidad_disponible no puede ser mayor que cantidad_total.',
    });
    return;
  }

  await libro.update({
    titulo:              titulo              ?? libro.titulo,
    autor:               autor               ?? libro.autor,
    categoria:           categoria           ?? libro.categoria,
    isbn:                isbn                !== undefined ? isbn : libro.isbn,
    descripcion:         descripcion         !== undefined ? descripcion : libro.descripcion,
    anio_publicacion:    anio_publicacion    !== undefined ? anio_publicacion : libro.anio_publicacion,
    cantidad_total:      nuevoTotal,
    cantidad_disponible: nuevoDisp,
  });

  res.json(libro);
};

// ─── DELETE /api/libros/:id  (solo admin) ────────────────────────────────────
export const deleteLibro = async (req: AuthRequest, res: Response): Promise<void> => {
  const libro = await Libro.findByPk(req.params.id);

  if (!libro) {
    res.status(404).json({ message: 'Libro no encontrado.' });
    return;
  }

  await libro.destroy();

  res.json({ message: 'Libro eliminado correctamente.' });
};
