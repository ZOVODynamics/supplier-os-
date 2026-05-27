import { validateSupabaseConnection } from '../db.js';

export async function getHealth(req, res) {
  const supabase = await validateSupabaseConnection();
  const ok = supabase.ok;

  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    service: 'zovo-supplier-ai-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    backend: {
      ok: true,
      message: 'Express API is running.',
    },
    supabase,
  });
}
