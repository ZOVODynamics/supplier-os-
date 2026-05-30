import type { ProjectStatus, UserRole } from "./entities";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

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
