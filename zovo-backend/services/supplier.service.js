import { v4 as uuidv4 } from 'uuid';
import { safeQuery } from '../db.js';

const SEEDED_SUPPLIERS = [
  {
    company_name: 'Atlas Packaging Partners',
    category: 'packaging retail boxes fulfillment launch',
    country: 'US',
    trust_score: 94,
    email: 'hello+atlas@zovo.ai',
    website: 'https://zovo.ai/suppliers/atlas-packaging',
  },
  {
    company_name: 'Northstar Manufacturing Network',
    category: 'manufacturing assembly hardware production qa',
    country: 'US',
    trust_score: 91,
    email: 'hello+northstar@zovo.ai',
    website: 'https://zovo.ai/suppliers/northstar-manufacturing',
  },
  {
    company_name: 'Cobalt Logistics Group',
    category: 'logistics shipping freight warehousing delivery',
    country: 'US',
    trust_score: 88,
    email: 'hello+cobalt@zovo.ai',
    website: 'https://zovo.ai/suppliers/cobalt-logistics',
  },
  {
    company_name: 'Brightline Creative Supply',
    category: 'branding print creative merchandise design',
    country: 'US',
    trust_score: 86,
    email: 'hello+brightline@zovo.ai',
    website: 'https://zovo.ai/suppliers/brightline-creative',
  },
  {
    company_name: 'Apex Sourcing Collective',
    category: 'sourcing procurement vendor supplier marketplace',
    country: 'US',
    trust_score: 90,
    email: 'hello+apex@zovo.ai',
    website: 'https://zovo.ai/suppliers/apex-sourcing',
  },
];

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function getKeywords(request) {
  return `${normalizeText(request?.title)} ${normalizeText(request?.description)}`
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);
}

function toSupplierPayload(supplier) {
  return {
    id: supplier.id || uuidv4(),
    company_name: supplier.company_name || supplier.name,
    category: Array.isArray(supplier.category) ? supplier.category.join(' ') : supplier.category,
    country: supplier.country || 'US',
    trust_score: supplier.trust_score,
    email: supplier.email,
    website: supplier.website,
  };
}

async function insertSuppliers(suppliers) {
  const result = await safeQuery('suppliers', (db) =>
    db.from('suppliers').insert(suppliers.map(toSupplierPayload)).select('*'),
  );

  if (!result.ok) {
    console.warn(`[supplier] seed insert skipped: ${result.error}`);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function getSuppliers() {
  const result = await safeQuery('suppliers', (db) => db.from('suppliers').select('*'));

  if (!result.ok) {
    console.warn(`[supplier] lookup failed safely: ${result.error}`);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function ensureSuppliersExist() {
  try {
    const existingSuppliers = await getSuppliers();
    if (existingSuppliers.length > 0) {
      return existingSuppliers;
    }

    console.log('[supplier] no suppliers found; seeding default supplier network');
    return insertSuppliers(SEEDED_SUPPLIERS);
  } catch (error) {
    console.error('[supplier] ensure suppliers failed safely:', error);
    return [];
  }
}

export async function autoGenerateSupplierFromRequest(request) {
  try {
    const keywords = getKeywords(request);
    const primarySkill = keywords[0] || 'execution';
    const secondarySkill = keywords[1] || 'supplier';
    const generatedSupplier = {
      company_name: `ZOVO Auto Supplier - ${primarySkill}`,
      category: [...new Set([primarySkill, secondarySkill, 'execution', 'sourcing', 'supplier'])].join(' '),
      country: 'US',
      trust_score: 82,
      email: `auto+${primarySkill}@zovo.ai`,
      website: `https://zovo.ai/suppliers/auto-${primarySkill}`,
    };

    const inserted = await insertSuppliers([generatedSupplier]);
    const supplier = inserted[0] || null;

    if (supplier) {
      console.log(`[supplier] generated supplier ${supplier.id} for request ${request?.id || 'unknown'}`);
    }

    return supplier;
  } catch (error) {
    console.error('[supplier] auto generation failed safely:', error);
    return null;
  }
}
