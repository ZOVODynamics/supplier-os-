import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { ApiError } from "../../../lib/errors";
import { expectNumber, expectRecord, expectString } from "../../../lib/validation";
import { getAuthUser, requireRole } from "../../../middleware/auth";
import { createProject, listProjects } from "../../../services/projectService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET", "POST"]);

  if (request.method === "GET") {
    await getAuthUser(request);
    sendData(response, await listProjects());
    return;
  }

  const user = await requireRole(request, "BUYER");
  const body = expectRecord(request.body);
  const budget = expectNumber(body, "budget", { min: 1, max: 1_000_000_000 });

  if (budget <= 0) {
    throw new ApiError(400, "budget must be greater than 0");
  }

  const project = await createProject({
    title: expectString(body, "title", { max: 140 }),
    description: expectString(body, "description", { max: 1200 }),
    category: expectString(body, "category", { max: 80 }),
    budget,
    userId: user.userId
  });

  sendData(response, project, 201);
});
