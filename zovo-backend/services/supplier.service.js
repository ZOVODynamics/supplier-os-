import { v4 as uuidv4 } from 'uuid';
import { safeQuery } from '../db.js';

const SEEDED_SUPPLIERS = [
  {
    name: 'Atlas Packaging Partners',
    skills: ['packaging', 'retail', 'boxes', 'fulfillment', 'launch'],
    trust_score: 94,
    rating: 4.8,
  },
  {
    name: 'Northstar Manufacturing Network',
    skills: ['manufacturing', 'assembly', 'hardware', 'production', 'qa'],
    trust_score: 91,
    rating: 4.7,
  },
  {
    name: 'Cobalt Logistics Group',
    skills: ['logistics', 'shipping', 'freight', 'warehousing', 'delivery'],
    trust_score: 88,
    rating: 4.6,
  },
  {
    name: 'Brightline Creative Supply',
    skills: ['branding', 'print', 'creative', 'merchandise', 'design'],
    trust_score: 86,
    rating: 4.5,
  },
  {
    name: 'Apex Sourcing Collective',
    skills: ['sourcing', 'procurement', 'vendor', 'supplier', 'marketplace'],
    trust_score: 90,
    rating: 4.7,
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
    name: supplier.name,
    skills: Array.isArray(supplier.skills) ? supplier.skills : String(supplier.skills || '').split(','),
    trust_score: supplier.trust_score,
    rating: supplier.rating,
  };
}

function toTextSkillsSupplierPayload(supplier) {
  const payload = toSupplierPayload(supplier);
  return {
    ...payload,
    skills: Array.isArray(payload.skills) ? payload.skills.join(', ') : payload.skills,
  };
}

async function insertSuppliers(suppliers) {
  let result = await safeQuery('suppliers', (db) =>
    db.from('suppliers').insert(suppliers.map(toSupplierPayload)).select('*'),
  );

  if (!result.ok && result.error === 'query_failed') {
    result = await safeQuery('suppliers', (db) =>
      db.from('suppliers').insert(suppliers.map(toTextSkillsSupplierPayload)).select('*'),
    );
  }

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
      name: `ZOVO Auto Supplier - ${primarySkill}`,
      skills: [...new Set([primarySkill, secondarySkill, 'execution', 'sourcing', 'supplier'])],
      trust_score: 82,
      rating: 4.3,
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
