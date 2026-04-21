import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "agency"],
      default: "user"
    }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & { _id: string };

const User = (models.User as Model<UserDocument>) || model("User", UserSchema);

export default User;
