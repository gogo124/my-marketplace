import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AffiliatePartnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    logoUrl: { type: String, required: true, trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    displayOrder: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);
AffiliatePartnerSchema.index({ active: 1, displayOrder: 1, createdAt: 1 });
export type AffiliatePartnerDocument = InferSchemaType<typeof AffiliatePartnerSchema> & { _id: string };
const AffiliatePartner = (models.AffiliatePartner as Model<AffiliatePartnerDocument>) || model("AffiliatePartner", AffiliatePartnerSchema);
export default AffiliatePartner;
