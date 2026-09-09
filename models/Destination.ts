import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const LocalizedStringSchema = new Schema({
  ar: { type: String, default: "" },
  fr: { type: String, default: "" },
  en: { type: String, default: "" },
}, { _id: false });

const ArticleSectionSchema = new Schema({
  type: { type: String, enum: ["heading", "paragraph", "list", "quote", "image", "tip"], required: true },
  title: { type: LocalizedStringSchema, default: () => ({}) },
  body: { type: LocalizedStringSchema, default: () => ({}) },
  imageUrl: { type: String, default: "" },
  imagePublicId: { type: String, default: "" },
  caption: { type: LocalizedStringSchema, default: () => ({}) },
  items: { type: [LocalizedStringSchema], default: [] },
}, { _id: true });

const GalleryImageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: "" },
  caption: { type: LocalizedStringSchema, default: () => ({}) },
}, { _id: true });

const SocialSchema = new Schema({
  instagram: String,
  facebook: String,
  tiktok: String,
  youtube: String,
  website: String,
  other: String,
}, { _id: false });

const RecommendedAgencySchema = new Schema({
  agency: { type: Schema.Types.ObjectId, ref: "AgencyProfile", required: true },
  description: { type: LocalizedStringSchema, default: () => ({}) },
  bookingUrl: { type: String, default: "" },
  socials: { type: SocialSchema, default: () => ({}) },
}, { _id: true });

const DestinationSchema = new Schema({
  name: { type: LocalizedStringSchema, required: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  location: { type: LocalizedStringSchema, default: () => ({}) },
  category: { type: LocalizedStringSchema, default: () => ({}) },
  shortDescription: { type: LocalizedStringSchema, default: () => ({}) },
  intro: { type: LocalizedStringSchema, default: () => ({}) },
  coverImage: { type: String, required: true },
  coverImagePublicId: { type: String, default: "" },
  gallery: { type: [GalleryImageSchema], default: [] },
  article: { type: [ArticleSectionSchema], default: [] },
  recommendedAgencies: { type: [RecommendedAgencySchema], default: [] },
  seoTitle: { type: LocalizedStringSchema, default: () => ({}) },
  seoDescription: { type: LocalizedStringSchema, default: () => ({}) },
  featured: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: false, index: true },
  displayOrder: { type: Number, default: 0, index: true },
}, { timestamps: true });

export type DestinationDocument = InferSchemaType<typeof DestinationSchema> & { _id: string };
const Destination = (models.Destination as Model<DestinationDocument>) || model("Destination", DestinationSchema);
export default Destination;
