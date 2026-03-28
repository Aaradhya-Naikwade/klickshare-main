import mongoose from "mongoose";

const PaymentEventSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },
    event: {
      type: String,
      required: true,
      index: true,
    },
    signatureValid: {
      type: Boolean,
      default: false,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PaymentEventSchema.index(
  { razorpayOrderId: 1, receivedAt: -1 },
  { name: "order_received_idx" }
);

const ttlDays = Number(
  process.env.PAYMENT_LOG_TTL_DAYS || "90"
);
if (Number.isFinite(ttlDays) && ttlDays > 0) {
  PaymentEventSchema.index(
    { receivedAt: 1 },
    {
      expireAfterSeconds: Math.floor(
        ttlDays * 24 * 60 * 60
      ),
      name: "payment_event_ttl_idx",
    }
  );
}

export default mongoose.models.PaymentEvent ||
  mongoose.model("PaymentEvent", PaymentEventSchema);
