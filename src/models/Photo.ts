import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  photoUrl: {
    type: String,
    required: true,
  },

  thumbnailUrl: {
    type: String,
    default: "",
  },

  facesIndexed: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Photo ||
  mongoose.model("Photo", PhotoSchema);
