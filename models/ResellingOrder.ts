import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ResellingOrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, trim: true },
  productId: { type: Schema.Types.ObjectId, ref: "ResellingProduct", required: true },
  productSnapshot: { type: Schema.Types.Mixed, required: true },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { type: String, trim: true, default: "" },
  customerNote: { type: String, trim: true, default: "" },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  sourceCostSnapshot: { type: Number, required: true, min: 0 },
  profitSnapshot: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["cod"], default: "cod" },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "customer_unreachable"], default: "pending" },
  internalNote: { type: String, trim: true, default: "" }
}, { timestamps: true });

ResellingOrderSchema.index({ status: 1, createdAt: -1 });
ResellingOrderSchema.index({ phone: 1, createdAt: -1 });

export type ResellingOrderDocument = InferSchemaType<typeof ResellingOrderSchema> & { _id: string };
const ResellingOrder = (models.ResellingOrder as Model<ResellingOrderDocument>) || model("ResellingOrder", ResellingOrderSchema);
export default ResellingOrder;
