import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { ApiError } from "../../../lib/errors";
import { expectNumber, expectRecord, expectString, expectStringArray } from "../../../lib/validation";
import { getAuthUser, requireRole } from "../../../middleware/auth";
import { createSupplier, listSuppliers } from "../../../services/supplierService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET", "POST"]);

  if (request.method === "GET") {
    await getAuthUser(request);
    sendData(response, await listSuppliers());
    return;
  }

  await requireRole(request, "BUYER", "SUPPLIER");
  const body = expectRecord(request.body);
  const rating = expectNumber(body, "rating", { min: 0, max: 5 });
  const minBudget = expectNumber(body, "minBudget", { min: 0, max: 1_000_000_000 });
  const maxBudget = expectNumber(body, "maxBudget", { min: 1, max: 1_000_000_000 });

  if (minBudget > maxBudget) {
    throw new ApiError(400, "budget range must satisfy minBudget <= maxBudget");
  }

  const supplier = await createSupplier({
    name: expectString(body, "name", { max: 160 }),
    categories: expectStringArray(body, "categories", { maxItems: 12, maxLength: 80 }),
    rating,
    location: expectString(body, "location", { max: 140 }),
    minBudget,
    maxBudget
  });

  sendData(response, supplier, 201);
});
