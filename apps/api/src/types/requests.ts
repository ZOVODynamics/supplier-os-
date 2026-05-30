import type { ProjectStatus } from "./entities";

export interface CreateProjectInput {
  title: string;
  description: string;
  category: string;
  budget: number;
  status?: ProjectStatus;
  createdByUserId?: string;
}

export interface CreateSupplierInput {
  name: string;
  categories: string[];
  rating: number;
  location: string;
  minBudget: number;
  maxBudget: number;
}
