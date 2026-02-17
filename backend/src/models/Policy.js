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
        entity: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'live', 'failed-please retry'],
            default: 'pending'
        },
        ischunked: {
            type: Boolean,
            default: false
        },
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
