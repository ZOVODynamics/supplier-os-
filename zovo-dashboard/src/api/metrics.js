import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

async function safeGet(path, fallback) {
  try {
    const response = await api.get(path);
    return {
      data: response.data ?? fallback,
      error: response.data?.error || null,
    };
  } catch (error) {
    return {
      data: fallback,
      error: error.response?.data?.error || error.message || 'request_failed',
    };
  }
}

export async function getRevenueMetrics() {
  return safeGet('/revenue', {
    total_revenue: 0,
    total_volume: 0,
    transactions: 0,
  });
}

export async function getHealthMetrics() {
  return safeGet('/health', {
    status: 'unknown',
    supabase: {
      connected: false,
      status: 'unknown',
    },
  });
}

export async function getSupplierCount() {
  const result = await safeGet('/suppliers', {
    data: [],
  });

  const suppliers = Array.isArray(result.data?.data)
    ? result.data.data
    : Array.isArray(result.data)
      ? result.data
      : [];

  return {
    count: suppliers.length,
    error: result.error,
  };
}
