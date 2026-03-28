import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    planKey: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    planQuota: {
      type: Number,
      required: true,
      default: 0,
    },

    orderAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    orderCurrency: {
      type: String,
      required: true,
      default: "INR",
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },

    statusHistory: {
      type: [
        {
          status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            required: true,
          },
          source: {
            type: String,
            default: "",
          },
          at: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    lastWebhookEvent: {
      type: String,
      default: "",
    },

    lastWebhookAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index(
  { razorpayOrderId: 1, razorpayPaymentId: 1 },
  { name: "razorpay_ids_idx" }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
