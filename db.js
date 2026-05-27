import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];

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
  try {
    const { error } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    return {
      connected: !error,
      error: error?.message ?? null
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}
