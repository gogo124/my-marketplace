import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", default: null },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    images: [{ type: String }],
    providerReply: { type: String, default: "", trim: true },
    providerReplyAt: { type: Date, default: null },
    providerReplyBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending"
    }
  },
  { timestamps: true }
);

ReviewSchema.index(
  { listing: 1, author: 1 },
  { unique: true, partialFilterExpression: { listing: { $type: "objectId" } } }
);

export type ReviewDocument = InferSchemaType<typeof ReviewSchema> & { _id: string };

const Review = (models.Review as Model<ReviewDocument>) || model("Review", ReviewSchema);

export default Review;
