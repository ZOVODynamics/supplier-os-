import { safeQuery } from '../db.js';

function getNumeric(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function getRequestId(request) {
  return request?.id || request?.request_id || null;
}

function getBusinessId(request) {
  return request?.business_id || request?.businessId || null;
}

function getSupplierId(supplier) {
  return supplier?.id || supplier?.supplier_id || null;
}

export function calculateSplit(amount) {
  const totalAmount = getNumeric(amount);

  return {
    platform_fee: roundCurrency(totalAmount * 0.2),
    supplier_payment: roundCurrency(totalAmount * 0.8),
  };
}

export async function createLedgerEntry(request, supplier) {
  try {
    const requestId = getRequestId(request);
    const supplierId = getSupplierId(supplier);
    const totalAmount = getNumeric(request?.budget);

    if (!requestId || !supplierId) {
      console.warn('[ledger] entry skipped: request_id or supplier_id missing');
      return null;
    }

    if (totalAmount <= 0) {
      console.warn(`[ledger] entry skipped for request ${requestId}: budget missing or invalid`);
      return null;
    }

    const existing = await safeQuery('ledger', (db) =>
      db.from('ledger').select('*').eq('request_id', requestId).eq('supplier_id', supplierId).limit(1),
    );

    if (existing.ok && Array.isArray(existing.data) && existing.data.length > 0) {
      console.log(`[ledger] existing ledger entry reused for request ${requestId}`);
      return existing.data[0];
    }

    const split = calculateSplit(totalAmount);
    const ledgerEntry = {
      request_id: requestId,
      business_id: getBusinessId(request),
      supplier_id: supplierId,
      total_amount: roundCurrency(totalAmount),
      platform_fee: split.platform_fee,
      supplier_payment: split.supplier_payment,
      created_at: new Date().toISOString(),
    };

    const result = await safeQuery('ledger', (db) =>
      db.from('ledger').insert(ledgerEntry).select('*'),
    );

    if (!result.ok) {
      console.warn(`[ledger] entry insert skipped: ${result.error}`);
      return null;
    }

    console.log(
      `[ledger] recorded $${split.platform_fee.toFixed(2)} platform fee for request ${requestId}`,
    );

    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    console.error('[ledger] entry creation failed safely:', error);
    return null;
  }
}

export async function getRevenueSummary() {
  try {
    const result = await safeQuery('ledger', (db) =>
      db.from('ledger').select('total_amount, platform_fee'),
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        total_revenue: 0,
        total_volume: 0,
        transactions: 0,
      };
    }

    const rows = Array.isArray(result.data) ? result.data : [];
    const summary = rows.reduce(
      (totals, row) => ({
        total_revenue: totals.total_revenue + getNumeric(row.platform_fee),
        total_volume: totals.total_volume + getNumeric(row.total_amount),
        transactions: totals.transactions + 1,
      }),
      {
        total_revenue: 0,
        total_volume: 0,
        transactions: 0,
      },
    );

    return {
      ok: true,
      error: null,
      total_revenue: roundCurrency(summary.total_revenue),
      total_volume: roundCurrency(summary.total_volume),
      transactions: summary.transactions,
    };
  } catch (error) {
    console.error('[ledger] revenue summary failed safely:', error);
    return {
      ok: false,
      error: 'revenue_unavailable',
      total_revenue: 0,
      total_volume: 0,
      transactions: 0,
    };
  }
}
