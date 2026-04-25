import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const LeadSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["whatsapp", "call", "chat"],
      required: true
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new"
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type LeadDocument = InferSchemaType<typeof LeadSchema> & { _id: string };

const Lead = (models.Lead as Model<LeadDocument>) || model("Lead", LeadSchema);

export default Lead;
