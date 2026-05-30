import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { ApiError } from "./errors";

export function apiHandler(handler: NextApiHandler): NextApiHandler {
  return async (request, response) => {
    try {
      await handler(request, response);
    } catch (error) {
      sendError(response, error);
    }
  };
}

export function allowMethods(request: NextApiRequest, response: NextApiResponse, methods: string[]): void {
  if (!methods.includes(request.method ?? "")) {
    response.setHeader("Allow", methods.join(", "));
    throw new ApiError(405, "Method not allowed");
  }
}

export function sendData<T>(response: NextApiResponse, data: T, statusCode = 200): void {
  response.status(statusCode).json({ data });
}

function sendError(response: NextApiResponse, error: unknown): void {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ error: { message: error.message } });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  response.status(500).json({ error: { message } });
}
