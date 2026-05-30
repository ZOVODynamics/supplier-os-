import type { Project, Supplier, SupplierMatch, SupplierMatchBreakdown, SupplierMatchResult } from "./types";

const ratingWeight = 0.4;
const categoryWeight = 0.3;
const budgetWeight = 0.3;

export function matchSuppliers(project: Project, suppliers: Supplier[]): SupplierMatchResult {
  const matches = suppliers
    .map((supplier) => scoreSupplier(project, supplier))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.confidence !== left.confidence) return right.confidence - left.confidence;
      return left.name.localeCompare(right.name);
    });

  return {
    projectId: project.id,
    matches
  };
}

function scoreSupplier(project: Project, supplier: Supplier): SupplierMatch {
  const breakdown: SupplierMatchBreakdown = {
    rating: ratingScore(supplier.rating),
    categoryMatch: categoryScore(project.category, supplier.categories),
    budgetFit: budgetScore(project.budget, supplier.minBudget, supplier.maxBudget)
  };
  const score = round(
    breakdown.rating * ratingWeight +
      breakdown.categoryMatch * categoryWeight +
      breakdown.budgetFit * budgetWeight
  );
  const confidence = confidenceScore(breakdown);

  return {
    supplierId: supplier.id,
    name: supplier.name,
    score,
    confidence,
    explanation: explainMatch(project, supplier, breakdown, score, confidence),
    breakdown
  };
}

function ratingScore(rating: number): number {
  return round(clamp((rating / 5) * 100));
}

function categoryScore(projectCategory: string, supplierCategories: string[]): number {
  const project = normalize(projectCategory);
  const supplier = supplierCategories.map(normalize);

  if (supplier.includes(project)) return 100;

  return supplier.some((category) => category.includes(project) || project.includes(category)) ? 65 : 0;
}

function budgetScore(projectBudget: number, minBudget: number, maxBudget: number): number {
  if (projectBudget >= minBudget && projectBudget <= maxBudget) return 100;
  if (projectBudget < minBudget) return round(clamp((projectBudget / minBudget) * 100));
  return round(clamp((maxBudget / projectBudget) * 100));
}

function confidenceScore(breakdown: SupplierMatchBreakdown): number {
  const signals = [breakdown.rating, breakdown.categoryMatch, breakdown.budgetFit];
  const average = signals.reduce((sum, value) => sum + value, 0) / signals.length;
  const spreadPenalty = (Math.max(...signals) - Math.min(...signals)) * 0.12;
  return round(clamp(average - spreadPenalty));
}

function explainMatch(
  project: Project,
  supplier: Supplier,
  breakdown: SupplierMatchBreakdown,
  score: number,
  confidence: number
): string {
  const reasons: string[] = [];

  if (breakdown.categoryMatch >= 100) {
    reasons.push(`directly matches the ${project.category} category`);
  } else if (breakdown.categoryMatch > 0) {
    reasons.push(`has adjacent category coverage for ${project.category}`);
  } else {
    reasons.push(`does not advertise ${project.category} directly`);
  }

  if (breakdown.budgetFit >= 100) {
    reasons.push(`fits the $${project.budget.toLocaleString()} budget range`);
  } else {
    reasons.push(`is partially outside the target budget range`);
  }

  reasons.push(`has a ${supplier.rating.toFixed(1)}/5 supplier rating`);

  return `${supplier.name} ${reasons.join(", ")}. Overall score ${score} with ${confidence}% confidence.`;
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
