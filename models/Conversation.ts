import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ConversationSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    readState: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lastReadAt: { type: Date, default: null }
      }
    ],
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ConversationSchema.index({ listing: 1, participants: 1 });

export type ConversationDocument = InferSchemaType<typeof ConversationSchema> & { _id: string };

const Conversation =
  (models.Conversation as Model<ConversationDocument>) ||
  model("Conversation", ConversationSchema);

export default Conversation;
