import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AgencyProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    city: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    rating: { type: Number, default: 0 },
    linkedRenterPartners: [{ type: Schema.Types.ObjectId, ref: "RenterProfile" }],
    trustedRenterPartners: [{ type: Schema.Types.ObjectId, ref: "RenterProfile" }],
    recommendedRenterPartners: [{ type: Schema.Types.ObjectId, ref: "RenterProfile" }],
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified"
    }
  },
  { timestamps: true }
);

export type AgencyProfileDocument = InferSchemaType<typeof AgencyProfileSchema> & { _id: string };

const AgencyProfile =
  (models.AgencyProfile as Model<AgencyProfileDocument>) || model("AgencyProfile", AgencyProfileSchema);

export default AgencyProfile;
