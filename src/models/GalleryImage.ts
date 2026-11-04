import mongoose, { Schema, model, models } from "mongoose";

export interface IGalleryImage {
  url: string;
  caption: string;
  cloudinaryPublicId: string | null;
  createdAt: Date;
}

const gallerySchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true },
    caption: { type: String, default: "", maxlength: 120 },
    cloudinaryPublicId: { type: String, default: null },
  },
  { timestamps: true },
);

const GalleryImage =
  models.GalleryImage ?? model<IGalleryImage>("GalleryImage", gallerySchema);
export default GalleryImage;
