import mongoose, { Document, Schema, Types } from "mongoose";

export interface IIssueStatusHistory extends Document {
  issueId: Types.ObjectId;
  oldStatus?: string | null;
  previousStatus?: string | null;
  newStatus: string;
  changedBy: Types.ObjectId;
  actorId?: Types.ObjectId;
  remarks?: string | null;
  createdAt: Date;
}

const issueStatusHistorySchema = new Schema<IIssueStatusHistory>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "issueId is required"],
      index: true,
    },
    oldStatus: {
      type: String,
      default: null,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, "newStatus is required"],
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "changedBy is required"],
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: {
      type: String,
      default: null,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

issueStatusHistorySchema.index({ issueId: 1, createdAt: 1 });

issueStatusHistorySchema.pre("save", function (next) {
  if (this.oldStatus && !this.previousStatus) this.previousStatus = this.oldStatus;
  if (this.previousStatus && !this.oldStatus) this.oldStatus = this.previousStatus;
  if (this.changedBy && !this.actorId) this.actorId = this.changedBy;
  if (this.actorId && !this.changedBy) this.changedBy = this.actorId;
  next();
});

export const IssueStatusHistory =
  mongoose.models.IssueStatusHistory ||
  mongoose.model<IIssueStatusHistory>("IssueStatusHistory", issueStatusHistorySchema);

export default IssueStatusHistory;
