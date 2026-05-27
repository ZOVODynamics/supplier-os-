import { safeQuery } from '../db.js';
import { findBestSupplier } from './ai.service.js';
import { createLedgerEntry } from './ledger.service.js';
import { recordInsight } from './insights.service.js';

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

export async function completeExecution(executionId) {
  try {
    const executionResult = await safeQuery('executions', (db) =>
      db.from('executions').select('*').eq('id', executionId).limit(1),
    );

    if (!executionResult.ok || !executionResult.data?.length) {
      return {
        ok: false,
        error: executionResult.error || 'execution_not_found',
        data: null,
      };
    }

    const execution = executionResult.data[0];
    const requestId = execution.request_id;
    const supplierId = execution.supplier_id;

    const requestResult = await safeQuery('requests', (db) =>
      db.from('requests').select('*').eq('id', requestId).limit(1),
    );
    const supplierResult = await safeQuery('suppliers', (db) =>
      db.from('suppliers').select('*').eq('id', supplierId).limit(1),
    );

    const request = requestResult.ok ? requestResult.data?.[0] : null;
    const supplier = supplierResult.ok ? supplierResult.data?.[0] : null;

    const updateExecutionResult = await safeQuery('executions', (db) =>
      db.from('executions').update({ status: 'done' }).eq('id', executionId).select('*'),
    );

    if (!updateExecutionResult.ok) {
      return {
        ok: false,
        error: updateExecutionResult.error,
        data: null,
      };
    }

    const ledger = request && supplier ? await createLedgerEntry(request, supplier) : null;

    if (request) {
      await safeQuery('requests', (db) =>
        db.from('requests').update({ status: 'completed' }).eq('id', requestId).select('*'),
      );
    }

    await recordInsight({
      request,
      supplier,
      success: Boolean(ledger),
      performance: ledger ? 100 : 0,
      notes: ledger ? 'execution_completed' : 'ledger_not_created',
    });

    return {
      ok: true,
      error: null,
      data: {
        execution: updateExecutionResult.data?.[0] || execution,
        ledger,
      },
    };
  } catch (error) {
    console.error('[request] complete execution failed safely:', error);
    return {
      ok: false,
      error: 'execution_completion_failed',
      data: null,
    };
  }
}
