import mongoose from "mongoose";

const impactLevelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        entity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Entity",
            required: true
        },
        createdBy: {
            type: String, // Admin name
            required: true
        }
    },
    { timestamps: true }
);

// Compound unique: same name can't appear twice within the same entity
impactLevelSchema.index({ name: 1, entity: 1 }, { unique: true });

export default mongoose.model("ImpactLevel", impactLevelSchema);
