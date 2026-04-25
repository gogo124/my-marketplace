import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const StorySchema = new Schema(
  {
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    tripDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending"
    }
  },
  { timestamps: true }
);

StorySchema.index({ place: 1, status: 1, createdAt: -1 });

export type StoryDocument = InferSchemaType<typeof StorySchema> & { _id: string };

const Story = (models.Story as Model<StoryDocument>) || model("Story", StorySchema);

export default Story;
