import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    priceInr: {
      type: Number,
      required: true,
      min: 0,
    },
    quota: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Plan ||
  mongoose.model("Plan", PlanSchema);

