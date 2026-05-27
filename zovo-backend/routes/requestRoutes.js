import { Router } from 'express';
import { createRequest, listRequests } from '../controllers/requestController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireSupabase } from '../middleware/requireSupabase.js';

const router = Router();

router.get('/requests', requireSupabase, asyncHandler(listRequests));
router.post('/request', requireSupabase, asyncHandler(createRequest));

export default router;
