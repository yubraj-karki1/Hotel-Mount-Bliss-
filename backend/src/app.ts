import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import mongoose from "mongoose";
import crypto from "node:crypto";
import path from "node:path";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import apiRoutes from "./routes/index.js";
import { AppError } from "./utils/app-error.js";
export const app = express();
const allowedOrigins = new Set(env.CLIENT_URL.split(",").map((value) => value.trim().replace(/\/$/, "")));
const vercelProjectOrigin = /^https:\/\/hotel-mount-bliss(?:-[a-z0-9-]+)*\.vercel\.app$/i;
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(pinoHttp({ logger, genReqId: (req, res) => {
  const supplied = req.headers["x-request-id"];
  const id = typeof supplied === "string" && supplied.length <= 128 ? supplied : crypto.randomUUID();
  res.setHeader("x-request-id", id);
  return id;
} }));
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, "")) || vercelProjectOrigin.test(origin)) return callback(null, true);
    return callback(new AppError(403, "Origin is not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  maxAge: 86_400,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads"), { fallthrough: false, immutable: true, maxAge: "30d", setHeaders: response => response.setHeader("Cross-Origin-Resource-Policy", "cross-origin") }));
app.get("/health/live", (_req, res) => res.json({ success: true, message: "Service is alive", data: { status: "ok" } }));
app.get("/health/ready", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  return res.status(ready ? 200 : 503).json({ success: ready, message: ready ? "Service is ready" : "Database is unavailable", data: { status: ready ? "ok" : "unavailable" } });
});
app.get("/health", (_req, res) => {
  const ready = env.NODE_ENV === "test" || mongoose.connection.readyState === 1;
  return res.status(ready ? 200 : 503).json({ success: ready, message: ready ? "Service is healthy" : "Database is unavailable", data: { status: ready ? "ok" : "unavailable" } });
});
app.use(rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);
