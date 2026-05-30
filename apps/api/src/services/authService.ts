import bcrypt from "bcryptjs";

import { db } from "../db/jsonDb";
import type { AuthResponse, PublicUser } from "../types/auth";
import type { User } from "../types/entities";
import type { LoginUserInput, RegisterUserInput } from "../types/requests";
import { AppError } from "../utils/errors";
import { signAuthToken } from "../utils/jwt";

const passwordSaltRounds = 12;

export class AuthService {
  public async register(input: RegisterUserInput): Promise<AuthResponse> {
    const email = normalizeEmail(input.email);
    const existingUser = await this.findUserByEmail(email);

    if (existingUser) {
      throw new AppError(409, "A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, passwordSaltRounds);
    const user = await db.insert("users", {
      name: input.name,
      email,
      passwordHash,
      role: input.role,
      company: input.company
    });

    return this.createAuthResponse(user);
  }

  public async login(input: LoginUserInput): Promise<AuthResponse> {
    const user = await this.findUserByEmail(normalizeEmail(input.email));

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, "Invalid email or password");
    }

    return this.createAuthResponse(user);
  }

  public async getPublicUserById(userId: string): Promise<PublicUser> {
    const [user] = await db.find("users", (candidate) => candidate.id === userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return toPublicUser(user);
  }

  private async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.find("users", (candidate) => candidate.email === email);
    return user;
  }

  private createAuthResponse(user: User): AuthResponse {
    return {
      user: toPublicUser(user),
      token: signAuthToken(user)
    };
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export const authService = new AuthService();
