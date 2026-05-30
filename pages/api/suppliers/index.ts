import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { getAuthUser, requireRole } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { ApiError } from "../../../lib/errors";
import { expectNumber, expectRecord, expectString, expectStringArray } from "../../../lib/validation";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET", "POST"]);

  if (request.method === "GET") {
    await getAuthUser(request);
    const suppliers = await db.find("suppliers");
    sendData(response, suppliers);
    return;
  }

  await requireRole(request, "SUPPLIER");
  const body = expectRecord(request.body);
  const rating = expectNumber(body, "rating");
  const minBudget = expectNumber(body, "minBudget");
  const maxBudget = expectNumber(body, "maxBudget");

  if (rating < 0 || rating > 5) {
    throw new ApiError(400, "rating must be between 0 and 5");
  }

  if (minBudget < 0 || maxBudget <= 0 || minBudget > maxBudget) {
    throw new ApiError(400, "budget range must satisfy 0 <= minBudget <= maxBudget");
  }

  const supplier = await db.insert("suppliers", {
    name: expectString(body, "name"),
    categories: expectStringArray(body, "categories").map((category) => category.toLowerCase()),
    rating,
    location: expectString(body, "location"),
    minBudget,
    maxBudget
  });

  sendData(response, supplier, 201);
});
