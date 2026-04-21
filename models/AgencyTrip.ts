import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AgencyTripSchema = new Schema(
  {
    agency: { type: Schema.Types.ObjectId, ref: "AgencyProfile", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    seatsTotal: { type: Number, required: true, min: 1 },
    seatsBooked: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

AgencyTripSchema.index({ agency: 1, createdAt: -1 });

export type AgencyTripDocument = InferSchemaType<typeof AgencyTripSchema> & { _id: string };

const AgencyTrip = (models.AgencyTrip as Model<AgencyTripDocument>) || model("AgencyTrip", AgencyTripSchema);

export default AgencyTrip;
