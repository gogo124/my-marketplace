import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export type ReviewDocument = InferSchemaType<typeof ReviewSchema> & { _id: string };

const Review = (models.Review as Model<ReviewDocument>) || model("Review", ReviewSchema);

export default Review;
