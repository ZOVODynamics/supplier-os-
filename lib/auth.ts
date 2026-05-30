import type { NextApiRequest } from "next";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

import { db } from "./db";
import { ApiError } from "./errors";
import type { AuthResponse, AuthUser, PublicUser, User, UserRole } from "./types";

const jwtIssuer = "zovo-supplier-os";
const jwtExpiresIn = "7d";
const localJwtSecret = "zovo-local-development-secret-change-me";

interface ZovoJwtPayload extends JwtPayload {
  email?: string;
  role?: string;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company: string;
}): Promise<AuthResponse> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await db.insert("users", {
    name: input.name,
    email,
    passwordHash,
    role: input.role,
    company: input.company
  });

  return authResponse(user);
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResponse> {
  const user = await findUserByEmail(input.email.trim().toLowerCase());

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  return authResponse(user);
}

export async function getAuthUser(request: NextApiRequest): Promise<AuthUser> {
  const header = request.headers.authorization;
  if (!header) {
    throw new ApiError(401, "Missing Authorization header");
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authorization header must use Bearer token");
  }

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
}

export async function requireRole(request: NextApiRequest, ...roles: UserRole[]): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "Insufficient role permissions");
  }
  return user;
}

export async function publicUserById(userId: string): Promise<PublicUser> {
  const [user] = await db.find("users", (candidate) => candidate.id === userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return toPublicUser(user);
}

function authResponse(user: User): AuthResponse {
  return {
    user: toPublicUser(user),
    token: signAuthToken(user)
  };
}

function findUserByEmail(email: string): Promise<User | undefined> {
  return db.find("users", (candidate) => candidate.email === email).then(([user]) => user);
}

function signAuthToken(user: User): string {
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

function getJwtSecret(): Secret {
  return process.env.JWT_SECRET?.trim() || localJwtSecret;
}

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
