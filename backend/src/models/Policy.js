import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        filename: {
            type: String,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        entity: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entity',
            required: true
        }],
        impactLevel: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ImpactLevel'
        }],
        empCategory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmployeeCategory'
        }],
        description: {
            type: String
        },
        category: {
            type: String, // e.g. 'HR - General', 'HR - Compensation'
            default: 'General'
        },
        expiryDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['pending', 'live', 'draft', 'archived', 'failed-please retry'],
            default: 'pending'
        },
        ischunked: {
            type: Boolean,
            default: false
        },
        hasFaqs: {
            type: Boolean,
            default: false
        },
        version: {
            type: String, // e.g. '1.0'
            default: '1.0'
        },
        versions: [{
            _id: false,
            version: String,
            updatedAt: Date,
            changedBy: String,
            changeNote: String,
            filename: String
        }],
        chunks: [{

            content: {
                type: String,
                required: true
            },
            header: {
                type: String,
                required: true
            },

        }]
    },
    { timestamps: true }
);

export default mongoose.model("Policy", policySchema);
