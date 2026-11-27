import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const MarketplaceSyncLogSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "ResellingProduct", required: true, index: true },
  supplier: { type: String, required: true, trim: true },
  sourceUrl: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ["success", "unchanged", "error", "blocked", "manual_required"], required: true },
  changedFields: [{ type: String, trim: true }],
  changes: [{ field: { type: String, trim: true }, oldValue: { type: Schema.Types.Mixed }, newValue: { type: Schema.Types.Mixed } }],
  error: { type: String, default: "", trim: true },
  durationMs: { type: Number, min: 0, default: 0 }
}, { timestamps: false });
MarketplaceSyncLogSchema.index({ productId: 1, timestamp: -1 });
MarketplaceSyncLogSchema.index({ supplier: 1, timestamp: -1 });
export type MarketplaceSyncLogDocument = InferSchemaType<typeof MarketplaceSyncLogSchema> & { _id: string };
const MarketplaceSyncLog = (models.MarketplaceSyncLog as Model<MarketplaceSyncLogDocument>) || model("MarketplaceSyncLog", MarketplaceSyncLogSchema);
export default MarketplaceSyncLog;
