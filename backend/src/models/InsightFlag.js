import mongoose from 'mongoose';

const insightFlagSchema = new mongoose.Schema(
    {
        feedbackId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback',
            required: true
        },
        flaggedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        question: { type: String },
        policy: { type: String },
        entity: { type: String },
        level: { type: String }
    },
    { timestamps: true }
);

// Each admin can only flag each feedback once
insightFlagSchema.index({ feedbackId: 1, flaggedBy: 1 }, { unique: true });

export default mongoose.model('InsightFlag', insightFlagSchema);
