import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { getAuthUser, requireRole } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { ApiError } from "../../../lib/errors";
import { expectNumber, expectRecord, expectString } from "../../../lib/validation";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET", "POST"]);

  if (request.method === "GET") {
    await getAuthUser(request);
    const projects = await db.find("projects");
    sendData(response, projects);
    return;
  }

  const user = await requireRole(request, "BUYER");
  const body = expectRecord(request.body);
  const budget = expectNumber(body, "budget");

  if (budget <= 0) {
    throw new ApiError(400, "budget must be greater than 0");
  }

  const project = await db.insert("projects", {
    title: expectString(body, "title"),
    description: expectString(body, "description"),
    category: expectString(body, "category").toLowerCase(),
    budget,
    status: "open",
    createdByUserId: user.userId
  });

  sendData(response, project, 201);
});
