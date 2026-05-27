require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { supabase } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabase: supabase ? 'connected' : 'disconnected',
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`ZOVO Supplier AI backend listening on port ${port}`);
  });
}

module.exports = app;
