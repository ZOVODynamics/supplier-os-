import type { Project, Supplier, SupplierMatchBreakdown, SupplierMatchResult } from "./types";

const ratingWeight = 0.4;
const categoryWeight = 0.3;
const budgetWeight = 0.3;

export function matchSuppliers(project: Project, suppliers: Supplier[]): SupplierMatchResult {
  const matches = suppliers
    .map((supplier) => {
      const breakdown: SupplierMatchBreakdown = {
        rating: ratingScore(supplier.rating),
        categoryMatch: categoryScore(project.category, supplier.categories),
        budgetFit: budgetScore(project.budget, supplier.minBudget, supplier.maxBudget)
      };
      const score =
        breakdown.rating * ratingWeight +
        breakdown.categoryMatch * categoryWeight +
        breakdown.budgetFit * budgetWeight;

      return {
        supplierId: supplier.id,
        name: supplier.name,
        score: round(score),
        breakdown
      };
    })
    .sort((left, right) => right.score - left.score);

  return {
    projectId: project.id,
    matches
  };
}

function ratingScore(rating: number): number {
  return round(clamp((rating / 5) * 100));
}

function categoryScore(projectCategory: string, supplierCategories: string[]): number {
  const project = normalize(projectCategory);
  const supplier = supplierCategories.map(normalize);

  if (supplier.includes(project)) {
    return 100;
  }

  return supplier.some((category) => category.includes(project) || project.includes(category)) ? 60 : 0;
}

function budgetScore(projectBudget: number, minBudget: number, maxBudget: number): number {
  if (projectBudget >= minBudget && projectBudget <= maxBudget) {
    return 100;
  }

  if (projectBudget < minBudget) {
    return round(clamp((projectBudget / minBudget) * 100));
  }

  return round(clamp((maxBudget / projectBudget) * 100));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
