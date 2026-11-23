import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initializeDatabase } from './db/initDb.js';
import authRoutes from './routes/auth.js';
import sprintRoutes from './routes/sprint.js';
import exercisesRoutes from './routes/exercises.js';
import analyticsRoutes from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lexicode-express-api', db: 'Microsoft SQL Server' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sprint', sprintRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Monolithic Production Static Serving (React 18 Vite build)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`LexiCode Express Server running on http://localhost:${PORT} (SQL Server connected)`);
    });
  })
  .catch((err) => {
    console.error('Fatal database initialization error:', err);
    process.exit(1);
  });
