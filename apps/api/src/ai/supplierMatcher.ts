import type { Project, Supplier } from "../types/entities";

export interface SupplierMatchBreakdown {
  rating: number;
  categoryMatch: number;
  budgetFit: number;
}

export interface SupplierMatch {
  supplierId: string;
  name: string;
  score: number;
  breakdown: SupplierMatchBreakdown;
}

export interface SupplierMatchResult {
  projectId: string;
  matches: SupplierMatch[];
}

const ratingWeight = 0.4;
const categoryWeight = 0.3;
const budgetWeight = 0.3;

export function matchSuppliers(project: Project, suppliers: Supplier[]): SupplierMatchResult {
  const matches = suppliers
    .map((supplier) => {
      const breakdown: SupplierMatchBreakdown = {
        rating: ratingScore(supplier.rating),
        categoryMatch: categoryMatchScore(project.category, supplier.categories),
        budgetFit: budgetFitScore(project.budget, supplier.minBudget, supplier.maxBudget)
      };

      const score =
        breakdown.rating * ratingWeight +
        breakdown.categoryMatch * categoryWeight +
        breakdown.budgetFit * budgetWeight;

      return {
        supplierId: supplier.id,
        name: supplier.name,
        score: roundScore(score),
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
  return roundScore(clamp((rating / 5) * 100));
}

function categoryMatchScore(projectCategory: string, supplierCategories: string[]): number {
  const normalizedProjectCategory = normalize(projectCategory);
  const normalizedSupplierCategories = supplierCategories.map(normalize);

  if (normalizedSupplierCategories.includes(normalizedProjectCategory)) {
    return 100;
  }

  const hasPartialMatch = normalizedSupplierCategories.some(
    (category) =>
      category.includes(normalizedProjectCategory) || normalizedProjectCategory.includes(category)
  );

  return hasPartialMatch ? 60 : 0;
}

function budgetFitScore(projectBudget: number, minBudget: number, maxBudget: number): number {
  if (projectBudget >= minBudget && projectBudget <= maxBudget) {
    return 100;
  }

  if (projectBudget < minBudget) {
    return roundScore(clamp((projectBudget / minBudget) * 100));
  }

  return roundScore(clamp((maxBudget / projectBudget) * 100));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
