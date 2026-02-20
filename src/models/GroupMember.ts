import mongoose from "mongoose";

const GroupMemberSchema =
  new mongoose.Schema({
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: [
        "owner",
        "contributor",
        "viewer",
      ],
      default: "viewer",
    },

    accessLevel: {
      type: String,
      enum: ["partial", "full"],
      default: "partial",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "blocked",
      ],
      default: "pending",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  });

// prevent duplicate membership
GroupMemberSchema.index(
  { groupId: 1, userId: 1 },
  { unique: true }
);

export default mongoose.models.GroupMember ||
  mongoose.model(
    "GroupMember",
    GroupMemberSchema
  );
