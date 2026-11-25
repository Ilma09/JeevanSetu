import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import schemeRoutes from './routes/schemes.js';

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('DATABASE_URL and a JWT_SECRET of at least 32 characters are required.');
}

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'JeevanSetu API' }));
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'P2002') return res.status(409).json({ error: 'A record with this value already exists.' });
  return res.status(500).json({ error: 'Internal server error.' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`JeevanSetu API listening on http://localhost:${port}`));
