import type { RequestHandler } from "express";

import { projectService } from "../services/projectService";
import type { CreateProjectInput } from "../types/requests";
import { AppError } from "../utils/errors";
import {
  expectNumber,
  expectRecord,
  expectString,
  optionalString
} from "../utils/validation";

export const listProjects: RequestHandler = async (_request, response) => {
  const projects = await projectService.listProjects();
  response.json({ data: projects });
};

export const createProject: RequestHandler = async (request, response) => {
  const body = expectRecord(request.body);
  const budget = expectNumber(body, "budget");

  if (budget <= 0) {
    throw new AppError(400, "budget must be greater than 0");
  }

  const input: CreateProjectInput = {
    title: expectString(body, "title"),
    description: expectString(body, "description"),
    category: expectString(body, "category"),
    budget,
    createdByUserId: optionalString(body, "createdByUserId")
  };

  const project = await projectService.createProject(input);
  response.status(201).json({ data: project });
};
