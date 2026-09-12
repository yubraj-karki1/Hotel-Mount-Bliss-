import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { auditService } from "../services/audit.service.js";
import { authService } from "../services/auth.service.js";
import { success } from "../utils/response.js";

const durationMs = (value: string) => { const match = /^(\d+)([smhd])$/.exec(value)!; const units = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }; return Number(match[1]) * units[match[2] as keyof typeof units]; };
const cookieOptions = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: durationMs(env.JWT_EXPIRES_IN), path: "/" };
const context = (req: Request) => ({ ipAddress: req.ip, userAgent: req.get("user-agent") });
export const authController = {
  register: async (req: Request, res: Response) => { const result = await authService.register(req.body); res.cookie("accessToken", result.accessToken, cookieOptions); await auditService.record({ user: result.user.id, action: "REGISTER", resource: "User", resourceId: result.user.id, description: "Customer account registered", ...context(req) }); return success(res, 201, "Account created successfully", { user: result.user }); },
  login: async (req: Request, res: Response) => { const result = await authService.login(req.body); res.cookie("accessToken", result.accessToken, cookieOptions); await auditService.record({ user: result.user.id, action: "LOGIN", resource: "User", resourceId: result.user.id, description: "User logged in", ...context(req) }); return success(res, 200, "Login successful", { user: result.user }); },
  logout: async (req: Request, res: Response) => { res.clearCookie("accessToken", { ...cookieOptions, maxAge: undefined }); if (req.auth) await auditService.record({ user: req.auth.userId, action: "LOGOUT", resource: "User", resourceId: req.auth.userId, description: "User logged out", ...context(req) }); return success(res, 200, "Logout successful", null); },
  me: async (req: Request, res: Response) => success(res, 200, "Current user fetched successfully", await authService.me(req.auth!.userId)),
  updateProfile: async (req: Request, res: Response) => {
    const user = await authService.updateProfile(req.auth!.userId, req.body);
    await auditService.record({ user: req.auth!.userId, action: "UPDATE_PROFILE", resource: "User", resourceId: req.auth!.userId, description: "Customer profile updated", ...context(req) });
    return success(res, 200, "Profile updated successfully", user);
  },
  forgotPassword: async (req: Request, res: Response) => { await authService.forgotPassword(req.body.email); return success(res, 200, "If an account exists, password reset instructions will be sent", null); },
  resetPassword: async (req: Request, res: Response) => { await authService.resetPassword(req.body.token, req.body.password); return success(res, 200, "Password reset successfully", null); },
  changePassword: async (req: Request, res: Response) => { await authService.changePassword(req.auth!.userId, req.body.currentPassword, req.body.newPassword); res.clearCookie("accessToken", cookieOptions); return success(res, 200, "Password changed; please log in again", null); },
};
