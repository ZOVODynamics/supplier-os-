import bcrypt from "bcryptjs";

import { signAuthToken } from "../lib/auth";
import { db } from "../lib/db";
import { ApiError } from "../lib/errors";
import type { AuthResponse, PublicUser, User, UserRole } from "../lib/types";

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

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
