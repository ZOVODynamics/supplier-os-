import type { RequestHandler } from "express";

import type { UserRole } from "../types/entities";
import { AppError } from "../utils/errors";
import { verifyAuthToken } from "../utils/jwt";

export const authenticateJwt: RequestHandler = (request, _response, next) => {
  try {
    const header = request.header("authorization");

    if (!header) {
      throw new AppError(401, "Missing Authorization header");
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError(401, "Authorization header must use Bearer token");
    }

    request.user = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new AppError(403, "Insufficient role permissions"));
      return;
    }

    next();
  };
}
