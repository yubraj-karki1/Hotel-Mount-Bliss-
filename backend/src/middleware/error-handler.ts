import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/app-error.js";

export const notFound: RequestHandler = (req, _res, next) => next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  let status = error instanceof AppError ? error.statusCode : 500;
  let message = error instanceof Error ? error.message : "Internal server error";
  let errors = error instanceof AppError ? error.errors : [];
  if ((error as { code?: number }).code === 11000) { status = 409; message = "A record with that value already exists"; }
  if (status >= 500) logger.error({ err: error, requestId: req.id }, "Request failed");
  res.status(status).json({ success: false, message: status === 500 && env.NODE_ENV === "production" ? "Internal server error" : message, errors });
};
