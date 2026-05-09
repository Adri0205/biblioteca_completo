import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import { AuthRequest } from '../types';

// POST /api/auth/login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
    return;
  }

  const usuario = await Usuario.findOne({ where: { correo } });

  if (!usuario) {
    res.status(401).json({ message: 'Credenciales inválidas.' });
    return;
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);

  if (!passwordValida) {
    res.status(401).json({ message: 'Credenciales inválidas.' });
    return;
  }

  const payload = { id: usuario.id, correo: usuario.correo, rol: usuario.rol };

  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, signOptions);

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  });
};

// GET /api/auth/me
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  const usuario = await Usuario.findByPk(req.user!.id, {
    attributes: { exclude: ['password'] },
  });

  if (!usuario) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  res.json(usuario);
};

// POST /api/auth/logout
export const logout = (_req: AuthRequest, res: Response): void => {
  // Con JWT stateless el cliente descarta el token.
  // Este endpoint existe para que web y móvil tengan un punto uniforme de cierre de sesión.
  res.json({ message: 'Sesión cerrada correctamente.' });
};
