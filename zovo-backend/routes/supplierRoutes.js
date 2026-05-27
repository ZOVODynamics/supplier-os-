import { Router } from 'express';
import { createSupplier } from '../controllers/supplierController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireSupabase } from '../middleware/requireSupabase.js';

const router = Router();

router.post('/supplier', requireSupabase, asyncHandler(createSupplier));

export default router;
