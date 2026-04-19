import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export type MessageDocument = InferSchemaType<typeof MessageSchema> & { _id: string };

const Message = (models.Message as Model<MessageDocument>) || model("Message", MessageSchema);

export default Message;
