import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const LocalizedTextSchema = new Schema({ ar: { type: String, trim: true, default: "" }, fr: { type: String, trim: true, default: "" }, en: { type: String, trim: true, default: "" } }, { _id: false });
const VariantSchema = new Schema({ name: { type: String, required: true, trim: true }, options: [{ type: String, trim: true }] }, { _id: false });
const SpecificationSchema = new Schema({ label: { type: String, required: true, trim: true }, value: { type: String, required: true, trim: true } }, { _id: false });

const ResellingProductSchema = new Schema({
  title: { type: LocalizedTextSchema, required: true },
  slug: { type: String, required: true, trim: true, lowercase: true },
  description: { type: LocalizedTextSchema, required: true },
  shortDescription: { type: LocalizedTextSchema, default: () => ({}) },
  images: [{ type: String, trim: true }],
  mainImage: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: "" },
  subcategory: { type: String, trim: true, default: "" },
  brand: { type: String, trim: true, default: "" },
  sku: { type: String, trim: true, default: "" },
  variants: [VariantSchema],
  specifications: [SpecificationSchema],
  sourceProvider: { type: String, trim: true, default: "manual" },
  sourceUrl: { type: String, trim: true, default: "" },
  sourceProductId: { type: String, trim: true, default: "" },
  sourcePrice: { type: Number, min: 0, default: 0 },
  sourceCurrency: { type: String, trim: true, default: "MAD" },
  sellingPrice: { type: Number, min: 0, required: true },
  marginType: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
  marginValue: { type: Number, min: 0, default: 0 },
  estimatedProfit: { type: Number, min: 0, default: 0 },
  shippingInfo: { type: LocalizedTextSchema, default: () => ({}) },
  stockStatus: { type: String, enum: ["available", "limited", "out_of_stock", "check_availability"], default: "check_availability" },
  badges: [{ type: String, trim: true }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published", "out_of_stock", "archived"], default: "draft" },
  metaTitle: { type: LocalizedTextSchema, default: () => ({}) },
  metaDescription: { type: LocalizedTextSchema, default: () => ({}) },
  ogImage: { type: String, trim: true, default: "" }
}, { timestamps: true });

ResellingProductSchema.index({ slug: 1 }, { unique: true });
ResellingProductSchema.index({ status: 1, featured: -1, createdAt: -1 });
ResellingProductSchema.index({ category: 1, brand: 1, status: 1 });
ResellingProductSchema.index({ sku: 1 }, { sparse: true });

export type ResellingProductDocument = InferSchemaType<typeof ResellingProductSchema> & { _id: string };
const ResellingProduct = (models.ResellingProduct as Model<ResellingProductDocument>) || model("ResellingProduct", ResellingProductSchema);
export default ResellingProduct;
