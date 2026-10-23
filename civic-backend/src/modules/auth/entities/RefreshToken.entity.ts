import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedBy?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, "tokenHash is required"],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedBy: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index to automatically purge expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
  mongoose.models.RefreshToken || mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
