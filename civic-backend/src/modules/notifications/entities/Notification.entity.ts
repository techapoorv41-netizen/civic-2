import mongoose, { Document, Schema, Types } from "mongoose";
import { NotificationType } from "../../../shared/constants/notificationTypes";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType | string;
  message: string;
  isRead: boolean;
  readAt?: Date | null;
  issueId?: Types.ObjectId | null;
  assignmentId?: Types.ObjectId | null;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "IssueAssignment",
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

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
