import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const transporter = env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD ? nodemailer.createTransport({
  host: env.EMAIL_HOST, port: env.EMAIL_PORT, secure: env.EMAIL_PORT === 465,
  auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
}) : null;

export const emailService = {
  async sendPasswordReset(to: string, token: string) {
    const clientUrl = env.CLIENT_URL.split(",")[0]!.trim().replace(/\/$/, "");
    const url = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
    if (!transporter) { logger.warn("Email is not configured; password-reset email was not sent"); return; }
    await transporter.sendMail({ from: env.EMAIL_USER, to, subject: "Reset your Hotel Mount Bliss password", text: `Reset your password using this link: ${url}\n\nIf you did not request this, ignore this email.` });
  },
  async sendAvailabilityAlert(to: string, roomName: string, checkIn: Date, checkOut: Date) {
    const clientUrl = env.CLIENT_URL.split(",")[0]!.trim().replace(/\/$/, "");
    if (!transporter) { logger.warn({ to, roomName }, "Email is not configured; waitlist alert was not sent"); return false; }
    await transporter.sendMail({ from: env.EMAIL_USER, to, subject: `${roomName} may now be available`, text: `${roomName} may now be available from ${checkIn.toLocaleDateString()} to ${checkOut.toLocaleDateString()}. Availability is first-come, first-served. Book here: ${clientUrl}/booking` });
    return true;
  },
};
