import { Schema, model, models } from "mongoose";

export interface ITreat {
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
    price: number | null;
    image: string;
    cloudinaryPublicId: string | null;
    featured: boolean;
  weight: string;
  serves: string;
  createdAt: Date;
  updatedAt: Date;
}

const treatSchema = new Schema<ITreat>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, default: "Cakes", index: true },
    tagline: { type: String, default: "", maxlength: 80 },
    description: { type: String, default: "", maxlength: 1200 },
    price: { type: Number, default: null },
    image: { type: String, default: "", maxlength: 500 },
    cloudinaryPublicId: { type: String, default: null, maxlength: 200 },
    featured: { type: Boolean, default: false },
    // Free text — bakers say "500 g", "1 kg" or "8 pieces", not grams only.
    weight: { type: String, default: "", maxlength: 40 },
    serves: { type: String, default: "", maxlength: 40 },
  },
  { timestamps: true },
);

treatSchema.index({ featured: -1, createdAt: 1 });

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
