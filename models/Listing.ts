import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ListingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    images: [{ type: String }],
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export type ListingDocument = InferSchemaType<typeof ListingSchema> & { _id: string };

const Listing = (models.Listing as Model<ListingDocument>) || model("Listing", ListingSchema);

export default Listing;
