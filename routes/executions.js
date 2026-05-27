import { Router } from 'express';
import { supabase } from '../db.js';
import { compactObject, requireFields, sendSupabaseError } from './helpers.js';

const router = Router();

router.post('/execution', async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['request_id']);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    const payload = compactObject({
      request_id: req.body.request_id,
      supplier_id: req.body.supplier_id,
      status: req.body.status,
      input: req.body.input,
      output: req.body.output,
      error: req.body.error,
      metadata: req.body.metadata
    });

    const { data, error } = await supabase
      .from('executions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return sendSupabaseError(res, error);
    }

    return res.status(201).json({ execution: data });
  } catch (error) {
    return next(error);
  }
});

router.get('/executions', async (req, res, next) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit ?? '50', 10) || 50, 100);
    const offset = Number.parseInt(req.query.offset ?? '0', 10) || 0;

    let query = supabase
      .from('executions')
      .select(`
        *,
        request:requests (
          id,
          title,
          status,
          business_id
        ),
        supplier:suppliers (
          id,
          name,
          contact_email,
          category
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.request_id) {
      query = query.eq('request_id', req.query.request_id);
    }

    if (req.query.supplier_id) {
      query = query.eq('supplier_id', req.query.supplier_id);
    }

    const { data, error } = await query;

    if (error) {
      return sendSupabaseError(res, error);
    }

    return res.json({
      executions: data,
      pagination: {
        limit,
        offset
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
