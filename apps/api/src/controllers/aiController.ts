import type { RequestHandler } from "express";

import { aiMatchService } from "../services/aiMatchService";

export const matchProjectSuppliers: RequestHandler = async (request, response) => {
  const result = await aiMatchService.matchProject(request.params.projectId);
  response.json(result);
};
