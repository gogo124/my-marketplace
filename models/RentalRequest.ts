import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const RentalRequestSchema = new Schema(
  {
    agency: { type: Schema.Types.ObjectId, ref: "AgencyProfile", required: true },
    trip: { type: Schema.Types.ObjectId, ref: "AgencyTrip", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    renter: { type: Schema.Types.ObjectId, ref: "RenterProfile", default: null },
    rentalItem: { type: Schema.Types.ObjectId, ref: "RentalItem", default: null },
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    durationDays: { type: Number, required: true, min: 1, default: 1 },
    preferredDate: { type: Date, default: null },
    notes: { type: String, default: "", trim: true },
    unitPrice: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "delivered", "returned"],
      default: "pending"
    }
  },
  { timestamps: true }
);

RentalRequestSchema.index({ agency: 1, createdAt: -1 });
RentalRequestSchema.index({ trip: 1, createdAt: -1 });

export type RentalRequestDocument = InferSchemaType<typeof RentalRequestSchema> & { _id: string };

const RentalRequest =
  (models.RentalRequest as Model<RentalRequestDocument>) || model("RentalRequest", RentalRequestSchema);

export default RentalRequest;
