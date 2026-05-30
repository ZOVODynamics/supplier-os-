import { Router } from "express";

import { matchProjectSuppliers } from "../controllers/aiController";
import { asyncHandler } from "../utils/asyncHandler";

export const aiRouter = Router();

aiRouter.get("/match/:projectId", asyncHandler(matchProjectSuppliers));
