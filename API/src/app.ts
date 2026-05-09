import express, { Application } from 'express';
import cors from 'cors';
import router from './routes';
import authRoutes from './routes/auth';
import librosRoutes from './routes/libros';
import prestamosRoutes from './routes/prestamos';
import usuariosRoutes from './routes/usuarios';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', router);
app.use('/api/auth',      authRoutes);
app.use('/api/libros',    librosRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/usuarios',  usuariosRoutes);

export default app;
