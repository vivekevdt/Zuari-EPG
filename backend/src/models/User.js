import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },
    entity: {
      type: String,
      required: true
    },

    is_account_active: {
      type: Boolean,
      default: true
    },
    is_account_activated: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      default: "user"
    },
    level: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    entity_code: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
