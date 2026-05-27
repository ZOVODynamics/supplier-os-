const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

router.post('/supplier', async (req, res, next) => {
  try {
    const {
      name,
      email = null,
      category = null,
      capabilities = [],
      metadata = {},
    } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: name.trim(),
        email,
        category,
        capabilities,
        metadata,
      })
      .select()
      .single();

    if (error) {
      return next(error);
    }

    return res.status(201).json({ supplier: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
