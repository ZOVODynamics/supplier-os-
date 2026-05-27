import { Router } from 'express';
import { createBusiness } from '../controllers/businessController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireSupabase } from '../middleware/requireSupabase.js';

const router = Router();

router.post('/business', requireSupabase, asyncHandler(createBusiness));

export default router;
