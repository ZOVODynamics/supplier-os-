import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

import type { AuthUser } from "../types/auth";
import type { User } from "../types/entities";
import { AppError } from "./errors";

const defaultJwtSecret = "zovo-local-dev-secret-change-me";
const issuer = "zovo-api";
const expiresIn = "7d";

interface ZovoJwtPayload extends JwtPayload {
  email?: string;
  role?: string;
}

export function signAuthToken(user: User): string {
  const payload: AuthUser = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const options: SignOptions = {
    subject: user.id,
    issuer,
    expiresIn
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyAuthToken(token: string): AuthUser {
  const decoded = jwt.verify(token, getJwtSecret(), { issuer }) as ZovoJwtPayload;

  if (
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    (decoded.role !== "BUYER" && decoded.role !== "SUPPLIER")
  ) {
    throw new AppError(401, "Invalid authentication token");
  }

  return {
    userId: decoded.sub,
    email: decoded.email,
    role: decoded.role
  };
}

function getJwtSecret(): Secret {
  return process.env.JWT_SECRET?.trim() || defaultJwtSecret;
}
