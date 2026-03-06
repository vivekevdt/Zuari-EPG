import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true
        },
        userEntity: {
            type: String,
        },
        userMail: {
            type: String,
            required: true
        },
        userImpactLevel: {
            type: String,
        },
        userCategory: {
            type: String,
        },
        userQuestion: {
            type: String,
            required: true
        },
        aiResponse: {
            type: String,
            required: true
        },
        thumbs: {
            type: String,
            enum: ['up', 'down'],
            required: true
        },
        description: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
