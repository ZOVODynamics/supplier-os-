import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { ApiError } from "./errors";
import { logger } from "./logger";

export function apiHandler(handler: NextApiHandler): NextApiHandler {
  return async (request, response) => {
    try {
      await handler(request, response);
      logger.info("api_request_completed", {
        route: request.url,
        method: request.method,
        statusCode: response.statusCode
      });
    } catch (error) {
      sendError(request, response, error);
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

function sendError(request: NextApiRequest, response: NextApiResponse, error: unknown): void {
  if (error instanceof ApiError) {
    logger.warn("api_request_rejected", {
      route: request.url,
      method: request.method,
      statusCode: error.statusCode
    });
    response.status(error.statusCode).json({ error: { message: error.message } });
    return;
  }

  logger.error("api_request_failed", {
    route: request.url,
    method: request.method,
    statusCode: 500
  });
  response.status(500).json({ error: { message: "Unexpected server error" } });
}
