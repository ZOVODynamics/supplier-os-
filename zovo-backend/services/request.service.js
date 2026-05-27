import { safeQuery } from '../db.js';
import { findBestSupplier } from './ai.service.js';

function getRequestId(request) {
  return request?.id || request?.request_id || null;
}

function getSupplierId(supplier) {
  return supplier?.id || supplier?.supplier_id || null;
}

export async function autoAssignSupplier(request) {
  try {
    const requestId = getRequestId(request);
    if (!requestId) {
      console.warn('[request] supplier assignment skipped: request id missing');
      return null;
    }

    const match = await findBestSupplier(request);
    if (!match?.supplier) {
      return null;
    }

    const supplierId = getSupplierId(match.supplier);
    if (!supplierId) {
      console.warn('[request] supplier assignment skipped: supplier id missing');
      return null;
    }

    const result = await safeQuery('executions', (db) =>
      db
        .from('executions')
        .insert({
          request_id: requestId,
          supplier_id: supplierId,
          status: 'assigned',
        })
        .select('*'),
    );

    if (!result.ok) {
      console.warn(`[request] execution insert skipped: ${result.error}`);
      return null;
    }

    console.log(
      `[request] assigned supplier ${supplierId} to request ${requestId} with score ${match.score.toFixed(2)}`,
    );

    return {
      execution: Array.isArray(result.data) ? result.data[0] : result.data,
      supplier: match.supplier,
      score: match.score,
    };
  } catch (error) {
    console.error('[request] supplier assignment failed safely:', error);
    return null;
  }
}

export function triggerAutoAssignSupplier(request) {
  setImmediate(() => {
    autoAssignSupplier(request).catch((error) => {
      console.error('[request] background supplier assignment failed safely:', error);
    });
  });
}
