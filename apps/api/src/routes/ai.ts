import { Router } from "express";

import { matchProjectSuppliers } from "../controllers/aiController";
import { authenticateJwt, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const aiRouter = Router();

aiRouter.get("/match/:projectId", authenticateJwt, requireRole("BUYER"), asyncHandler(matchProjectSuppliers));
