import { Router } from "express";

import { createProject, listProjects } from "../controllers/projectController";
import { asyncHandler } from "../utils/asyncHandler";

export const projectRouter = Router();

projectRouter.get("/", asyncHandler(listProjects));
projectRouter.post("/", asyncHandler(createProject));
