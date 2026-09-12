import { z } from "zod";
const password = z.string().min(8).max(128).regex(/[a-z]/, "Password needs a lowercase letter").regex(/[A-Z]/, "Password needs an uppercase letter").regex(/\d/, "Password needs a number");
export const registerSchema = z.object({ body: z.object({ name: z.string().trim().min(2).max(100), email: z.email().transform(v => v.toLowerCase()), phone: z.string().trim().min(7).max(25), password }) });
export const loginSchema = z.object({ body: z.object({ email: z.email().transform(v => v.toLowerCase()), password: z.string().min(1).max(128) }) });
export const forgotPasswordSchema = z.object({ body: z.object({ email: z.email().transform(v => v.toLowerCase()) }) });
export const resetPasswordSchema = z.object({ body: z.object({ token: z.string().min(32), password }) });
export const changePasswordSchema = z.object({ body: z.object({ currentPassword: z.string().min(1), newPassword: password }) });
export const updateProfileSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
}) });
