import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOfficialProfile extends Document {
  userId: Types.ObjectId;
  department: string;
  designation?: string | null;
  employeeId?: string | null;
  area?: string | null;
  isVerified: boolean;
  verifiedBy?: Types.ObjectId | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const officialProfileSchema = new Schema<IOfficialProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      unique: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: null,
    },
    area: {
      type: String,
      trim: true,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

officialProfileSchema.index({ isVerified: 1, department: 1 });

export const OfficialProfile =
  mongoose.models.OfficialProfile ||
  mongoose.model<IOfficialProfile>("OfficialProfile", officialProfileSchema);

export default OfficialProfile;
