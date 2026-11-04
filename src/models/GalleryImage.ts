import mongoose, { Schema, model, models } from "mongoose";

export interface IGalleryImage {
  url: string;
  caption: string;
  cloudinaryPublicId: string | null;
  createdAt: Date;
}

const gallerySchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true, maxlength: 500 },
    caption: { type: String, default: "", maxlength: 120 },
    cloudinaryPublicId: { type: String, default: null },
  },
  { timestamps: true },
);

gallerySchema.index({ createdAt: -1 });

const GalleryImage =
  models.GalleryImage ?? model<IGalleryImage>("GalleryImage", gallerySchema);
export default GalleryImage;
