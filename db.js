const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];

function getMissingEnvironmentVariables(env = process.env) {
  return REQUIRED_ENV.filter((key) => !env[key] || env[key].trim() === '');
}

function validateEnvironment(env = process.env) {
  const missing = getMissingEnvironmentVariables(env);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  try {
    // Throws on malformed values while allowing Supabase's hosted and local URLs.
    new URL(env.SUPABASE_URL.trim());
  } catch (error) {
    throw new Error('SUPABASE_URL must be a valid URL');
  }
}

function createSupabaseClient(env = process.env) {
  validateEnvironment(env);

  return createClient(env.SUPABASE_URL.trim(), env.SUPABASE_KEY.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'zovo-supplier-ai-backend',
      },
    },
  });
}

const supabase = createSupabaseClient();

async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('businesses').select('id').limit(1);

    return {
      connected: !error,
      error: error ? error.message : null,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

module.exports = {
  supabase,
  createSupabaseClient,
  validateEnvironment,
  getMissingEnvironmentVariables,
  checkSupabaseConnection,
};
