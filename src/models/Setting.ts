import mongoose, { Schema, model, models } from "mongoose";

export interface ISettings {
  key: "site";
  bakeryName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  whatsappDigits: string;
  email: string;
  address: string;
  socials: {
    instagram: string;
    whatsapp: string;
    pinterest: string;
    facebook: string;
    youtube: string;
  };
  updatedAt: Date;
}

const socialsSchema = new Schema(
  {
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    pinterest: { type: String, default: "" },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { _id: false },
);

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    bakeryName: { type: String, default: "Bakery Delight" },
    tagline: { type: String, default: "HOMEMADE CAKES, HAPPIER MOMENTS" },
    phone: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    whatsappDigits: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    socials: { type: socialsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const Setting = models.Setting ?? model<ISettings>("Setting", settingsSchema);
export default Setting;
