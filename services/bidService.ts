import { db } from "../lib/db";
import { ApiError } from "../lib/errors";
import type { Bid } from "../lib/types";
import { getProject } from "./projectService";

export async function listBids(): Promise<Bid[]> {
  return db.find("bids");
}

export async function selectSupplier(input: { projectId: string; supplierId: string; notes?: string }): Promise<Bid> {
  await getProject(input.projectId);
  const [supplier] = await db.find("suppliers", (candidate) => candidate.id === input.supplierId);
  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  const [existing] = await db.find(
    "bids",
    (candidate) => candidate.projectId === input.projectId && candidate.supplierId === input.supplierId
  );

  if (existing) {
    return db.update("bids", existing.id, { status: "selected", notes: input.notes ?? existing.notes }) as Promise<Bid>;
  }

  return db.insert("bids", {
    projectId: input.projectId,
    supplierId: input.supplierId,
    amount: supplier.minBudget,
    status: "selected",
    notes: input.notes
  });
}
