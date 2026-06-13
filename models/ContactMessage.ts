import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    phone: { type: String, default: "", trim: true, maxlength: 80 },
    requestType: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["unread", "read"], default: "unread" }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ createdAt: -1 });
export type ContactMessageDocument = InferSchemaType<typeof ContactMessageSchema> & { _id: string };
const ContactMessage = (models.ContactMessage as Model<ContactMessageDocument>) || model("ContactMessage", ContactMessageSchema);
export default ContactMessage;
