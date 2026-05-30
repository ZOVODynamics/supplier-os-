import type { UserRole } from "./types";
import { ApiError } from "./errors";

export function expectRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function expectString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${key} must be a non-empty string`);
  }
  return value.trim();
}

export function expectEmail(source: Record<string, unknown>, key: string): string {
  const email = expectString(source, key).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, `${key} must be a valid email address`);
  }
  return email;
}

export function expectPassword(source: Record<string, unknown>, key: string): string {
  const password = expectString(source, key);
  if (password.length < 8) {
    throw new ApiError(400, `${key} must be at least 8 characters long`);
  }
  return password;
}

export function expectNumber(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError(400, `${key} must be a finite number`);
  }
  return value;
}

export function expectStringArray(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(400, `${key} must be a non-empty string array`);
  }

  return Array.from(
    new Set(
      value.map((item) => {
        if (typeof item !== "string" || item.trim().length === 0) {
          throw new ApiError(400, `${key} must contain only non-empty strings`);
        }
        return item.trim();
      })
    )
  );
}

export function expectUserRole(source: Record<string, unknown>, key: string): UserRole {
  const value = expectString(source, key).toUpperCase();
  if (value !== "BUYER" && value !== "SUPPLIER") {
    throw new ApiError(400, `${key} must be BUYER or SUPPLIER`);
  }
  return value;
}
