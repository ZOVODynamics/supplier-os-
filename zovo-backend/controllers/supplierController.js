import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db.js';

const SUPPLIER_TYPES = new Set(['human', 'ai']);

export async function createSupplier(req, res) {
  const { name, type = 'human', contact_email, capabilities, metadata } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Supplier name is required.',
    });
  }

  if (!SUPPLIER_TYPES.has(type)) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Supplier type must be either "human" or "ai".',
    });
  }

  const payload = {
    id: uuidv4(),
    name: name.trim(),
    type,
    contact_email: contact_email || null,
    capabilities: Array.isArray(capabilities) ? capabilities : [],
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  };

  const { data, error } = await supabase
    .from('suppliers')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return res.status(400).json({
      error: 'SupplierCreateFailed',
      message: error.message,
    });
  }

  return res.status(201).json({ supplier: data });
}
