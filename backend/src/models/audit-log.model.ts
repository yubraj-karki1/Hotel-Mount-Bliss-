import { Schema, model, type Types } from "mongoose";
const auditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true }, resourceId: Schema.Types.ObjectId,
  description: { type: String, required: true }, ipAddress: String, userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
export interface AuditContext { user?: Types.ObjectId | string; action: string; resource: string; resourceId?: Types.ObjectId | string; description: string; ipAddress?: string | undefined; userAgent?: string | undefined }
export const AuditLog = model("AuditLog", auditLogSchema);
