import { safeQuery } from '../db.js';

function getRequestType(request) {
  return String(request?.title || 'unknown')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3)
    .slice(0, 3)
    .join('_') || 'unknown';
}

export async function recordInsight({ request, supplier, success, performance = 0, notes = null }) {
  try {
    const payload = {
      request_id: request?.id || request?.request_id || null,
      supplier_id: supplier?.id || supplier?.supplier_id || null,
      request_type: getRequestType(request),
      success: Boolean(success),
      supplier_performance: Number.isFinite(Number(performance)) ? Number(performance) : 0,
      notes,
      created_at: new Date().toISOString(),
    };

    const result = await safeQuery('insights', (db) => db.from('insights').insert(payload).select('*'));

    if (!result.ok) {
      console.warn(`[insights] record skipped: ${result.error}`);
      return null;
    }

    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    console.error('[insights] record failed safely:', error);
    return null;
  }
}

export async function getInsightAdjustment(request) {
  try {
    const requestType = getRequestType(request);
    const result = await safeQuery('insights', (db) =>
      db.from('insights').select('success, supplier_performance').eq('request_type', requestType).limit(25),
    );

    if (!result.ok || !Array.isArray(result.data) || result.data.length === 0) {
      return 0;
    }

    const successRate =
      result.data.filter((row) => row.success).length / Math.max(result.data.length, 1);
    const averagePerformance =
      result.data.reduce((sum, row) => sum + Number(row.supplier_performance || 0), 0) /
      Math.max(result.data.length, 1);

    return Math.min(10, Math.max(0, successRate * 5 + averagePerformance * 0.05));
  } catch (error) {
    console.error('[insights] adjustment failed safely:', error);
    return 0;
  }
}
