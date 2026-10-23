import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface IIssue extends Document {
  title: string;
  description: string;
  reportedBy: Types.ObjectId;
  reporterId?: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  assignedOfficialId?: Types.ObjectId | null;
  category?: Types.ObjectId | null;
  categoryId?: Types.ObjectId | null;
  categoryName?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location?: {
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    point?: IPoint;
  };
  images: string[];
  verifiedByAdmin: boolean;
  verifiedAt?: Date | null;
  verifiedBy?: Types.ObjectId | null;
  remarks?: string | null;
  resolvedAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const pointSchema = new Schema<IPoint>(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [5, "Description must be at least 5 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "reportedBy user ID is required"],
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    assignedOfficialId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    categoryName: {
      type: String,
      trim: true,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "in_progress", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    locationAddress: {
      type: String,
      trim: true,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    location: {
      address: { type: String, default: null },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      point: {
        type: pointSchema,
        default: undefined,
      },
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    verifiedByAdmin: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ createdAt: -1 });
issueSchema.index({ reportedBy: 1, isDeleted: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1, status: 1, createdAt: -1 });
issueSchema.index({ assignedTo: 1, isDeleted: 1, createdAt: -1 });
issueSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
issueSchema.index({ title: "text", description: "text" });
issueSchema.index({ "location.point": "2dsphere" }, { sparse: true });

issueSchema.pre("save", function (next) {
  if (this.reportedBy && !this.reporterId) {
    this.reporterId = this.reportedBy;
  }
  if (this.reporterId && !this.reportedBy) {
    this.reportedBy = this.reporterId;
  }
  if (this.assignedTo && !this.assignedOfficialId) {
    this.assignedOfficialId = this.assignedTo;
  }
  if (this.assignedOfficialId && !this.assignedTo) {
    this.assignedTo = this.assignedOfficialId;
  }
  if (this.category && !this.categoryId) {
    this.categoryId = this.category;
  }
  if (this.categoryId && !this.category) {
    this.category = this.categoryId;
  }

  const lat = this.latitude ?? this.location?.lat;
  const lng = this.longitude ?? this.location?.lng;
  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
    if (!this.location) this.location = {};
    this.location.lat = Number(lat);
    this.location.lng = Number(lng);
    this.location.address = this.locationAddress || this.location.address;
    this.location.point = {
      type: "Point",
      coordinates: [Number(lng), Number(lat)],
    };
  } else if (this.location) {
    this.location.point = undefined;
  }
  next();
});

export const Issue = mongoose.models.Issue || mongoose.model<IIssue>("Issue", issueSchema);
export default Issue;
