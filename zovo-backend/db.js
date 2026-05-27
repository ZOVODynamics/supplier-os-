const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const CONNECTION_TIMEOUT_MS = 5000;

function getConfigurationError() {
  if (!SUPABASE_URL) {
    return 'SUPABASE_URL is not configured.';
  }

  if (!SUPABASE_KEY) {
    return 'SUPABASE_KEY is not configured.';
  }

  try {
    const parsedUrl = new URL(SUPABASE_URL);
    if (!parsedUrl.protocol.startsWith('http')) {
      return 'SUPABASE_URL must be an HTTP(S) URL.';
    }
  } catch {
    return 'SUPABASE_URL is not a valid URL.';
  }

  return null;
}

function cleanErrorMessage(error) {
  if (error && typeof error.message === 'string') {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return 'Supabase connection timed out.';
    }

    return error.message.replace(SUPABASE_KEY || '', '[redacted]');
  }

  return 'Supabase connection failed.';
}

const configurationError = getConfigurationError();
let initializationError = null;
let supabase = null;

if (!configurationError) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    initializationError = cleanErrorMessage(error);
  }
}

async function validateSupabaseConnection() {
  if (configurationError) {
    return { connected: false, error: configurationError };
  }

  if (initializationError) {
    return { connected: false, error: initializationError };
  }

  const restUrl = new URL('/rest/v1/', SUPABASE_URL).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);

  try {
    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        connected: false,
        error: `Supabase health check failed with status ${response.status}.`,
      };
    }

    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: cleanErrorMessage(error) };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  supabase,
  validateSupabaseConnection,
};
