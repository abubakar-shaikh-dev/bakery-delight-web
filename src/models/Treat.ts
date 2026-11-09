import { Schema, model, models } from "mongoose";

/** One purchasable size, e.g. { label: "1 kg", price: 899 }. */
export interface ITreatVariant {
  label: string;
  price: number;
}

/** One detail-page photo. publicId kept alongside so deletes can reach Cloudinary. */
export interface ITreatImage {
  url: string;
  publicId: string | null;
}

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
  variants: ITreatVariant[];
  images: ITreatImage[];
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
    // Optional size list shown under the price. Empty means a single price.
    variants: [
      {
        label: { type: String, trim: true, maxlength: 40 },
        price: { type: Number, min: 0 },
        _id: false,
      },
    ],
    // Detail-page gallery; `image` above stays the cover (cards, OG, schema).
    images: [
      {
        url: { type: String, maxlength: 500 },
        publicId: { type: String, default: null, maxlength: 200 },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

treatSchema.index({ featured: -1, createdAt: 1 });

export const MAX_TREAT_VARIANTS = 8;
export const MAX_TREAT_IMAGES = 8;

/** Coerces untrusted payload variants into clean {label, price} pairs. */
export function normalizeVariants(input: unknown): ITreatVariant[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => {
      const rec = v as Record<string, unknown> | null;
      return {
        label: typeof rec?.label === "string" ? rec.label.trim().slice(0, 40) : "",
        price: Number(rec?.price),
      };
    })
    .filter((v) => v.label !== "" && Number.isFinite(v.price) && v.price >= 0)
    .slice(0, MAX_TREAT_VARIANTS);
}

/** Coerces untrusted payload images into clean {url, publicId} pairs. */
export function normalizeImages(input: unknown): ITreatImage[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((i) => {
      const rec = i as Record<string, unknown> | null;
      return {
        url:
          typeof rec?.url === "string" && /^(https?:\/\/|\/)/.test(rec.url)
            ? rec.url.slice(0, 500)
            : "",
        publicId:
          typeof rec?.publicId === "string" && rec.publicId
            ? rec.publicId.slice(0, 200)
            : null,
      };
    })
    .filter((i) => i.url !== "")
    .slice(0, MAX_TREAT_IMAGES);
}

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
