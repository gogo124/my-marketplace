import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["listing", "agency", "travel-post", "user", "review", "place", "story"],
      required: true
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending"
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export type ReportDocument = InferSchemaType<typeof ReportSchema> & { _id: string };

const Report = (models.Report as Model<ReportDocument>) || model("Report", ReportSchema);

export default Report;
