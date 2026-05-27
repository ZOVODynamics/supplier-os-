import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db.js';

const REQUEST_COLUMNS = `
  id,
  title,
  description,
  category,
  status,
  budget_cents,
  commission_rate,
  currency,
  due_at,
  created_at,
  updated_at,
  businesses (
    id,
    name,
    contact_email
  ),
  suppliers (
    id,
    name,
    type
  )
`;

export async function listRequests(req, res) {
  const { status, business_id, supplier_id } = req.query;

  let query = supabase
    .from('requests')
    .select(REQUEST_COLUMNS)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (business_id) query = query.eq('business_id', business_id);
  if (supplier_id) query = query.eq('supplier_id', supplier_id);

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({
      error: 'RequestsFetchFailed',
      message: error.message,
    });
  }

  return res.json({ requests: data });
}

export async function createRequest(req, res) {
  const {
    business_id,
    supplier_id,
    title,
    description,
    category,
    budget_cents,
    commission_rate,
    currency = 'USD',
    due_at,
    metadata,
  } = req.body;

  if (!business_id) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'business_id is required.',
    });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Request title is required.',
    });
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Request description is required.',
    });
  }

  const payload = {
    id: uuidv4(),
    business_id,
    supplier_id: supplier_id || null,
    title: title.trim(),
    description: description.trim(),
    category: category || null,
    budget_cents: Number.isInteger(budget_cents) ? budget_cents : null,
    commission_rate: typeof commission_rate === 'number' ? commission_rate : undefined,
    currency: String(currency).slice(0, 3).toUpperCase(),
    due_at: due_at || null,
    status: supplier_id ? 'assigned' : 'open',
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  };

  const { data, error } = await supabase
    .from('requests')
    .insert(payload)
    .select(REQUEST_COLUMNS)
    .single();

  if (error) {
    return res.status(400).json({
      error: 'RequestCreateFailed',
      message: error.message,
    });
  }

  return res.status(201).json({ request: data });
}
