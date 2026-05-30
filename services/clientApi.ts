"use client";

import type {
  AuthResponse,
  Bid,
  InvestorStats,
  Project,
  Supplier,
  SupplierMatchResult,
  UserRole
} from "../lib/types";

const tokenKey = "zovo_token";
const userKey = "zovo_user";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  category: string;
  budget: number;
}

export interface CreateSupplierPayload {
  name: string;
  categories: string[];
  rating: number;
  location: string;
  minBudget: number;
  maxBudget: number;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = (await response.json()) as { data?: T; error?: { message?: string } } | T;

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? body.error?.message ?? "Request failed"
        : "Request failed";
    throw new Error(message);
  }

  if (typeof body === "object" && body !== null && "data" in body) {
    return body.data as T;
  }

  return body as T;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(tokenKey);
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(userKey);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function saveSession(auth: AuthResponse): void {
  window.localStorage.setItem(tokenKey, auth.token);
  window.localStorage.setItem(userKey, JSON.stringify(auth.user));
}

export function clearSession(): void {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(userKey);
}

export const zovoApi = {
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    company: string;
  }) =>
    apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  stats: () => apiRequest<InvestorStats>("/api/demo/stats"),
  projects: () => apiRequest<Project[]>("/api/projects"),
  createProject: (payload: CreateProjectPayload) =>
    apiRequest<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  suppliers: () => apiRequest<Supplier[]>("/api/suppliers"),
  createSupplier: (payload: CreateSupplierPayload) =>
    apiRequest<Supplier>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  bids: () => apiRequest<Bid[]>("/api/bids"),
  selectSupplier: (payload: { projectId: string; supplierId: string }) =>
    apiRequest<Bid>("/api/bids", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  match: (projectId: string) => apiRequest<SupplierMatchResult>(`/api/ai/match/${projectId}`)
};
