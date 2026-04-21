import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AgencyReservationSchema = new Schema(
  {
    trip: { type: Schema.Types.ObjectId, ref: "AgencyTrip", required: true },
    agency: { type: Schema.Types.ObjectId, ref: "AgencyProfile", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, default: "", trim: true },
    phoneNumber: { type: String, default: "", trim: true },
    seats: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

AgencyReservationSchema.index({ agency: 1, createdAt: -1 });

export type AgencyReservationDocument = InferSchemaType<typeof AgencyReservationSchema> & { _id: string };

const AgencyReservation =
  (models.AgencyReservation as Model<AgencyReservationDocument>) ||
  model("AgencyReservation", AgencyReservationSchema);

export default AgencyReservation;
