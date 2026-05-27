const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

router.post('/business', async (req, res, next) => {
  try {
    const { name, email = null, industry = null, metadata = {} } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: name.trim(),
        email,
        industry,
        metadata,
      })
      .select()
      .single();

    if (error) {
      return next(error);
    }

    return res.status(201).json({ business: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
