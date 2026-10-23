import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    icon: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Case-insensitive unique name index
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

categorySchema.pre("save", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

export const Category =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export default Category;
