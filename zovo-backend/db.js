import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = isConfigured(process.env.SUPABASE_URL) &&
  !process.env.SUPABASE_URL.includes('your-project.supabase.co')
  ? process.env.SUPABASE_URL
  : undefined;
const supabaseAnonKey = [process.env.SUPABASE_KEY, process.env.SUPABASE_ANON_KEY].find(
  (value) => isConfigured(value) && !value.includes('your-supabase'),
);
const QUERY_TIMEOUT_MS = Number(process.env.SUPABASE_QUERY_TIMEOUT_MS) || 5000;
const REQUIRED_TABLES = ['requests', 'businesses', 'suppliers', 'executions', 'ledger'];

function isConfigured(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatError(error) {
  if (!error) {
    return null;
  }

  const fallbackMessage =
    typeof error === 'object' ? JSON.stringify(error) : String(error);

  return {
    code: error.code || error.name || 'unknown_error',
    message: error.message || fallbackMessage,
    details: error.details,
    hint: error.hint,
  };
}

function isMissingTableError(error) {
  const code = error?.code;
  const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ').toLowerCase();

  if (message.includes('column ') || message.includes('could not find the') && message.includes('column')) {
    return false;
  }

  return (
    code === '42P01' ||
    code === 'PGRST106' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes("could not find the table")
  );
}

function isUnavailableError(error) {
  const message = [error?.message, error?.details, error?.hint, error?.code, error?.name, error]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    error?.name === 'AbortError' ||
    message.includes('aborterror') ||
    message.includes('aborted') ||
    message.includes('fetch failed') ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('db_unavailable')
  );
}

function fallback(error, table, status = 200) {
  return {
    ok: false,
    table,
    error,
    status,
    data: [],
  };
}

