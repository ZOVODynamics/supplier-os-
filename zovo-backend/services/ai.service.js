import { safeQuery } from '../db.js';
import { getInsightAdjustment } from './insights.service.js';
import { autoGenerateSupplierFromRequest, ensureSuppliersExist } from './supplier.service.js';

function normalizeText(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  if (value && typeof value === 'object') {
    return Object.values(value).join(' ');
  }

  return String(value || '');
}

function getRequestKeywords(request) {
  return `${normalizeText(request?.title)} ${normalizeText(request?.description)}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);
}

function getNumeric(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getSupplierId(supplier) {
  return supplier?.id || supplier?.supplier_id || null;
}

function scoreSupplier(request, supplier) {
  const keywords = getRequestKeywords(request);
  const skillsText = normalizeText(supplier?.skills).toLowerCase();
  const matchedKeywords = keywords.filter((keyword) => skillsText.includes(keyword));
  const skillScore = keywords.length ? (matchedKeywords.length / keywords.length) * 40 : 0;
  const trustScore = Math.min(getNumeric(supplier?.trust_score), 100) * 0.3;
  const ratingScore = Math.min(getNumeric(supplier?.rating), 5) * 6;

  return {
    score: skillScore + trustScore + ratingScore,
    reason: {
      matched_keywords: matchedKeywords,
      skill_score: skillScore,
      trust_score: trustScore,
      rating_score: ratingScore,
    },
  };
}

export async function findBestSupplier(request) {
  try {
    await ensureSuppliersExist();
    const insightAdjustment = await getInsightAdjustment(request);

    const result = await safeQuery('suppliers', (db) => db.from('suppliers').select('*'));

    if (!result.ok) {
      console.warn(`[ai] supplier lookup skipped: ${result.error}`);
      return null;
    }

    const suppliers = Array.isArray(result.data) ? result.data : [];
    if (!suppliers.length) {
      const generatedSupplier = await autoGenerateSupplierFromRequest(request);
      return generatedSupplier ? { supplier: generatedSupplier, score: 70, reason: 'generated_supplier' } : null;
    }

    let bestMatch = null;

    for (const supplier of suppliers) {
      const supplierId = getSupplierId(supplier);
      if (!supplierId) {
        continue;
      }

      const scoredSupplier = scoreSupplier(request, supplier);

      if (!bestMatch || scoredSupplier.score > bestMatch.score) {
        bestMatch = {
          supplier,
          score: scoredSupplier.score + insightAdjustment,
          reason: scoredSupplier.reason,
        };
      }
    }

    if (!bestMatch || bestMatch.reason?.matched_keywords?.length === 0) {
      const generatedSupplier = await autoGenerateSupplierFromRequest(request);
      if (generatedSupplier) {
        return {
          supplier: generatedSupplier,
          score: Math.max(bestMatch?.score || 0, 72),
          reason: 'generated_supplier',
        };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('[ai] supplier matching failed safely:', error);
    return null;
  }
}
