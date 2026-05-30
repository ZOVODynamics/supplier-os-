import { db } from "../db/jsonDb";
import type { Supplier } from "../types/entities";
import type { CreateSupplierInput } from "../types/requests";

export class SupplierService {
  public async listSuppliers(): Promise<Supplier[]> {
    return db.find("suppliers");
  }

  public async createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    return db.insert("suppliers", {
      name: input.name,
      categories: input.categories.map((category) => category.toLowerCase()),
      rating: input.rating,
      location: input.location,
      minBudget: input.minBudget,
      maxBudget: input.maxBudget
    });
  }
}

export const supplierService = new SupplierService();
