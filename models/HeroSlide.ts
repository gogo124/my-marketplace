import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const LocalizedStringSchema = new Schema({
  ar: { type: String, default: "" },
  fr: { type: String, default: "" },
  en: { type: String, default: "" },
}, { _id: false });

const HeroSlideSchema = new Schema({
  image: { type: String, required: true },
  imagePublicId: { type: String, default: "" },
  mobileImage: { type: String, default: "" },
  mobileImagePublicId: { type: String, default: "" },
  eyebrow: { type: LocalizedStringSchema, default: () => ({}) },
  title: { type: LocalizedStringSchema, required: true },
  description: { type: LocalizedStringSchema, default: () => ({}) },
  ctaLabel: { type: LocalizedStringSchema, default: () => ({}) },
  ctaUrl: { type: String, default: "" },
  displayOrder: { type: Number, default: 0, index: true },
  published: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export type HeroSlideDocument = InferSchemaType<typeof HeroSlideSchema> & { _id: string };
const HeroSlide = (models.HeroSlide as Model<HeroSlideDocument>) || model("HeroSlide", HeroSlideSchema);
export default HeroSlide;
