import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStatusLog {
  status: string;
  at: Date;
  remarks?: string | null;
}

export interface IIssueAssignment extends Document {
  issueId: Types.ObjectId;
  officialId: Types.ObjectId;
  assignedBy: Types.ObjectId;
  status: "assigned" | "accepted" | "rejected" | "completed";
  isActive: boolean;
  dueDate?: Date | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  completionRemarks?: string | null;
  statusLog: IStatusLog[];
  assignedAt: Date;
  acceptedAt?: Date | null;
  completedAt?: Date | null;
  rejectedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const issueAssignmentSchema = new Schema<IIssueAssignment>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "issueId is required"],
    },
    officialId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "officialId (User ID) is required"],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "assignedBy is required"],
    },
    status: {
      type: String,
      enum: ["assigned", "accepted", "rejected", "completed"],
      default: "assigned",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    completionRemarks: {
      type: String,
      default: null,
      trim: true,
    },
    statusLog: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        remarks: { type: String, default: null },
      },
    ],
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

issueAssignmentSchema.index({ officialId: 1, status: 1, createdAt: -1 });
issueAssignmentSchema.index({ issueId: 1, status: 1 });
issueAssignmentSchema.index(
  { issueId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const IssueAssignment =
  mongoose.models.IssueAssignment ||
  mongoose.model<IIssueAssignment>("IssueAssignment", issueAssignmentSchema);

export default IssueAssignment;
