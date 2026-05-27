import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseStatus, safeQuery, validateSupabaseHealth } from './db.js';
import { getRevenueSummary } from './services/ledger.service.js';
import { triggerAutoAssignSupplier } from './services/request.service.js';

dotenv.config({ path: ['.env.local', '.env'] });

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

  res.status(200).json({
    status: supabase.connected ? 'ok' : 'degraded',
    service: 'zovo-backend',
    timestamp: new Date().toISOString(),
    supabase,
  });
});

function dbResponse(res, result, successStatus = 200) {
  if (!result.ok) {
    return res.status(200).json({
      error: result.error,
      data: [],
    });
  }

  return res.status(successStatus).json({
    data: result.data ?? [],
  });
}

app.get('/requests', async (_req, res) => {
  const result = await safeQuery('requests', (db) => db.from('requests').select('*'));
  return dbResponse(res, result);
});

app.get('/revenue', async (_req, res) => {
  const summary = await getRevenueSummary();

  return res.status(200).json({
    total_revenue: summary.total_revenue,
    total_volume: summary.total_volume,
    transactions: summary.transactions,
    ...(summary.error ? { error: summary.error } : {}),
  });
});

app.get('/request/:id', async (req, res) => {
  const result = await safeQuery('requests', (db) =>
    db.from('requests').select('*').eq('id', req.params.id).limit(1),
  );

  if (!result.ok) {
    return dbResponse(res, result);
  }

  const [request] = result.data;
  return res.status(200).json({
    data: request || null,
  });
});

app.post('/request', async (req, res) => {
  const payload = {
    id: req.body?.id || uuidv4(),
    ...req.body,
  };

  const result = await safeQuery('requests', (db) =>
    db.from('requests').insert(payload).select('*'),
  );

  if (!result.ok) {
    return dbResponse(res, result, 201);
  }

  const [createdRequest = payload] = result.data;
  triggerAutoAssignSupplier(createdRequest);

  return res.status(201).json({
    ...createdRequest,
    ai: 'supplier assignment triggered',
  });
});

app.delete('/request/:id', async (req, res) => {
  const result = await safeQuery('requests', (db) =>
    db.from('requests').delete().eq('id', req.params.id).select('*'),
  );

  return dbResponse(res, result);
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

async function startServer() {
  try {
    await validateSupabaseHealth();
  } catch (error) {
    console.warn(`[supabase] startup validation failed safely: ${error.message}`);
  }

  app.listen(port, () => {
    console.log(`ZOVO Supplier AI backend running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
}

startServer();
