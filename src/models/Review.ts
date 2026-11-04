import mongoose, { Schema, model, models } from "mongoose";

export interface IReview {
  name: string;
  rating: number;
  text: string;
  socialPlatform: string | null;
  socialUrl: string | null;
  avatar: string;
  approved: boolean;
  featured: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 600 },
    socialPlatform: { type: String, default: null, maxlength: 40 },
    socialUrl: { type: String, default: null, maxlength: 300 },
    avatar: { type: String, default: "", maxlength: 500 },
    approved: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ approved: 1, createdAt: -1 });

const Review = models.Review ?? model<IReview>("Review", reviewSchema);
export default Review;
