import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "../constants/roles.js";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";

type Claims = { sub: string; role: Role };
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.accessToken as string | undefined ?? req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw new AppError(401, "Authentication required");
    const claims = jwt.verify(token, env.JWT_SECRET) as Claims;
    const user = await User.findOne({ _id: claims.sub, isActive: true }).select("role").lean();
    if (!user) throw new AppError(401, "Account is unavailable");
    req.auth = { userId: claims.sub, role: user.role };
    next();
  } catch (error) { next(error instanceof AppError ? error : new AppError(401, "Invalid or expired authentication")); }
};
export const optionalAuthenticate: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.accessToken as string | undefined ?? req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next();
  try {
    const claims = jwt.verify(token, env.JWT_SECRET) as Claims;
    const user = await User.findOne({ _id: claims.sub, isActive: true }).select("role").lean();
    if (user) req.auth = { userId: claims.sub, role: user.role };
    next();
  } catch { next(); }
};
export const authorize = (...allowed: Role[]): RequestHandler => (req, _res, next) =>
  req.auth && allowed.includes(req.auth.role) ? next() : next(new AppError(403, "You do not have permission for this action"));
