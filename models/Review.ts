import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", default: null },
    place: { type: Schema.Types.ObjectId, ref: "Place", default: null },
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

ReviewSchema.pre("validate", function ensureReviewTarget(next) {
  if (!this.listing && !this.place) {
    next(new Error("A review must belong to a listing or a place."));
    return;
  }

  if (this.listing && this.place) {
    next(new Error("A review cannot belong to both a listing and a place."));
    return;
  }

  next();
});

ReviewSchema.index(
  { listing: 1, author: 1 },
  { unique: true, partialFilterExpression: { listing: { $type: "objectId" } } }
);
ReviewSchema.index(
  { place: 1, author: 1 },
  { unique: true, partialFilterExpression: { place: { $type: "objectId" } } }
);
ReviewSchema.index({ place: 1, status: 1, createdAt: -1 });

export type ReviewDocument = InferSchemaType<typeof ReviewSchema> & { _id: string };

const Review = (models.Review as Model<ReviewDocument>) || model("Review", ReviewSchema);

export default Review;
