import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AgencyReservationSchema = new Schema(
  {
    trip: { type: Schema.Types.ObjectId, ref: "AgencyTrip", required: true },
    agency: { type: Schema.Types.ObjectId, ref: "AgencyProfile", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, default: "", trim: true },
    customerEmail: { type: String, default: "", trim: true, lowercase: true },
    phoneNumber: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    seats: { type: Number, required: true, min: 1 },
    preferredDate: { type: Date, default: null },
    unitPrice: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

AgencyReservationSchema.index({ agency: 1, createdAt: -1 });
AgencyReservationSchema.index({ trip: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: "objectId" } } });
AgencyReservationSchema.index({ trip: 1, status: 1, createdAt: -1 });
AgencyReservationSchema.index({ user: 1, createdAt: -1 });

export type AgencyReservationDocument = InferSchemaType<typeof AgencyReservationSchema> & { _id: string };

const AgencyReservation =
  (models.AgencyReservation as Model<AgencyReservationDocument>) ||
  model("AgencyReservation", AgencyReservationSchema);

export default AgencyReservation;
