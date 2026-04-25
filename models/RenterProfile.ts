import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const RenterProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    city: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified"
    }
  },
  { timestamps: true }
);

export type RenterProfileDocument = InferSchemaType<typeof RenterProfileSchema> & { _id: string };

const RenterProfile =
  (models.RenterProfile as Model<RenterProfileDocument>) || model("RenterProfile", RenterProfileSchema);

export default RenterProfile;
