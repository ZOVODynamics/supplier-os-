import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

function isConfigured(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export const supabaseConfig = {
  url: supabaseUrl,
  hasAnonKey: isConfigured(supabaseAnonKey),
};

export const supabase =
  isConfigured(supabaseUrl) && isConfigured(supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      })
    : null;

export function getSupabaseStatus() {
  if (!supabase) {
    return {
      connected: false,
      status: 'missing_configuration',
      message: 'SUPABASE_URL and SUPABASE_ANON_KEY are required.',
    };
  }

  return {
    connected: true,
    status: 'client_initialized',
    url: supabaseConfig.url,
  };
}
