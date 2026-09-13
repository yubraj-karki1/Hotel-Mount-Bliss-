import { Schema, model, type Types } from "mongoose";
import { roles, type Role } from "../constants/roles.js";

export interface UserDocument {
  name: string; email: string; phone: string; password: string; profileImage?: string;
  role: Role; isActive: boolean; isEmailVerified: boolean; lastLogin?: Date;
  passwordResetToken?: string; passwordResetExpires?: Date; createdAt: Date; updatedAt: Date;
  favorites: Types.ObjectId[]; preferences: { bookingUpdates: boolean; serviceUpdates: boolean };
}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, select: false },
  profileImage: String,
  role: { type: String, enum: roles, default: "CUSTOMER", index: true },
  isActive: { type: Boolean, default: true, index: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: Date,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  favorites: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  preferences: { bookingUpdates: { type: Boolean, default: true }, serviceUpdates: { type: Boolean, default: true } },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_document, result) => {
      const sanitized = result as Record<string, unknown>;
      delete sanitized.password;
      delete sanitized.passwordResetToken;
      delete sanitized.passwordResetExpires;
      return result;
    },
  },
});
export const User = model<UserDocument>("User", userSchema);
