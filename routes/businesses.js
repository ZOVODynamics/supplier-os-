import { Router } from 'express';
import { supabase } from '../db.js';
import { compactObject, requireFields, sendSupabaseError } from './helpers.js';

const router = Router();

router.post('/business', async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['name']);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    const payload = compactObject({
      name: req.body.name,
      contact_name: req.body.contact_name,
      contact_email: req.body.contact_email,
      phone: req.body.phone,
      industry: req.body.industry,
      location: req.body.location,
      metadata: req.body.metadata
    });

    const { data, error } = await supabase
      .from('businesses')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return sendSupabaseError(res, error);
    }

    return res.status(201).json({ business: data });
  } catch (error) {
    return next(error);
  }
});

export default router;
