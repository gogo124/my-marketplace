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
      enum: ["user", "agency", "renter", "admin"],
      default: "user"
    },
    sellerVerificationStatus: {
      type: String,
      enum: ["unverified", "verified"],
      default: "unverified"
    },
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "active", "expired", "suspended", "rejected"],
      default: "none"
    },
    sellerPlan: {
      type: String,
      enum: ["free", "monthly", null],
      default: null
    },
    sellerExpiresAt: {
      type: Date,
      default: null
    },
    sellerRequestedAt: {
      type: Date,
      default: null
    },
    sellerApprovedAt: {
      type: Date,
      default: null
    },
    sellerProfile: {
      businessName: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      whatsapp: { type: String, default: "", trim: true },
      instagram: { type: String, default: "", trim: true },
      facebook: { type: String, default: "", trim: true },
      description: { type: String, default: "", trim: true },
      whatTheySell: { type: String, default: "", trim: true }
    },
    activityProviderStatus: {
      type: String,
      enum: ["none", "pending", "active", "suspended", "rejected"],
      default: "none"
    },
    activityProviderRequestedAt: {
      type: Date,
      default: null
    },
    activityProviderApprovedAt: {
      type: Date,
      default: null
    },
    activityProviderProfile: {
      businessName: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      whatsapp: { type: String, default: "", trim: true },
      instagram: { type: String, default: "", trim: true },
      facebook: { type: String, default: "", trim: true },
      activityType: { type: String, default: "", trim: true },
      description: { type: String, default: "", trim: true }
    },
    verified: {
      type: Boolean,
      default: false
    },
    canCreateAgency: {
      type: Boolean,
      default: false
    },
    canCreateRenter: {
      type: Boolean,
      default: false
    },
    savedPlaceIds: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    accountStatus: {
      type: String,
      enum: ["active", "disabled"],
      default: "active"
    },
    passwordReset: {
      tokenHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      requestedAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & { _id: string };

const User = (models.User as Model<UserDocument>) || model("User", UserSchema);

export default User;
