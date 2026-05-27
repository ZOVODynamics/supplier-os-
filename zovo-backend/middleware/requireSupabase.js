import { supabase } from '../db.js';

export function requireSupabase(req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      error: 'SupabaseNotConfigured',
      message: 'Add SUPABASE_URL and SUPABASE_KEY to zovo-backend/.env before using data endpoints.',
    });
  }

  return next();
}
