import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/status - Health check
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Biblioteca API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

export default router;
