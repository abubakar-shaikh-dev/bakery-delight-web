import mongoose, { Schema, model, models } from "mongoose";

export interface IUploadedImage {
  data: Buffer;
  mime: string;
  createdAt: Date;
}

const uploadedImageSchema = new Schema<IUploadedImage>(
  {
    data: { type: Buffer, required: true },
    mime: { type: String, required: true, default: "image/jpeg" },
  },
  { timestamps: true },
);

const UploadedImage =
  models.UploadedImage ?? model<IUploadedImage>("UploadedImage", uploadedImageSchema);
export default UploadedImage;
