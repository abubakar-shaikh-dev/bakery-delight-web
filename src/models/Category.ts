import { Schema, model, models } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  icon: string; // lucide key from the category icon registry
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: "sparkles" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ order: 1, name: 1 });

const Category = models.Category ?? model<ICategory>("Category", categorySchema);
export default Category;
