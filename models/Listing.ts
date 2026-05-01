import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ListingSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["sale", "rental"],
      required: true,
      default: "sale"
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    deposit: { type: String, default: "", trim: true },
    images: [{ type: String }],
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

ListingSchema.index({ status: 1, type: 1, createdAt: -1 });
ListingSchema.index({ status: 1, location: 1, category: 1, createdAt: -1 });
ListingSchema.index({ seller: 1, status: 1, createdAt: -1 });

export type ListingDocument = InferSchemaType<typeof ListingSchema> & { _id: string };

const Listing = (models.Listing as Model<ListingDocument>) || model("Listing", ListingSchema);

export default Listing;
