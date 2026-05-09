import { Router } from 'express';
import { login, me, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (requiere token)
router.get('/me', authenticate, me);

// POST /api/auth/logout  (requiere token)
router.post('/logout', authenticate, logout);

export default router;
