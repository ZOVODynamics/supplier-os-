import { safeQuery } from '../db.js';

function normalizeText(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  if (value && typeof value === 'object') {
    return Object.values(value).join(' ');
  }

  return String(value || '');
}

function getTitleKeywords(title) {
  return normalizeText(title)
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
  const keywords = getTitleKeywords(request?.title);
  const skillsText = normalizeText(supplier?.skills).toLowerCase();
  const hasSkillMatch = keywords.some((keyword) => skillsText.includes(keyword));
  const trustScore = getNumeric(supplier?.trust_score);
  const rating = getNumeric(supplier?.rating);

  return (hasSkillMatch ? 40 : 0) + trustScore * 0.3 + rating * 10;
}

export async function findBestSupplier(request) {
  try {
    const result = await safeQuery('suppliers', (db) => db.from('suppliers').select('*'));

    if (!result.ok) {
      console.warn(`[ai] supplier lookup skipped: ${result.error}`);
      return null;
    }

    const suppliers = Array.isArray(result.data) ? result.data : [];
    if (!suppliers.length) {
      console.warn('[ai] supplier lookup skipped: no suppliers found');
      return null;
    }

    let bestMatch = null;

    for (const supplier of suppliers) {
      const supplierId = getSupplierId(supplier);
      if (!supplierId) {
        continue;
      }

      const score = scoreSupplier(request, supplier);

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          supplier,
          score,
        };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('[ai] supplier matching failed safely:', error);
    return null;
  }
}
