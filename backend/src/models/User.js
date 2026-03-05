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

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },

    password: {
      type: String,
      required: true
    },

    // ── Linked to config collections via ObjectId ─────────────────────────
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entity',
      default: null
    },

    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImpactLevel',
      default: null
    },

    empCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeCategory',
      default: null
    },

    // ── Kept as plain string for quick access without join ────────────────
    entity_code: {
      type: String,
      default: ''
    },

    is_account_active: {
      type: Boolean,
      default: true
    },
    is_account_activated: {
      type: Boolean,
      default: false
    },

    roles: {
      type: [String],
      enum: ["employee", "admin", "superAdmin"],
      default: ["employee"]
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
