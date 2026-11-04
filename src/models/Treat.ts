import mongoose, { Schema, model, models } from "mongoose";

export interface ITreat {
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number | null;
  image: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const treatSchema = new Schema<ITreat>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, default: "Cakes", index: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, default: null },
    image: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const Treat = models.Treat ?? model<ITreat>("Treat", treatSchema);
export default Treat;
