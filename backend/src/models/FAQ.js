import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        policyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Policy',
            required: true,
            index: true
        },
        faqs: [{
            question: {
                type: String,
                required: true
            }
        }]
    },
    { timestamps: true }
);

export default mongoose.model("FAQ", faqSchema);
