import { Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import sequelize from '../database/connection';
import Prestamo, { PrestamoAttributes } from '../models/Prestamo';
import Libro from '../models/Libro';
import Usuario from '../models/Usuario';
import { AuthRequest } from '../types';

// Días de préstamo por defecto
const DIAS_PRESTAMO = 14;

// Atributos de usuario que se incluyen en las respuestas (sin password)
const atributosUsuario = ['id', 'nombre', 'correo'];
const atributosLibro   = ['id', 'titulo', 'autor', 'categoria', 'isbn'];

// ─── Helper: marcar préstamos vencidos ───────────────────────────────────────
// Actualiza en la BD los préstamos activos cuya fecha_limite ya pasó
const marcarVencidos = async (): Promise<void> => {
  await Prestamo.update(
    { estado: 'vencido' },
    {
      where: {
        estado:       'activo',
        fecha_limite: { [Op.lt]: new Date() },
      },
    }
  );
};

// ─── GET /api/prestamos ──────────────────────────────────────────────────────
// Admin: lista todos los préstamos con filtros opcionales
// Filtros: estado, usuario_id, libro_id, fecha_desde, fecha_hasta, page, limit
export const getPrestamos = async (req: AuthRequest, res: Response): Promise<void> => {
  await marcarVencidos();

  const {
    estado, usuario_id, libro_id,
    fecha_desde, fecha_hasta,
    page = '1', limit = '10',
  } = req.query;

  const pageNum  = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const offset   = (pageNum - 1) * limitNum;

  const where: WhereOptions<PrestamoAttributes> = {};

  if (estado)      where['estado']      = estado      as PrestamoAttributes['estado'];
  if (usuario_id)  where['usuario_id']  = Number(usuario_id);
  if (libro_id)    where['libro_id']    = Number(libro_id);

  if (fecha_desde || fecha_hasta) {
    where['fecha_prestamo'] = {
      ...(fecha_desde ? { [Op.gte]: new Date(fecha_desde as string) } : {}),
      ...(fecha_hasta ? { [Op.lte]: new Date(fecha_hasta as string) } : {}),
    };
  }

  const { count, rows } = await Prestamo.findAndCountAll({
    where,
    include: [
      { model: Usuario, as: 'usuario', attributes: atributosUsuario },
      { model: Libro,   as: 'libro',   attributes: atributosLibro   },
    ],
    limit: limitNum,
    offset,
    order: [['fecha_prestamo', 'DESC']],
  });

  res.json({
    total:     count,
    pagina:    pageNum,
    por_pagina: limitNum,
    prestamos: rows,
  });
};

// ─── GET /api/prestamos/mis-prestamos ────────────────────────────────────────
// Usuario normal: ve solo sus propios préstamos
// Filtro: estado, page, limit
export const getMisPrestamos = async (req: AuthRequest, res: Response): Promise<void> => {
  await marcarVencidos();

  const { estado, page = '1', limit = '10' } = req.query;

  const pageNum  = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const offset   = (pageNum - 1) * limitNum;

  const where: WhereOptions<PrestamoAttributes> = { usuario_id: req.user!.id };
  if (estado) where['estado'] = estado as PrestamoAttributes['estado'];

  const { count, rows } = await Prestamo.findAndCountAll({
    where,
    include: [
      { model: Libro, as: 'libro', attributes: atributosLibro },
    ],
    limit: limitNum,
    offset,
    order: [['fecha_prestamo', 'DESC']],
  });

  res.json({
    total:     count,
    pagina:    pageNum,
    por_pagina: limitNum,
    prestamos: rows,
  });
};

// ─── GET /api/prestamos/:id ──────────────────────────────────────────────────
// Admin: cualquier préstamo. Usuario: solo el suyo.
export const getPrestamoById = async (req: AuthRequest, res: Response): Promise<void> => {
  await marcarVencidos();

  const prestamo = await Prestamo.findByPk(req.params.id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: atributosUsuario },
      { model: Libro,   as: 'libro',   attributes: atributosLibro   },
    ],
  });

  if (!prestamo) {
    res.status(404).json({ message: 'Préstamo no encontrado.' });
    return;
  }

  // Usuario normal solo puede ver sus propios préstamos
  if (req.user!.rol !== 'admin' && prestamo.usuario_id !== req.user!.id) {
    res.status(403).json({ message: 'Acceso denegado.' });
    return;
  }

  res.json(prestamo);
};

