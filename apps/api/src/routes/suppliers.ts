import { Router } from "express";

import { createSupplier, listSuppliers } from "../controllers/supplierController";
import { authenticateJwt, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const supplierRouter = Router();

supplierRouter.get("/", authenticateJwt, asyncHandler(listSuppliers));
supplierRouter.post("/", authenticateJwt, requireRole("SUPPLIER"), asyncHandler(createSupplier));