async function withTimeout(operation, timeoutMs, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const supabaseConfig = {
  url: supabaseUrl,
  hasAnonKey: isConfigured(supabaseAnonKey),
  requiredTables: REQUIRED_TABLES,
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

const supabaseHealth = {
  configured: Boolean(supabase),
  connected: false,
  status: supabase ? 'pending_validation' : 'missing_configuration',
  url: supabaseUrl,
  lastCheckedAt: null,
  tables: Object.fromEntries(
    REQUIRED_TABLES.map((table) => [
      table,
      {
        table,
        exists: false,
        status: 'MISSING',
      },
    ]),
  ),
};

function setTableStatus(tableName, status) {
  supabaseHealth.tables[tableName] = {
    table: tableName,
    ...status,
  };
}

export async function checkTableExists(tableName) {
  if (!supabase) {
    const status = {
      exists: false,
      status: 'MISSING',
      error: 'db_unavailable',
      details: {
        message: 'SUPABASE_URL and SUPABASE_ANON_KEY are required.',
      },
    };

    setTableStatus(tableName, status);
    return {
      table: tableName,
      ...status,
    };
  }

  try {
    const result = await withTimeout(
      (signal) =>
        supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .abortSignal(signal),
      QUERY_TIMEOUT_MS,
      `Supabase table validation for ${tableName}`,
    );

    supabaseHealth.connected = true;

    if (result.error) {
      const missing = isMissingTableError(result.error);
      const unavailable = isUnavailableError(result.error);
      const status = {
        exists: false,
        status: 'MISSING',
        error: missing ? 'table_missing' : 'table_validation_failed',
        details: formatError(result.error),
      };

      if (unavailable) {
        supabaseHealth.connected = false;
        supabaseHealth.status = 'unavailable';
        status.error = 'db_unavailable';
      }

      setTableStatus(tableName, status);
      return {
        table: tableName,
        ...status,
      };
    }

    const status = {
      exists: true,
      status: 'OK',
      error: null,
    };

    setTableStatus(tableName, status);
    return {
      table: tableName,
      ...status,
    };
  } catch (error) {
    supabaseHealth.connected = false;
    supabaseHealth.status = 'unavailable';

    const status = {
      exists: false,
      status: 'MISSING',
      error: 'db_unavailable',
      details: formatError(error),
    };

    setTableStatus(tableName, status);
    return {
      table: tableName,
      ...status,
    };
  }
}

export async function validateSupabaseHealth() {
  supabaseHealth.lastCheckedAt = new Date().toISOString();

  if (!supabase) {
    console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY; API will use safe fallbacks.');
    REQUIRED_TABLES.forEach((table) => {
      setTableStatus(table, {
        exists: false,
        status: 'MISSING',
        error: 'db_unavailable',
      });
      console.warn(`[supabase] table ${table}: MISSING`);
    });
    return getSupabaseStatus();
  }

  const tableStatuses = await Promise.all(REQUIRED_TABLES.map((table) => checkTableExists(table)));
  const hasUnavailableStatus = tableStatuses.some((table) => table.error === 'db_unavailable');
  const hasMissingTables = tableStatuses.some((table) => table.status === 'MISSING');

  supabaseHealth.connected = !hasUnavailableStatus;
  supabaseHealth.status = hasUnavailableStatus
    ? 'unavailable'
    : hasMissingTables
      ? 'degraded'
      : 'ok';

  if (supabaseHealth.connected) {
    console.log(`[supabase] URL connected: ${supabaseUrl}`);
  } else {
    console.warn(`[supabase] URL connection failed: ${supabaseUrl}`);
  }

  tableStatuses.forEach((table) => {
    const log = table.status === 'OK' ? console.log : console.warn;
    log(`[supabase] table ${table.table}: ${table.status}`);
  });

  return getSupabaseStatus();
}

export async function safeQuery(table, queryFn) {
  if (!supabase || !supabaseHealth.connected) {
    return fallback('db_unavailable', table, 503);
  }

  const tableStatus = supabaseHealth.tables[table];
  if (tableStatus?.status === 'MISSING') {
    const refreshedStatus = await checkTableExists(table);
    if (refreshedStatus.status === 'MISSING') {
      return fallback(refreshedStatus.error || 'table_missing', table);
    }
  }

  try {
    const result = await withTimeout(
      async (signal) => {
        const query = queryFn(supabase);

        if (query && typeof query.abortSignal === 'function') {
          return query.abortSignal(signal);
        }

        return query;
      },
      QUERY_TIMEOUT_MS,
      `Supabase query for ${table}`,
    );

    if (result?.error) {
      if (isMissingTableError(result.error)) {
        setTableStatus(table, {
          exists: false,
          status: 'MISSING',
          error: 'table_missing',
          details: formatError(result.error),
        });
        console.warn(`[supabase] table ${table}: MISSING`);
        return fallback('table_missing', table, result.status || 200);
      }

      if (isUnavailableError(result.error)) {
        supabaseHealth.connected = false;
        supabaseHealth.status = 'unavailable';
        console.warn(`[supabase] query unavailable for ${table}: ${result.error.message}`);
        return fallback('db_unavailable', table, result.status || 503);
      }

      console.warn(`[supabase] query failed for ${table}: ${result.error.message}`);
      return {
        ...fallback('query_failed', table, result.status || 200),
        details: formatError(result.error),
      };
    }

    return {
      ok: true,
      table,
      error: null,
      status: result?.status || 200,
      count: result?.count,
      data: result?.data ?? [],
    };
  } catch (error) {
    if (isUnavailableError(error)) {
      supabaseHealth.connected = false;
      supabaseHealth.status = 'unavailable';
      console.warn(`[supabase] query unavailable for ${table}: ${error.message}`);
      return {
        ...fallback('db_unavailable', table, 503),
        details: formatError(error),
      };
    }

    console.warn(`[supabase] safe query caught error for ${table}: ${error.message}`);
    return {
      ...fallback('query_failed', table),
      details: formatError(error),
    };
  }
}

export function getSupabaseStatus() {
  if (!supabase) {
    return {
      connected: false,
      status: 'missing_configuration',
      message: 'SUPABASE_URL and SUPABASE_ANON_KEY are required.',
      tables: supabaseHealth.tables,
    };
  }

  return {
    connected: supabaseHealth.connected,
    status: supabaseHealth.status,
    url: supabaseConfig.url,
    lastCheckedAt: supabaseHealth.lastCheckedAt,
    tables: supabaseHealth.tables,
  };
}
