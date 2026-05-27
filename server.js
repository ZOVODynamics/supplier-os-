import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { checkSupabaseConnection } from './db.js';
import businessesRouter from './routes/businesses.js';
import suppliersRouter from './routes/suppliers.js';
import requestsRouter from './routes/requests.js';
import executionsRouter from './routes/executions.js';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  const connection = await checkSupabaseConnection();

  return res.status(connection.connected ? 200 : 503).json({
    status: 'ok',
    supabase: connection.connected ? 'connected' : 'error'
  });
});

app.use(businessesRouter);
app.use(suppliersRouter);
app.use(requestsRouter);
app.use(executionsRouter);

app.use((_req, res) => {
  return res.status(404).json({
    error: 'Route not found'
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  return res.status(error.statusCode ?? 500).json({
    error: error.statusCode ? error.message : 'Internal server error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`ZOVO Supplier AI backend listening on port ${port}`);
  });
}

export default app;
