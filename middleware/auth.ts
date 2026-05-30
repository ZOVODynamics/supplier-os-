import type { NextApiRequest } from "next";

import { verifyAuthToken } from "../lib/auth";
import { ApiError } from "../lib/errors";
import type { AuthUser, UserRole } from "../lib/types";

export async function getAuthUser(request: NextApiRequest): Promise<AuthUser> {
  const header = request.headers.authorization;
  if (!header) {
    throw new ApiError(401, "Missing Authorization header");
  }

  const [scheme, token, extra] = header.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token || extra) {
    throw new ApiError(401, "Authorization header must use Bearer token");
  }

  return verifyAuthToken(token);
}

export async function requireRole(request: NextApiRequest, ...roles: UserRole[]): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "Insufficient role permissions");
  }
  return user;
}
