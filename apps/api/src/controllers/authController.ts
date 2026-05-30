import type { RequestHandler } from "express";

import { authService } from "../services/authService";
import type { LoginUserInput, RegisterUserInput } from "../types/requests";
import { AppError } from "../utils/errors";
import {
  expectEmail,
  expectPassword,
  expectRecord,
  expectString,
  expectUserRole
} from "../utils/validation";

export const registerUser: RequestHandler = async (request, response) => {
  const body = expectRecord(request.body);
  const input: RegisterUserInput = {
    name: expectString(body, "name"),
    email: expectEmail(body, "email"),
    password: expectPassword(body, "password"),
    role: expectUserRole(body, "role"),
    company: expectString(body, "company")
  };

  const result = await authService.register(input);
  response.status(201).json({ data: result });
};

export const loginUser: RequestHandler = async (request, response) => {
  const body = expectRecord(request.body);
  const input: LoginUserInput = {
    email: expectEmail(body, "email"),
    password: expectString(body, "password")
  };

  const result = await authService.login(input);
  response.json({ data: result });
};

export const getCurrentUser: RequestHandler = async (request, response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication required");
  }

  const user = await authService.getPublicUserById(request.user.userId);
  response.json({ data: user });
};
