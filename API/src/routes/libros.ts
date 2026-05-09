import { Router } from 'express';
import {
  getLibros,
  getLibroById,
  createLibro,
  updateLibro,
  deleteLibro,
} from '../controllers/libroController';
import { authenticate, requireAdmin } from '../middlewares/authenticate';

const router = Router();

// Rutas públicas para usuarios autenticados (admin y usuario)
router.get('/',    authenticate, getLibros);
router.get('/:id', authenticate, getLibroById);

// Rutas exclusivas para administradores
router.post('/',    authenticate, requireAdmin, createLibro);
router.put('/:id',  authenticate, requireAdmin, updateLibro);
router.delete('/:id', authenticate, requireAdmin, deleteLibro);

export default router;
