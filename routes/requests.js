import { Router } from 'express';
import { supabase } from '../db.js';
import { compactObject, requireFields, sendSupabaseError } from './helpers.js';

const router = Router();

router.post('/request', async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['business_id', 'title', 'description']);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    const payload = compactObject({
      business_id: req.body.business_id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status,
      budget_min: req.body.budget_min,
      budget_max: req.body.budget_max,
      deadline: req.body.deadline,
      requirements: req.body.requirements,
      metadata: req.body.metadata
    });

    const { data, error } = await supabase
      .from('requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return sendSupabaseError(res, error);
    }

    return res.status(201).json({ request: data });
  } catch (error) {
    return next(error);
  }
});

router.get('/requests', async (req, res, next) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit ?? '50', 10) || 50, 100);
    const offset = Number.parseInt(req.query.offset ?? '0', 10) || 0;

    let query = supabase
      .from('requests')
      .select(`
        *,
        business:businesses (
          id,
          name,
          contact_email,
          industry,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    if (req.query.business_id) {
      query = query.eq('business_id', req.query.business_id);
    }

    const { data, error } = await query;

    if (error) {
      return sendSupabaseError(res, error);
    }

    return res.json({
      requests: data,
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
