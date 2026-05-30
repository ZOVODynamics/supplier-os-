import { matchSuppliers } from "../lib/ai";
import type { SupplierMatchResult } from "../lib/types";
import { getProject } from "./projectService";
import { listSuppliers } from "./supplierService";

export async function matchProject(projectId: string): Promise<SupplierMatchResult> {
  const [project, suppliers] = await Promise.all([getProject(projectId), listSuppliers()]);
  return matchSuppliers(project, suppliers);
}
