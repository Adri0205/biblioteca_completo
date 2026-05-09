import { Request } from 'express';

export interface JwtPayload {
  id: number;
  correo: string;
  rol: 'admin' | 'usuario';
}

// Extiende Request para que todos los controllers puedan acceder a req.user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
