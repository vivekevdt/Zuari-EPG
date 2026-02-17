import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    content: {
      type: String,
      required: true
    },

    fileName: {
      type: String
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
