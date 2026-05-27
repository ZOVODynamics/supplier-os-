import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseStatus } from './db.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.get('/', (_req, res) => {
  res.json({
    service: 'zovo-backend',
    status: 'ok',
  });
});

app.get('/health', (_req, res) => {
  const supabase = getSupabaseStatus();

  res.status(supabase.connected ? 200 : 503).json({
    status: supabase.connected ? 'ok' : 'degraded',
    service: 'zovo-backend',
    timestamp: new Date().toISOString(),
    supabase,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    requestId: req.id,
  });
});

app.use((err, req, res, _next) => {
  console.error(`[${req.id}]`, err);

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.id,
  });
});

app.listen(port, () => {
  console.log(`ZOVO backend running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
