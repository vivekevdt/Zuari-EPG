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

    role: {
      type: String,
      default: "user"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
