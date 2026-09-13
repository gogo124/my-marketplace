import mongoose, { Schema, models } from "mongoose";

const AffiliateWidgetSchema = new Schema({
  name: { type: String, required: true, trim: true },
  provider: { type: String, enum: ["Viator", "GetYourGuide", "Tripadvisor", "Booking", "Other"], required: true },
  type: { type: String, enum: ["widget", "embed", "affiliate_link"], required: true },
  placement: { type: String, enum: ["activities", "destinations", "camping"], required: true },
  destinationId: { type: Schema.Types.ObjectId, ref: "Destination", default: null },
  destinationSlug: { type: String, default: "", trim: true, lowercase: true },
  embedCode: { type: String, default: "", trim: true },
  affiliateUrl: { type: String, default: "", trim: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

AffiliateWidgetSchema.index({ active: 1, placement: 1, destinationSlug: 1, createdAt: -1 });

export default models.AffiliateWidget || mongoose.model("AffiliateWidget", AffiliateWidgetSchema);
