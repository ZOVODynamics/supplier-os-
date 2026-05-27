const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { checkSupabaseConnection } = require('./db');
const businessesRouter = require('./routes/businesses');
const suppliersRouter = require('./routes/suppliers');
const requestsRouter = require('./routes/requests');
const executionsRouter = require('./routes/executions');

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: Number.parseInt(process.env.RATE_LIMIT_PER_MINUTE, 10) || 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);

app.get('/health', async (_req, res) => {
  const connection = await checkSupabaseConnection();

  return res.status(connection.connected ? 200 : 503).json({
    status: 'ok',
    supabase: connection.connected ? 'connected' : 'error',
  });
});

app.use(businessesRouter);
app.use(suppliersRouter);
app.use(requestsRouter);
app.use(executionsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const payload = {
    error: status >= 500 ? 'Internal server error' : error.message,
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.details = error.message;
    payload.code = error.code;
  }

  console.error(error);
  res.status(status).json(payload);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`ZOVO Supplier AI backend listening on port ${port}`);
  });
}

module.exports = app;
