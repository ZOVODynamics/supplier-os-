import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();

function isValidUrl(value) {
  try {
    return Boolean(value && new URL(value));
  } catch {
    return false;
  }
}

export const supabaseConfig = {
  url: supabaseUrl || '',
  hasKey: Boolean(supabaseKey),
  isConfigured: Boolean(supabaseUrl && supabaseKey && isValidUrl(supabaseUrl)),
};

export const supabase = supabaseConfig.isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export async function validateSupabaseConnection() {
  if (!supabaseConfig.isConfigured || !supabase) {
    return {
      ok: false,
      configured: false,
      message: 'SUPABASE_URL and SUPABASE_KEY must be set in zovo-backend/.env',
    };
  }

  const startedAt = Date.now();
  const { error } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return {
      ok: false,
      configured: true,
      latencyMs: Date.now() - startedAt,
      message: 'Supabase responded, but the schema may be missing or credentials are invalid.',
      error: error.message,
    };
  }

  return {
    ok: true,
    configured: true,
    latencyMs: Date.now() - startedAt,
    message: 'Supabase connection validated.',
  };
}
