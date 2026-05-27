const path = require('node:path');
const express = require('express');
const { validateSupabaseConnection } = require('./db');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const DEFAULT_PORT = 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  const result = await validateSupabaseConnection();

  if (!result.connected) {
    return res.status(503).json({
      status: 'error',
      supabase: 'disconnected',
      error: result.error,
    });
  }

  return res.json({
    status: 'ok',
    supabase: 'connected',
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
});

function startServer(port = process.env.PORT || DEFAULT_PORT) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      const address = server.address();
      const activePort = typeof address === 'object' && address ? address.port : port;

      console.log(`ZOVO Supplier AI backend listening on port ${activePort}`);

      validateSupabaseConnection().then((result) => {
        if (result.connected) {
          console.log('Supabase connection verified.');
        } else {
          console.error(`Supabase connection unavailable: ${result.error}`);
        }
      });

      resolve(server);
    });

    server.on('error', (error) => {
      reject(error);
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Backend failed to start: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  app,
  startServer,
};
