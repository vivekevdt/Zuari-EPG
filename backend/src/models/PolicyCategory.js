import mongoose from "mongoose";

const policyCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        createdBy: {
            type: String, // Admin name
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("PolicyCategory", policyCategorySchema);
