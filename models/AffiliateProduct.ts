import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const QuickInfoSchema = new Schema({ label: { type: String, required: true, trim: true }, value: { type: String, required: true, trim: true } }, { _id: false });
const AffiliateProductSchema = new Schema({
  slug: { type: String, required: true, trim: true, lowercase: true }, title: { type: String, required: true, trim: true }, description: { type: String, required: true, trim: true }, shortDescription: { type: String, trim: true, default: "" },
  metaTitle: { type: String, trim: true, default: "" }, metaDescription: { type: String, trim: true, default: "" }, ogImage: { type: String, trim: true, default: "" },
  image: { type: String, required: true, trim: true }, galleryImages: [{ type: String, trim: true }], affiliateUrl: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 }, currency: { type: String, enum: ["MAD", "EUR", "USD"], default: "MAD" }, discountedPrice: { type: Number, min: 0, default: null },
  category: { type: String, default: "", trim: true }, brand: { type: String, default: "", trim: true }, location: { type: String, default: "", trim: true }, productType: { type: String, default: "", trim: true },
  tags: [{ type: String, trim: true }], badges: [{ type: String, trim: true }], features: [{ type: String, trim: true }], highlights: [{ type: String, trim: true }], quickInfo: [QuickInfoSchema],
  featured: { type: Boolean, default: false }, recommended: { type: Boolean, default: false }, status: { type: String, enum: ["draft", "published"], default: "draft" }, viewCount: { type: Number, min: 0, default: 0 }, clickCount: { type: Number, min: 0, default: 0 }
}, { timestamps: true });
AffiliateProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
AffiliateProductSchema.index({ status: 1, featured: -1, createdAt: -1 });
AffiliateProductSchema.index({ category: 1, brand: 1, productType: 1, status: 1 });
AffiliateProductSchema.index({ tags: 1, status: 1 });
AffiliateProductSchema.index({ badges: 1, status: 1 });
AffiliateProductSchema.index({ features: 1, status: 1 });
export type AffiliateProductDocument = InferSchemaType<typeof AffiliateProductSchema> & { _id: string };
const AffiliateProduct = (models.AffiliateProduct as Model<AffiliateProductDocument>) || model("AffiliateProduct", AffiliateProductSchema);
export default AffiliateProduct;
