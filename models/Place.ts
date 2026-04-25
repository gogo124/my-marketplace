import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const PlaceSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    mapLink: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images: [{ type: String }],
    category: { type: String, required: true, trim: true },
    safety: { type: String, required: true, trim: true },
    bestSeason: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending"
    },
    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

PlaceSchema.index({ status: 1, createdAt: -1 });
PlaceSchema.index({ city: 1, category: 1, bestSeason: 1 });
PlaceSchema.index({ name: "text", city: "text", description: "text", category: "text" });

export type PlaceDocument = InferSchemaType<typeof PlaceSchema> & { _id: string };

const Place = (models.Place as Model<PlaceDocument>) || model("Place", PlaceSchema);

export default Place;
