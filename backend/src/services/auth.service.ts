import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { emailService } from "./email.service.js";

const publicUser = (user: UserDocument & { _id?: unknown }) => ({ id: String(user._id), name: user.name, email: user.email, phone: user.phone, profileImage: user.profileImage ?? null, role: user.role, isEmailVerified: user.isEmailVerified, lastLogin: user.lastLogin ?? null, createdAt: user.createdAt, preferences: user.preferences });
const signToken = (user: UserDocument & { _id?: unknown }) => jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: String(user._id), expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]> });

export const authService = {
  async register(input: { name: string; email: string; phone: string; password: string }) {
    if (await User.exists({ email: input.email })) throw new AppError(409, "An account with that email already exists");
    const user = await User.create({ ...input, password: await bcrypt.hash(input.password, 12) });
    return { user: publicUser(user), accessToken: signToken(user) };
  },
  async login(input: { email: string; password: string }) {
    const user = await User.findOne({ email: input.email }).select("+password");
    if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.password))) throw new AppError(401, "Invalid email or password");
    user.lastLogin = new Date(); await user.save();
    return { user: publicUser(user), accessToken: signToken(user) };
  },
  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    return publicUser(user);
  },
  async updateProfile(userId: string, input: { name: string; phone: string }) {
    const user = await User.findByIdAndUpdate(userId, input, { new: true, runValidators: true });
    if (!user) throw new AppError(404, "User not found");
    return publicUser(user);
  },
  async forgotPassword(email: string) {
    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
    if (!user) return;
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 30 * 60_000);
    await user.save(); await emailService.sendPasswordReset(user.email, token);
  },
  async resetPassword(token: string, password: string) {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hash, passwordResetExpires: { $gt: new Date() } }).select("+password +passwordResetToken +passwordResetExpires");
    if (!user) throw new AppError(400, "Reset token is invalid or expired");
    user.password = await bcrypt.hash(password, 12); user.set({ passwordResetToken: undefined, passwordResetExpires: undefined }); await user.save();
  },
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) throw new AppError(400, "Current password is incorrect");
    user.password = await bcrypt.hash(newPassword, 12); await user.save();
  },
};
