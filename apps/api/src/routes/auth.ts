import { Router } from "express";

import { getCurrentUser, loginUser, registerUser } from "../controllers/authController";
import { authenticateJwt } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerUser));
authRouter.post("/login", asyncHandler(loginUser));
authRouter.get("/me", authenticateJwt, asyncHandler(getCurrentUser));
