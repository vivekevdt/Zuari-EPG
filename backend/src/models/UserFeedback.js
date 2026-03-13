import mongoose from "mongoose";

const userFeedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        userEmail: {
            type: String,
            required: true
        },
        userEntity: {
            type: String,
        },
        userImpactLevel: {
            type: String,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        category: {
            type: String,
            default: 'Other'
        },
        improvementAreas: {
            type: [String],
            default: []
        },
        successAreas: {
            type: [String],
            default: []
        },
        comment: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

export default mongoose.model("UserFeedback", userFeedbackSchema);
