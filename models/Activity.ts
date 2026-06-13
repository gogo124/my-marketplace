import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ActivitySchema = new Schema({
  slug: { type: String, required: true, trim: true, lowercase: true },
  image: { type: String, required: true, trim: true },
  galleryImages: [{ type: String, trim: true }],
  ogImage: { type: String, trim: true, default: "" },
  title: { type: String, required: true, trim: true },
  metaTitle: { type: String, trim: true, default: "" },
  metaDescription: { type: String, trim: true, default: "" },
  shortDescription: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  affiliateUrl: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["MAD", "EUR", "USD"], default: "MAD" },
  discountedPrice: { type: Number, min: 0, default: null },
  types: [{ type: String, required: true, trim: true }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  viewCount: { type: Number, min: 0, default: 0 },
  bookClickCount: { type: Number, min: 0, default: 0 }
}, { timestamps: true });
ActivitySchema.index({ slug: 1 }, { unique: true, sparse: true });
ActivitySchema.index({ status: 1, featured: -1, createdAt: -1 });
ActivitySchema.index({ types: 1, status: 1, createdAt: -1 });
export type ActivityDocument = InferSchemaType<typeof ActivitySchema> & { _id: string };
const Activity = (models.AffiliateActivity as Model<ActivityDocument>) || model("AffiliateActivity", ActivitySchema);
export default Activity;
