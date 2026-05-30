import type { UserRole } from "../types/entities";
import { AppError } from "./errors";

export function expectRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AppError(400, "Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function expectString(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, `${key} must be a non-empty string`);
  }

  return value.trim();
}

export function optionalString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(400, `${key} must be a string`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function expectEmail(source: Record<string, unknown>, key: string): string {
  const email = expectString(source, key).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new AppError(400, `${key} must be a valid email address`);
  }

  return email;
}

export function expectPassword(source: Record<string, unknown>, key: string): string {
  const password = expectString(source, key);

  if (password.length < 8) {
    throw new AppError(400, `${key} must be at least 8 characters long`);
  }

  return password;
}

export function expectUserRole(source: Record<string, unknown>, key: string): UserRole {
  const value = expectString(source, key).toUpperCase();

  if (value !== "BUYER" && value !== "SUPPLIER") {
    throw new AppError(400, `${key} must be BUYER or SUPPLIER`);
  }

  return value;
}

export function expectNumber(source: Record<string, unknown>, key: string): number {
  const value = source[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AppError(400, `${key} must be a finite number`);
  }

  return value;
}

export function expectStringArray(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];

  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(400, `${key} must be a non-empty string array`);
  }

  const strings = value.map((item) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new AppError(400, `${key} must contain only non-empty strings`);
    }

    return item.trim();
  });

  return Array.from(new Set(strings));
}
