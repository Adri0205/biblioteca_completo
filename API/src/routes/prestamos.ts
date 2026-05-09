import { Router } from 'express';
import {
  getPrestamos,
  getMisPrestamos,
  getPrestamoById,
  createPrestamo,
  registrarDevolucion,
  getHistorialUsuario,
} from '../controllers/prestamoController';
import { authenticate, requireAdmin } from '../middlewares/authenticate';

const router = Router();

// Rutas para usuarios autenticados (admin y usuario normal)
router.get('/mis-prestamos',          authenticate, getMisPrestamos);
router.get('/:id',                    authenticate, getPrestamoById);

// Rutas exclusivas para administradores
router.get('/',                       authenticate, requireAdmin, getPrestamos);
router.get('/historial/:usuario_id',  authenticate, requireAdmin, getHistorialUsuario);
router.post('/',                      authenticate, requireAdmin, createPrestamo);
router.put('/:id/devolucion',         authenticate, requireAdmin, registrarDevolucion);

export default router;
