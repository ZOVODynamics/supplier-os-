import { db } from "../lib/db";
import type { Supplier } from "../lib/types";

export async function listSuppliers(): Promise<Supplier[]> {
  return db.find("suppliers");
}

export async function createSupplier(input: {
  name: string;
  categories: string[];
  rating: number;
  location: string;
  minBudget: number;
  maxBudget: number;
}): Promise<Supplier> {
  return db.insert("suppliers", {
    name: input.name,
    categories: input.categories.map((category) => category.toLowerCase()),
    rating: input.rating,
    location: input.location,
    minBudget: input.minBudget,
    maxBudget: input.maxBudget
  });
}
