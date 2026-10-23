import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAIResponse extends Omit<Document, "model"> {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  prompt: string;
  response: string;
  model: string;
  isMock: boolean;
  responseType: string;
  createdAt: Date;
}

const aiResponseSchema = new Schema<IAIResponse>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "issueId is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    prompt: {
      type: String,
      required: [true, "Prompt is required"],
      trim: true,
    },
    response: {
      type: String,
      required: [true, "Response is required"],
      trim: true,
    },
    model: {
      type: String,
      default: "mock",
    },
    isMock: {
      type: Boolean,
      default: true,
    },
    responseType: {
      type: String,
      enum: ["report_assistance", "status_update", "recommendation"],
      default: "report_assistance",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

aiResponseSchema.index({ issueId: 1, userId: 1, createdAt: 1 });
aiResponseSchema.index({ issueId: 1, createdAt: -1 });

export const AIResponse =
  mongoose.models.AIResponse || mongoose.model<IAIResponse>("AIResponse", aiResponseSchema);

export default AIResponse;
