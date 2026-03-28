import mongoose from "mongoose";

const UserSchema =
  new mongoose.Schema(

    {

      phone: {
        type: String,
        unique: true,
        required: true,
        index: true,
      },

      role: {
        type: String,
        enum: [
          "viewer",
          "photographer",
        ],
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      companyName: {
        type: String,
        default: "",
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      profilePhoto: {
        type: String,
        default: "",
      },

      lastLoginAt: {
        type: Date,
        default: Date.now,
      },

      authToken: {
        type: String,
        default: "",
      },

      isAdmin: {
        type: Boolean,
        default: false,
        index: true,
      },

    },

    {
      timestamps: true, // CRITICAL FIX
    }

  );

// Prevent model overwrite (Next.js hot reload fix)
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    UserSchema
  );

export default User;
