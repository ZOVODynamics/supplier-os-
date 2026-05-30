import type { ErrorRequestHandler, RequestHandler } from "express";

export class AppError extends Error {
  public readonly statusCode: number;

  public constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new AppError(404, "Route not found"));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";

  response.status(500).json({
    error: {
      message
    }
  });
};
