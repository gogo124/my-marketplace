import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AgencyRenterPartnershipSchema = new Schema(
  {
    agency: { type: Schema.Types.ObjectId, ref: "AgencyProfile", required: true },
    renter: { type: Schema.Types.ObjectId, ref: "RenterProfile", required: true },
    requestedByRole: {
      type: String,
      enum: ["agency", "renter"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    respondedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

AgencyRenterPartnershipSchema.index({ agency: 1, renter: 1 }, { unique: true });
AgencyRenterPartnershipSchema.index({ agency: 1, status: 1, createdAt: -1 });
AgencyRenterPartnershipSchema.index({ renter: 1, status: 1, createdAt: -1 });

export type AgencyRenterPartnershipDocument = InferSchemaType<typeof AgencyRenterPartnershipSchema> & { _id: string };

const AgencyRenterPartnership =
  (models.AgencyRenterPartnership as Model<AgencyRenterPartnershipDocument>) ||
  model("AgencyRenterPartnership", AgencyRenterPartnershipSchema);

export default AgencyRenterPartnership;
