import { Router } from "express";

import { createSupplier, listSuppliers } from "../controllers/supplierController";
import { asyncHandler } from "../utils/asyncHandler";

export const supplierRouter = Router();

supplierRouter.get("/", asyncHandler(listSuppliers));
supplierRouter.post("/", asyncHandler(createSupplier));
