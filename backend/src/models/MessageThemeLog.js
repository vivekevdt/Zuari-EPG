import mongoose from 'mongoose';

const messageThemeLogSchema = new mongoose.Schema(
    {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true
        },
        themeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuestionTheme',
            required: true
        },
        // Denormalised for fast aggregation without extra joins
        themeName: {
            type: String,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        entity: {
            type: String,
            default: ''
        },
        level: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

messageThemeLogSchema.index({ themeId: 1, createdAt: -1 });
messageThemeLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('MessageThemeLog', messageThemeLogSchema);
