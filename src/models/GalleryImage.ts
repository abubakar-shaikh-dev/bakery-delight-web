import mongoose, { Schema, model, models } from "mongoose";

export interface IGalleryImage {
  url: string;
  caption: string;
  /** Crop shape chosen at upload — drives the bento cell: "1:1" | "16:9" | "9:16". */
  ratio: string;
  cloudinaryPublicId: string | null;
  createdAt: Date;
}

const GALLERY_RATIOS = ["1:1", "16:9", "9:16"];

const gallerySchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true, maxlength: 500 },
    caption: { type: String, default: "", maxlength: 120 },
    ratio: { type: String, default: "1:1", enum: GALLERY_RATIOS },
    cloudinaryPublicId: { type: String, default: null },
  },
  { timestamps: true },
);

gallerySchema.index({ createdAt: -1 });

const GalleryImage =
  models.GalleryImage ?? model<IGalleryImage>("GalleryImage", gallerySchema);
export default GalleryImage;
