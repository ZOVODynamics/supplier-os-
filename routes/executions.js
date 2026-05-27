const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

router.post('/execution', async (req, res, next) => {
  try {
    const {
      request_id,
      supplier_id = null,
      status = 'queued',
      output = {},
      error = null,
      metadata = {},
    } = req.body;

    if (!request_id || typeof request_id !== 'string') {
      return res.status(400).json({ error: 'request_id is required' });
    }

    const { data, error: insertError } = await supabase
      .from('executions')
      .insert({
        request_id,
        supplier_id,
        status,
        output,
        error,
        metadata,
      })
      .select()
      .single();

    if (insertError) {
      return next(insertError);
    }

    return res.status(201).json({ execution: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
