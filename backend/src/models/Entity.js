import mongoose from "mongoose";

const entitySchema = new mongoose.Schema(
    {
        name: {
            type: String, // Full Entity Name (e.g., Zuari Industries Ltd)
            required: true,
            unique: true,
            trim: true
        },
        entityCode: {
            type: String, // Entity Code (e.g., ZIL)
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Entity", entitySchema);
