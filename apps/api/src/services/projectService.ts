import { db } from "../db/jsonDb";
import type { Project } from "../types/entities";
import type { CreateProjectInput } from "../types/requests";

export class ProjectService {
  public async listProjects(): Promise<Project[]> {
    return db.find("projects");
  }

  public async createProject(input: CreateProjectInput): Promise<Project> {
    return db.insert("projects", {
      title: input.title,
      description: input.description,
      category: input.category.toLowerCase(),
      budget: input.budget,
      status: input.status ?? "open",
      createdByUserId: input.createdByUserId
    });
  }

  public async getProjectById(projectId: string): Promise<Project | undefined> {
    const [project] = await db.find("projects", (candidate) => candidate.id === projectId);
    return project;
  }
}

export const projectService = new ProjectService();
