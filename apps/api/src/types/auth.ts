import type { User, UserRole } from "./entities";

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface AuthResponse {
  user: PublicUser;
  token: string;
}
