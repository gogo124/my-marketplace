import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const AnalyticsEventSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["page_view", "booking_click", "whatsapp_click", "listing_click", "reservation_attempt", "reservation_success"]
    },
    page: { type: String, required: true, trim: true },
    timestamp: { type: Date, required: true, default: Date.now }
  },
  { versionKey: false }
);

AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ type: 1, timestamp: -1 });
AnalyticsEventSchema.index({ page: 1, timestamp: -1 });

export type AnalyticsEventDocument = InferSchemaType<typeof AnalyticsEventSchema> & { _id: string };

const AnalyticsEvent =
  (models.AnalyticsEvent as Model<AnalyticsEventDocument>) ||
  model("AnalyticsEvent", AnalyticsEventSchema);

export default AnalyticsEvent;
