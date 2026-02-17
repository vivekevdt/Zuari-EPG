import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["user", "ai"],
      required: true
    },

    content: {
      type: String,
      required: true
    },

    tokensUsed: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// 🔥 Important Index (Fast Chat Loading)
messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
