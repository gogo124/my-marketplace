import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ActivitySchema = new Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Quad", "Skydiving", "Jet Ski", "Surf", "Hiking", "Horse Riding", "Other"],
      required: true
    },
    city: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    priceType: {
      type: String,
      enum: ["per_person", "total"],
      default: "per_person"
    },
    currency: {
      type: String,
      enum: ["MAD"],
      default: "MAD"
    },
    duration: { type: String, default: "", trim: true },
    availableDays: { type: String, default: "", trim: true },
    availableTimes: { type: String, default: "", trim: true },
    description: { type: String, required: true, trim: true },
    images: [{ type: String, trim: true }],
    phone: { type: String, default: "", trim: true },
    whatsapp: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
    facebook: { type: String, default: "", trim: true },
    maxPeople: { type: Number, default: null },
    equipmentIncluded: { type: Boolean, default: false },
    guideIncluded: { type: Boolean, default: false },
    cancellationPolicy: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

ActivitySchema.index({ provider: 1, createdAt: -1 });
ActivitySchema.index({ status: 1, category: 1, city: 1, createdAt: -1 });

export type ActivityDocument = InferSchemaType<typeof ActivitySchema> & { _id: string };

const Activity = (models.Activity as Model<ActivityDocument>) || model("Activity", ActivitySchema);

export default Activity;
