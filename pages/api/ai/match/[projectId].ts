import type { NextApiRequest, NextApiResponse } from "next";

import { matchSuppliers } from "../../../../lib/ai";
import { allowMethods, apiHandler } from "../../../../lib/api";
import { requireRole } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { ApiError } from "../../../../lib/errors";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET"]);
  await requireRole(request, "BUYER");

  const projectId = Array.isArray(request.query.projectId)
    ? request.query.projectId[0]
    : request.query.projectId;

  if (!projectId) {
    throw new ApiError(400, "projectId is required");
  }

  const [project] = await db.find("projects", (candidate) => candidate.id === projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const suppliers = await db.find("suppliers");
  response.status(200).json(matchSuppliers(project, suppliers));
});
