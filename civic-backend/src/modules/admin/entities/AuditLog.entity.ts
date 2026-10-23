import mongoose, { Document, Schema, Types } from "mongoose";
import { AuditAction } from "../../../shared/constants/auditActions";

export interface IAuditLog extends Document {
  actorId: Types.ObjectId;
  action: AuditAction | string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "actorId is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "action is required"],
    },
    targetType: {
      type: String,
      required: [true, "targetType is required"],
      trim: true,
    },
    targetId: {
      type: String,
      required: [true, "targetId is required"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
