import mongoose, { Schema, model, models } from "mongoose";

export interface IMessage {
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, default: "", maxlength: 24 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

messageSchema.index({ read: 1, createdAt: -1 });

const Message = models.Message ?? model<IMessage>("Message", messageSchema);
export default Message;
