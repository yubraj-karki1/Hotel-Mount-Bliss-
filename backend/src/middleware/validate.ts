import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";
export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) return next(new AppError(422, "Validation failed", result.error.issues));
  if (result.data && typeof result.data === "object") Object.assign(req, result.data);
  next();
};
