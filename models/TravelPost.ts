import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const TravelPostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "travel_posts"
  }
);

TravelPostSchema.index({ destination: 1, date: 1, createdAt: -1 });

export type TravelPostDocument = InferSchemaType<typeof TravelPostSchema> & { _id: string };

const TravelPost =
  (models.TravelPost as Model<TravelPostDocument>) || model("TravelPost", TravelPostSchema);

export default TravelPost;
