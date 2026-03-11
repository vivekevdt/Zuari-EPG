import '../config/env.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Message from '../models/Message.js';
import MessageThemeLog from '../models/MessageThemeLog.js';
import User from '../models/User.js';
import QuestionTheme from '../models/QuestionTheme.js';
import { classifyAndRecord } from '../services/themeService.js';
import aiService from '../services/aiService.js';

const run = async () => {
    await connectDB();
    const userMessages = await Message.find({ role: 'user' }).sort({ createdAt: 1 }).lean();

    console.log('Wiping existing MessageThemeLogs...');
    await MessageThemeLog.deleteMany({});

    console.log('Resetting non-predefined QuestionThemes and counts...');
    await QuestionTheme.deleteMany({ isPredefined: false });
    await QuestionTheme.updateMany({}, { count: 0 });

    let count = 0;
    for (let i = 0; i < userMessages.length; i++) {
        const msg = userMessages[i];

        // Get user for entity/level info (ID only, avoid populate in standalone script)
        const user = await User.findById(msg.userId).lean();
        if (!user) {
            console.warn(`[${i + 1}/${userMessages.length}] User not found for message ${msg._id}. Skipping.`);
            continue;
        }

        if (i % 5 === 0) console.log(`[${i + 1}/${userMessages.length}] Processing: "${msg.content.substring(0, 30)}..."`);

        try {
            await classifyAndRecord({
                messageId: msg._id,
                userId: msg.userId,
                conversationId: msg.conversationId,
                question: msg.content,
                entityName: user.entity || '',
                levelName: user.level || ''
            });

            // Calculate & Update confidence score for the corresponding AI response
            // BUT save it on the USER message so the insights UI can read it mapping correctly.
            const aiResponseMsg = await Message.findOne({
                conversationId: msg.conversationId,
                role: 'ai',
                createdAt: { $gt: msg.createdAt }
            }).sort({ createdAt: 1 });


            if (aiResponseMsg && !msg.confidenceScore) {
                const confidence = await aiService.evaluateResponseQuality(msg.content, aiResponseMsg.content);
                msg.confidenceScore = confidence;
                await Message.updateOne({ _id: msg._id }, { $set: { confidenceScore: confidence } });
                console.log(`  -> Evaluated AI Response Confidence: ${confidence}%. Saved to User Message.`);
            }

            count++;
        } catch (err) {
            console.error(`Failed to process message ${msg._id}:`, err.message);
        }

        // Rate limiting safety
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Backfill finished. Processed ${count} messages.`);
    await mongoose.connection.close();
    setTimeout(() => process.exit(0), 1000);
};

run().catch(async (err) => {
    console.error('Backfill failed:', err);
    await mongoose.connection.close();
    setTimeout(() => process.exit(1), 1000);
});
