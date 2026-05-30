import { db } from "../lib/db";
import { ApiError } from "../lib/errors";
import type { Project } from "../lib/types";

export async function listProjects(): Promise<Project[]> {
  return db.find("projects");
}

export async function createProject(input: {
  title: string;
  description: string;
  category: string;
  budget: number;
  userId: string;
}): Promise<Project> {
  return db.insert("projects", {
    title: input.title,
    description: input.description,
    category: input.category.toLowerCase(),
    budget: input.budget,
    status: "open",
    createdByUserId: input.userId
  });
}

export async function getProject(projectId: string): Promise<Project> {
  const [project] = await db.find("projects", (candidate) => candidate.id === projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return project;
}
