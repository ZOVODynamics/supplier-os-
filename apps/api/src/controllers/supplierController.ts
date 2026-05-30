import type { RequestHandler } from "express";

import { supplierService } from "../services/supplierService";
import type { CreateSupplierInput } from "../types/requests";
import { AppError } from "../utils/errors";
import {
  expectNumber,
  expectRecord,
  expectString,
  expectStringArray
} from "../utils/validation";

export const listSuppliers: RequestHandler = async (_request, response) => {
  const suppliers = await supplierService.listSuppliers();
  response.json({ data: suppliers });
};

export const createSupplier: RequestHandler = async (request, response) => {
  const body = expectRecord(request.body);
  const rating = expectNumber(body, "rating");
  const minBudget = expectNumber(body, "minBudget");
  const maxBudget = expectNumber(body, "maxBudget");

  if (rating < 0 || rating > 5) {
    throw new AppError(400, "rating must be between 0 and 5");
  }

  if (minBudget < 0 || maxBudget <= 0 || minBudget > maxBudget) {
    throw new AppError(400, "budget range must satisfy 0 <= minBudget <= maxBudget");
  }

  const input: CreateSupplierInput = {
    name: expectString(body, "name"),
    categories: expectStringArray(body, "categories"),
    rating,
    location: expectString(body, "location"),
    minBudget,
    maxBudget
  };

  const supplier = await supplierService.createSupplier(input);
  response.status(201).json({ data: supplier });
};
