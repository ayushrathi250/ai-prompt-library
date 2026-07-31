import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './backend/config/db';
import promptRoutes from './backend/routes/promptRoutes';
import { errorHandler } from './backend/middleware/errorHandler';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable trust proxy for reverse proxy environments (e.g., Cloud Run / Nginx)
  app.set('trust proxy', 1);

  // Initialize DB Connection (falls back safely to in-memory if MONGO_URI is unset/invalid)
  await connectDB();

  // Middleware Security & Performance
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite dev server compatibility
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  // Rate Limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });

  app.use('/api', apiLimiter);

  // API Routes - Mounted FIRST before Vite middleware
  app.use('/api', promptRoutes);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AI Prompt Library API',
      timestamp: new Date().toISOString(),
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Prompt Library SaaS Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
