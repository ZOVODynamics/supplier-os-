export type UserRole = "BUYER" | "SUPPLIER";
export type ProjectStatus = "open" | "matched" | "in_progress" | "completed" | "cancelled";
export type BidStatus = "submitted" | "accepted" | "rejected";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  company: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface Supplier extends BaseEntity {
  name: string;
  categories: string[];
  rating: number;
  location: string;
  minBudget: number;
  maxBudget: number;
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  category: string;
  budget: number;
  status: ProjectStatus;
  createdByUserId: string;
}

export interface Bid extends BaseEntity {
  projectId: string;
  supplierId: string;
  amount: number;
  status: BidStatus;
  notes?: string;
}

export interface DatabaseSchema {
  users: User[];
  suppliers: Supplier[];
  projects: Project[];
  bids: Bid[];
}

export type CollectionName = keyof DatabaseSchema;
export type EntityForCollection<K extends CollectionName> = DatabaseSchema[K][number];

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

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
