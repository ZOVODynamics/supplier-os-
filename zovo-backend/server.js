import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import healthRoutes from './routes/healthRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(healthRoutes);
app.use(businessRoutes);
app.use(supplierRoutes);
app.use(requestRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`ZOVO Supplier AI API running on port ${port}`);
  });
}

export default app;
