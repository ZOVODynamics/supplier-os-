import { Router } from "express";

import { createProject, listProjects } from "../controllers/projectController";
import { authenticateJwt, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const projectRouter = Router();

projectRouter.get("/", authenticateJwt, asyncHandler(listProjects));
projectRouter.post("/", authenticateJwt, requireRole("BUYER"), asyncHandler(createProject));
