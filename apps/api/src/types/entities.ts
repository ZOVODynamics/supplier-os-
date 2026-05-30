export type UserRole = "buyer" | "supplier" | "admin";
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
  role: UserRole;
  company: string;
}

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
  createdByUserId?: string;
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
