import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const RentalItemSchema = new Schema(
  {
    renter: { type: Schema.Types.ObjectId, ref: "RenterProfile", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    size: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    itemType: {
      type: String,
      enum: ["item", "package"],
      default: "item"
    },
    packageItems: [{ type: String, trim: true }],
    quantityTotal: { type: Number, default: 1, min: 0 },
    quantityAvailable: { type: Number, default: 1, min: 0 },
    availabilityStatus: {
      type: String,
      enum: ["available", "limited", "unavailable"],
      default: "available"
    },
    pickupInfo: { type: String, default: "", trim: true },
    deliveryInfo: { type: String, default: "", trim: true },
    isTrustedPartner: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

RentalItemSchema.index({ renter: 1, createdAt: -1 });
RentalItemSchema.index({ city: 1, region: 1, status: 1 });

export type RentalItemDocument = InferSchemaType<typeof RentalItemSchema> & { _id: string };

const RentalItem =
  (models.RentalItem as Model<RentalItemDocument>) || model("RentalItem", RentalItemSchema);

export default RentalItem;
