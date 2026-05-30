import type { UserRole } from "./types";
import { ApiError } from "./errors";

const controlCharacters = /[\u0000-\u001f\u007f]/g;
const unsafeHtmlCharacters = /[<>]/g;

export function expectRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function expectString(
  source: Record<string, unknown>,
  key: string,
  options: { min?: number; max?: number } = {}
): string {
  const value = source[key];
  if (typeof value !== "string") {
    throw new ApiError(400, `${key} must be a string`);
  }

  const sanitized = sanitizeText(value);
  const min = options.min ?? 1;
  const max = options.max ?? 240;

  if (sanitized.length < min) {
    throw new ApiError(400, `${key} must be at least ${min} character${min === 1 ? "" : "s"}`);
  }

  if (sanitized.length > max) {
    throw new ApiError(400, `${key} must be at most ${max} characters`);
  }

  return sanitized;
}

export function expectEmail(source: Record<string, unknown>, key: string): string {
  const email = expectString(source, key, { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, `${key} must be a valid email address`);
  }
  return email;
}

export function expectPassword(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string") {
    throw new ApiError(400, `${key} must be a string`);
  }

  if (value.length < 8 || value.length > 128) {
    throw new ApiError(400, `${key} must be between 8 and 128 characters`);
  }

  return value;
}

export function expectNumber(
  source: Record<string, unknown>,
  key: string,
  options: { min?: number; max?: number } = {}
): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError(400, `${key} must be a finite number`);
  }

  if (options.min !== undefined && value < options.min) {
    throw new ApiError(400, `${key} must be at least ${options.min}`);
  }

  if (options.max !== undefined && value > options.max) {
    throw new ApiError(400, `${key} must be at most ${options.max}`);
  }

  return value;
}

export function expectStringArray(
  source: Record<string, unknown>,
  key: string,
  options: { maxItems?: number; maxLength?: number } = {}
): string[] {
  const value = source[key];
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(400, `${key} must be a non-empty string array`);
  }

  const maxItems = options.maxItems ?? 12;
  if (value.length > maxItems) {
    throw new ApiError(400, `${key} must contain at most ${maxItems} items`);
  }

  return Array.from(
    new Set(
      value.map((item) => {
        if (typeof item !== "string") {
          throw new ApiError(400, `${key} must contain only strings`);
        }
        return expectString({ item }, "item", { max: options.maxLength ?? 60 });
      })
    )
  );
}

export function expectUserRole(source: Record<string, unknown>, key: string): UserRole {
  const value = expectString(source, key, { max: 16 }).toUpperCase();
  if (value !== "BUYER" && value !== "SUPPLIER") {
    throw new ApiError(400, `${key} must be BUYER or SUPPLIER`);
  }
  return value;
}

export function sanitizeText(value: string): string {
  return value.replace(controlCharacters, "").replace(unsafeHtmlCharacters, "").trim();
}
