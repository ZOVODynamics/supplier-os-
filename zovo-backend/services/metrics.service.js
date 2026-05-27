import { safeQuery } from '../db.js';
import { getRevenueSummary } from './ledger.service.js';

function asRows(result) {
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

function percent(part, total) {
  if (!total) {
    return 0;
  }

  return Math.round((part / total) * 10000) / 100;
}

export async function getOverviewMetrics() {
  try {
    const [revenue, requestsResult, executionsResult, suppliersResult] = await Promise.all([
      getRevenueSummary(),
      safeQuery('requests', (db) => db.from('requests').select('id, status')),
      safeQuery('executions', (db) => db.from('executions').select('id, request_id, supplier_id, status')),
      safeQuery('suppliers', (db) => db.from('suppliers').select('id')),
    ]);

    const requests = asRows(requestsResult);
    const executions = asRows(executionsResult);
    const suppliers = asRows(suppliersResult);
    const executedRequestIds = new Set(executions.map((execution) => execution.request_id).filter(Boolean));
    const successfulExecutions = executions.filter((execution) => execution.supplier_id);

    return {
      ok: true,
      total_revenue: revenue.total_revenue,
      total_volume: revenue.total_volume,
      total_requests: requests.length,
      conversion_rate: percent(executedRequestIds.size, requests.length),
      ai_success_rate: percent(successfulExecutions.length, requests.length),
      active_suppliers: suppliers.length,
    };
  } catch (error) {
    console.error('[metrics] overview failed safely:', error);
    return {
      ok: false,
      error: 'metrics_unavailable',
      total_revenue: 0,
      total_volume: 0,
      total_requests: 0,
      conversion_rate: 0,
      ai_success_rate: 0,
      active_suppliers: 0,
    };
  }
}
