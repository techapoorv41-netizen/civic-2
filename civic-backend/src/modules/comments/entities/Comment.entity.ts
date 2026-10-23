import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  issueId: Types.ObjectId;
  authorId: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "issueId is required"],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "authorId is required"],
      index: true,
    },
    message: {
      type: String,
      required: [true, "Comment message is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ issueId: 1, createdAt: 1 });

export const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