// ─── POST /api/prestamos  (solo admin) ───────────────────────────────────────
export const createPrestamo = async (req: AuthRequest, res: Response): Promise<void> => {
  const { usuario_id, libro_id, dias_prestamo } = req.body;

  if (!usuario_id || !libro_id) {
    res.status(400).json({ message: 'usuario_id y libro_id son requeridos.' });
    return;
  }

  const usuario = await Usuario.findByPk(usuario_id);
  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  const libro = await Libro.findByPk(libro_id);
  if (!libro) {
    res.status(404).json({ message: 'Libro no encontrado.' });
    return;
  }

  if (libro.cantidad_disponible <= 0) {
    res.status(409).json({ message: 'No hay ejemplares disponibles de este libro.' });
    return;
  }

  const dias = dias_prestamo && Number(dias_prestamo) > 0
    ? Number(dias_prestamo)
    : DIAS_PRESTAMO;

  const fechaPrestamo = new Date();
  const fechaLimite   = new Date(fechaPrestamo.getTime() + dias * 86_400_000);

  // Transacción: crear préstamo + descontar stock atómicamente
  const prestamo = await sequelize.transaction(async (t) => {
    const nuevoPrestamo = await Prestamo.create(
      {
        usuario_id,
        libro_id,
        fecha_prestamo: fechaPrestamo,
        fecha_limite:   fechaLimite,
        estado:         'activo',
      },
      { transaction: t }
    );

    await libro.decrement('cantidad_disponible', { by: 1, transaction: t });

    return nuevoPrestamo;
  });

  const prestamoConDatos = await Prestamo.findByPk(prestamo.id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: atributosUsuario },
      { model: Libro,   as: 'libro',   attributes: atributosLibro   },
    ],
  });

  res.status(201).json(prestamoConDatos);
};

// ─── PUT /api/prestamos/:id/devolucion  (solo admin) ─────────────────────────
export const registrarDevolucion = async (req: AuthRequest, res: Response): Promise<void> => {
  const prestamo = await Prestamo.findByPk(req.params.id, {
    include: [{ model: Libro, as: 'libro' }],
  });

  if (!prestamo) {
    res.status(404).json({ message: 'Préstamo no encontrado.' });
    return;
  }

  if (prestamo.estado === 'devuelto') {
    res.status(409).json({ message: 'Este préstamo ya fue devuelto.' });
    return;
  }

  const libro = await Libro.findByPk(prestamo.libro_id);
  if (!libro) {
    res.status(404).json({ message: 'Libro asociado no encontrado.' });
    return;
  }

  // Transacción: actualizar préstamo + reponer stock atómicamente
  await sequelize.transaction(async (t) => {
    await prestamo.update(
      {
        estado:           'devuelto',
        fecha_devolucion: new Date(),
      },
      { transaction: t }
    );

    await libro.increment('cantidad_disponible', { by: 1, transaction: t });
  });

  const prestamoActualizado = await Prestamo.findByPk(prestamo.id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: atributosUsuario },
      { model: Libro,   as: 'libro',   attributes: atributosLibro   },
    ],
  });

  res.json(prestamoActualizado);
};

// ─── GET /api/prestamos/historial/:usuario_id  (solo admin) ──────────────────
export const getHistorialUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  await marcarVencidos();

  const usuario = await Usuario.findByPk(req.params.usuario_id, {
    attributes: atributosUsuario,
  });

  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  const prestamos = await Prestamo.findAll({
    where: { usuario_id: req.params.usuario_id },
    include: [{ model: Libro, as: 'libro', attributes: atributosLibro }],
    order: [['fecha_prestamo', 'DESC']],
  });

  res.json({ usuario, prestamos });
};
