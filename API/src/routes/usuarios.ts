import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  updateRol,
  deleteUsuario,
} from '../controllers/usuarioController';
import { authenticate, requireAdmin } from '../middlewares/authenticate';

const router = Router();

// Todas las rutas son exclusivas para administradores
router.get('/',             authenticate, requireAdmin, getUsuarios);
router.get('/:id',          authenticate, requireAdmin, getUsuarioById);
router.post('/',            authenticate, requireAdmin, createUsuario);
router.put('/:id',          authenticate, requireAdmin, updateUsuario);
router.patch('/:id/rol',    authenticate, requireAdmin, updateRol);
router.delete('/:id',       authenticate, requireAdmin, deleteUsuario);

export default router;
