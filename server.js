require('dotenv').config({ quiet: true });

const express = require('express');
const { testSupabaseConnection } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'zovo-supplier-ai-backend',
    status: 'ok',
  });
});

async function startServer() {
  try {
    await testSupabaseConnection();
    console.log('Supabase connected');
  } catch (error) {
    console.error('Supabase connection failed:', error.message);
    process.exit(1);
  }

  return app.listen(port, () => {
    console.log(`ZOVO Supplier AI backend listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
