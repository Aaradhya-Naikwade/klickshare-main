import mongoose from "mongoose";

const NotificationSchema =
  new mongoose.Schema({

    userId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    groupId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    read: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

// CRITICAL FIX
const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    NotificationSchema
  );

export default Notification;
