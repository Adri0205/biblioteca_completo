import { Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import { AuthRequest } from '../types';

const SALT_ROUNDS = 10;

// Atributos seguros a devolver (sin password)
const atributosSeguros = ['id', 'nombre', 'correo', 'rol', 'createdAt', 'updatedAt'];

// ─── GET /api/usuarios ────────────────────────────────────────────────────────
export const getUsuarios = async (_req: AuthRequest, res: Response): Promise<void> => {
  const usuarios = await Usuario.findAll({
    attributes: atributosSeguros,
    order: [['nombre', 'ASC']],
  });

  res.json(usuarios);
};

// ─── GET /api/usuarios/:id ────────────────────────────────────────────────────
export const getUsuarioById = async (req: AuthRequest, res: Response): Promise<void> => {
  const usuario = await Usuario.findByPk(req.params.id, {
    attributes: atributosSeguros,
  });

  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  res.json(usuario);
};

// ─── POST /api/usuarios ───────────────────────────────────────────────────────
export const createUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password) {
    res.status(400).json({ message: 'nombre, correo y password son requeridos.' });
    return;
  }

  const existe = await Usuario.findOne({ where: { correo } });
  if (existe) {
    res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const usuario = await Usuario.create({
    nombre,
    correo,
    password: hashedPassword,
    rol: rol === 'admin' ? 'admin' : 'usuario',
  });

  res.status(201).json({
    id:        usuario.id,
    nombre:    usuario.nombre,
    correo:    usuario.correo,
    rol:       usuario.rol,
    createdAt: usuario.createdAt,
  });
};

// ─── PUT /api/usuarios/:id ────────────────────────────────────────────────────
export const updateUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  const usuario = await Usuario.findByPk(req.params.id);

  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  const { nombre, correo, password, rol } = req.body;

  // Verificar que el nuevo correo no esté en uso por otro usuario
  if (correo && correo !== usuario.correo) {
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
      return;
    }
  }

  if (password !== undefined && password.length < 8) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    return;
  }

  const hashedPassword = password
    ? await bcrypt.hash(password, SALT_ROUNDS)
    : usuario.password;

  await usuario.update({
    nombre:   nombre   ?? usuario.nombre,
    correo:   correo   ?? usuario.correo,
    password: hashedPassword,
    rol:      rol === 'admin' || rol === 'usuario' ? rol : usuario.rol,
  });

  res.json({
    id:        usuario.id,
    nombre:    usuario.nombre,
    correo:    usuario.correo,
    rol:       usuario.rol,
    updatedAt: usuario.updatedAt,
  });
};

// ─── PATCH /api/usuarios/:id/rol ─────────────────────────────────────────────
export const updateRol = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rol } = req.body;

  if (rol !== 'admin' && rol !== 'usuario') {
    res.status(400).json({ message: 'rol debe ser "admin" o "usuario".' });
    return;
  }

  const usuario = await Usuario.findByPk(req.params.id);

  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  // Evitar que un admin se quite su propio rol
  if (usuario.id === req.user!.id && rol !== 'admin') {
    res.status(400).json({ message: 'No puedes quitarte el rol de administrador a ti mismo.' });
    return;
  }

  await usuario.update({ rol });

  res.json({
    id:     usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol:    usuario.rol,
  });
};

// ─── DELETE /api/usuarios/:id ─────────────────────────────────────────────────
export const deleteUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  // Evitar que un admin se elimine a sí mismo
  if (Number(req.params.id) === req.user!.id) {
    res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
    return;
  }

  const usuario = await Usuario.findByPk(req.params.id);

  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  await usuario.destroy();

  res.json({ message: 'Usuario eliminado correctamente.' });
};
