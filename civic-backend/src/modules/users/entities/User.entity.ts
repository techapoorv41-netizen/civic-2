import mongoose, { Document, Schema } from "mongoose";
import { ROLES, UserRole } from "../../../shared/constants/roles";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role: UserRole;
  isBlocked: boolean;
  blockedReason?: string | null;
  blockedBy?: mongoose.Types.ObjectId | null;
  blockedAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN,
      required: true,
      index: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    blockedReason: {
      type: String,
      default: null,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
userSchema.index({ role: 1, isBlocked: 1 });
userSchema.index({ name: "text", email: "text" });

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
