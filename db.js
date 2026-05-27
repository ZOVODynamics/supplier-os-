const { createClient } = require('@supabase/supabase-js');

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];
let supabaseClient;

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required. Add it to your .env file.`);
  }

  if (value.includes('<<PUT_HERE>>')) {
    throw new Error(`${name} must be set to a real Supabase value before startup.`);
  }

  return value;
}

function getSupabaseConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    url: requireEnv('SUPABASE_URL'),
    key: requireEnv('SUPABASE_KEY'),
  };
}

function getSupabaseClient() {
  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();

    supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

async function testSupabaseConnection() {
  const { url, key } = getSupabaseConfig();

  const response = await fetch(new URL('/rest/v1/', url), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const message = detail ? `: ${detail.slice(0, 200)}` : '';

    throw new Error(`Supabase health check failed with HTTP ${response.status}${message}`);
  }

  return true;
}

module.exports = {
  getSupabaseClient,
  testSupabaseConnection,
};
