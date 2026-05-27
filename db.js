import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];
const DEFAULT_HEALTH_TIMEOUT_MS = 2500;

function readRequiredEnv(name) {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function getSupabaseConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name] || process.env[name].trim() === '');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const url = readRequiredEnv('SUPABASE_URL');
  const key = readRequiredEnv('SUPABASE_KEY');

  try {
    const parsedUrl = new URL(url);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('SUPABASE_URL must use http or https');
    }
  } catch (error) {
    throw new Error(`Invalid SUPABASE_URL: ${error.message}`);
  }

  return { url, key };
}

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'zovo-supplier-ai-backend'
    }
  }
});

export async function checkSupabaseConnection() {
  const controller = new AbortController();
  const timeoutMs = Number.parseInt(process.env.SUPABASE_HEALTH_TIMEOUT_MS ?? `${DEFAULT_HEALTH_TIMEOUT_MS}`, 10);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { error } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .limit(1)
      .abortSignal(controller.signal);

    return {
      connected: !error,
      error: error?.message ?? null
    };
  } catch (error) {
    return {
      connected: false,
      error: error.name === 'AbortError'
        ? `Supabase health check timed out after ${timeoutMs}ms`
        : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}
