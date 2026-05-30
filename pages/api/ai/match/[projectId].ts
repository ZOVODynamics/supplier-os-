import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler } from "../../../../lib/api";
import { ApiError } from "../../../../lib/errors";
import { requireRole } from "../../../../middleware/auth";
import { matchProject } from "../../../../services/matchService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET"]);
  await requireRole(request, "BUYER");

  const projectId = Array.isArray(request.query.projectId)
    ? request.query.projectId[0]
    : request.query.projectId;

  if (!projectId) {
    throw new ApiError(400, "projectId is required");
  }

  response.status(200).json(await matchProject(projectId));
});
