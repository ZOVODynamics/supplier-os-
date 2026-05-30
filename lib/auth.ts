import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

import { ApiError } from "./errors";
import type { AuthUser, User } from "./types";

const jwtIssuer = "zovo-supplier-os";
const jwtExpiresIn = "7d";
const localJwtSecret = "zovo-local-development-secret-change-me";

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
    issuer: jwtIssuer,
    expiresIn: jwtExpiresIn
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyAuthToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { issuer: jwtIssuer }) as ZovoJwtPayload;

    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      (decoded.role !== "BUYER" && decoded.role !== "SUPPLIER")
    ) {
      throw new ApiError(401, "Invalid authentication token");
    }

    return {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid or expired authentication token");
  }
}

function getJwtSecret(): Secret {
  return process.env.JWT_SECRET?.trim() || localJwtSecret;
}
