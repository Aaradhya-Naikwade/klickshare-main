import mongoose from "mongoose";

const UserPlanSchema = new mongoose.Schema(
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

    planStart: {
      type: Date,
      required: true,
      index: true,
    },

    planEnd: {
      type: Date,
      required: true,
      index: true,
    },

    priceInr: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    planQuota: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    carryForwardUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sourcePaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "canceled"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

UserPlanSchema.index(
  { userId: 1, status: 1, planEnd: -1 },
  { name: "user_active_plan_idx" }
);

UserPlanSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
    name: "user_single_active_idx",
  }
);

UserPlanSchema.index(
  { sourcePaymentId: 1 },
  {
    unique: true,
    sparse: true,
    name: "user_plan_source_payment_idx",
  }
);

export default mongoose.models.UserPlan ||
  mongoose.model("UserPlan", UserPlanSchema);
