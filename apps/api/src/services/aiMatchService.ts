import { matchSuppliers, type SupplierMatchResult } from "../ai/supplierMatcher";
import { AppError } from "../utils/errors";
import { projectService } from "./projectService";
import { supplierService } from "./supplierService";

export class AiMatchService {
  public async matchProject(projectId: string): Promise<SupplierMatchResult> {
    const project = await projectService.getProjectById(projectId);

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    const suppliers = await supplierService.listSuppliers();
    return matchSuppliers(project, suppliers);
  }
}

export const aiMatchService = new AiMatchService();
