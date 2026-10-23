import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAIAnalysis extends Omit<Document, "model"> {
  issueId: Types.ObjectId;
  requestedBy?: Types.ObjectId | null;
  severityScore: number;
  predictedCategory?: string | null;
  duplicateIssueIds: string[];
  reasoning?: string | null;
  model: string;
  isMock: boolean;
  summary?: string | null;
  suggestedDepartment?: string | null;
  suggestedPriority?: string | null;
  confidenceScore?: number | null;
  isDuplicate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "issueId is required"],
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    severityScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    predictedCategory: {
      type: String,
      default: null,
    },
    duplicateIssueIds: [
      {
        type: String,
      },
    ],
    reasoning: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    model: {
      type: String,
      default: "mock",
    },
    isMock: {
      type: Boolean,
      default: true,
    },
    summary: {
      type: String,
      default: null,
    },
    suggestedDepartment: {
      type: String,
      default: "Public Works Department",
    },
    suggestedPriority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    confidenceScore: {
      type: Number,
      default: 0.88,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

aiAnalysisSchema.index({ issueId: 1, createdAt: -1 });

export const AIAnalysis =
  mongoose.models.AIAnalysis || mongoose.model<IAIAnalysis>("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;
