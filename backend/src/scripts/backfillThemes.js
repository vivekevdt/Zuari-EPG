import connectDB from '../config/db.js';
import Message from '../models/Message.js';
import MessageThemeLog from '../models/MessageThemeLog.js';
import User from '../models/User.js';
import { classifyAndRecord } from '../services/themeService.js';

const run = async () => {
    await connectDB();

    const userMessages = await Message.find({ role: 'user' }).sort({ createdAt: 1 }).lean();

    let count = 0;
    for (let i = 0; i < userMessages.length; i++) {
        const msg = userMessages[i];

        // Check if already logged
        const existing = await MessageThemeLog.findOne({ messageId: msg._id }).lean();
        if (existing) continue;

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
            count++;
        } catch (err) {
            console.error(`Failed to process message ${msg._id}:`, err.message);
        }

        // Rate limiting safety
        await new Promise(r => setTimeout(r, 200));
    }

    process.exit(0);
};

run().catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
