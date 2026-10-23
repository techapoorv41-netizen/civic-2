import mongoose, { Document, Schema, Types } from "mongoose";

export interface IIssueAttachment extends Document {
  issueId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  url: string;
  fileUrl?: string;
  storageKey?: string | null;
  publicId?: string | null;
  provider: "local" | "cloudinary";
  mimeType: string;
  fileType: string;
  size: number;
  originalName?: string | null;
  fileName?: string | null;
  createdAt: Date;
}

const issueAttachmentSchema = new Schema<IIssueAttachment>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "issueId is required"],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "uploadedBy user ID is required"],
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    storageKey: {
      type: String,
      default: null,
      trim: true,
    },
    publicId: {
      type: String,
      default: null,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["local", "cloudinary"],
      default: "local",
    },
    mimeType: {
      type: String,
      default: "image/jpeg",
    },
    fileType: {
      type: String,
      default: "image",
    },
    size: {
      type: Number,
      default: 0,
    },
    originalName: {
      type: String,
      default: null,
      trim: true,
    },
    fileName: {
      type: String,
      default: null,
      trim: true,
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

issueAttachmentSchema.index({ issueId: 1, createdAt: 1 });

export const IssueAttachment =
  mongoose.models.IssueAttachment ||
  mongoose.model<IIssueAttachment>("IssueAttachment", issueAttachmentSchema);

export default IssueAttachment;
