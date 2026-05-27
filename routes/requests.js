const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

router.post('/request', async (req, res, next) => {
  try {
    const {
      business_id,
      title,
      description = null,
      category = null,
      quantity = null,
      budget = null,
      metadata = {},
    } = req.body;

    if (!business_id || typeof business_id !== 'string') {
      return res.status(400).json({ error: 'business_id is required' });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Request title is required' });
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        business_id,
        title: title.trim(),
        description,
        category,
        quantity,
        budget,
        metadata,
      })
      .select()
      .single();

    if (error) {
      return next(error);
    }

    return res.status(201).json({ request: data });
  } catch (error) {
    return next(error);
  }
});

router.get('/requests', async (req, res, next) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 50, 100);
    const status = typeof req.query.status === 'string' ? req.query.status : null;

    let query = supabase
      .from('requests')
      .select(
        `
          *,
          businesses (
            id,
            name,
            email,
            industry
          )
        `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return next(error);
    }

    return res.json({ requests: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
