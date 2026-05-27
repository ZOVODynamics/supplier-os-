import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db.js';

export async function createBusiness(req, res) {
  const { name, contact_email, industry, metadata } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Business name is required.',
    });
  }

  const payload = {
    id: uuidv4(),
    name: name.trim(),
    contact_email: contact_email || null,
    industry: industry || null,
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  };

  const { data, error } = await supabase
    .from('businesses')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return res.status(400).json({
      error: 'BusinessCreateFailed',
      message: error.message,
    });
  }

  return res.status(201).json({ business: data });
}
