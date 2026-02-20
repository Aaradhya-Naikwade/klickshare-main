import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  visibility: {
    type: String,
    enum: ["public", "private"],
    required: true,
  },

  inviteCode: {
    type: String,
    unique: true,
    required: true,
  },

  qrCodeUrl: {
    type: String,
    default: "",
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Group ||
  mongoose.model("Group", GroupSchema);
