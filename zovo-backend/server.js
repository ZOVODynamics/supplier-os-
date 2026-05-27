require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { supabase } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const sendSupabaseError = (res, error, fallbackStatus = 500) => {
  const statusCode = error.code === 'PGRST116' ? 404 : fallbackStatus;

  return res.status(statusCode).json({
    error: error.message || 'Supabase request failed',
    code: error.code,
    details: error.details,
  });
};

const parseRequestPayload = (body) => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const budget = Number(body.budget);

  if (!title) {
    return {
      error: 'Title is required',
    };
  }

  if (!Number.isFinite(budget) || budget <= 0) {
    return {
      error: 'Budget must be greater than 0',
    };
  }

  return {
    value: {
      title,
      description,
      budget,
    },
  };
};

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabase: supabase ? 'connected' : 'disconnected',
  });
});

app.get('/requests', async (_req, res) => {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return sendSupabaseError(res, error);
  }

  return res.json(data);
});

app.post('/request', async (req, res) => {
  const parsed = parseRequestPayload(req.body);

  if (parsed.error) {
    return res.status(400).json({
      error: parsed.error,
    });
  }

  const { data, error } = await supabase
    .from('requests')
    .insert(parsed.value)
    .select()
    .single();

  if (error) {
    return sendSupabaseError(res, error);
  }

  return res.status(201).json(data);
});

app.get('/request/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    return sendSupabaseError(res, error);
  }

  return res.json(data);
});

app.delete('/request/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('requests')
    .delete()
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return sendSupabaseError(res, error);
  }

  return res.json(data);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`ZOVO Supplier AI backend listening on port ${port}`);
  });
}

module.exports = app;
