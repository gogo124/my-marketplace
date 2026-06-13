import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const LeadSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", default: null },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["whatsapp", "call", "chat", "inquiry", "manual"],
      default: "inquiry"
    },
    source: {
      type: String,
      enum: ["listing", "seller_store", "activity", "whatsapp", "call", "instagram", "facebook", "offline", "other", "manual"],
      default: "listing"
    },
    status: {
      type: String,
      enum: ["new", "contacted", "sold", "cancelled", "closed"],
      default: "new"
    },
    name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    preferredDate: { type: Date, default: null },
    message: { type: String, default: "", trim: true },
    customProductName: { type: String, default: "", trim: true },
    unitPrice: { type: Number, default: null },
    quantity: { type: Number, default: null },
    notes: { type: String, default: "", trim: true },
    isExternalOrder: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type LeadDocument = InferSchemaType<typeof LeadSchema> & { _id: string };

const Lead = (models.Lead as Model<LeadDocument>) || model("Lead", LeadSchema);

export default Lead;
