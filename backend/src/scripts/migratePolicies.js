import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Message from '../models/Message.js';
import Policy from '../models/Policy.js';
import MessageThemeLog from '../models/MessageThemeLog.js';

const migratePolicies = async () => {
    try {
        await connectDB();
        console.log('--- Starting Policy Name Migration ---');

        // 1. Fetch all valid policy titles
        const allPolicies = await Policy.find({ status: 'live' }).select('title').lean();
        const validPolicyTitles = allPolicies.map(p => p.title);
        console.log(`Found ${validPolicyTitles.length} valid policies:`, validPolicyTitles);

        const aiMessages = await Message.find({ role: 'ai', policyName: null });
        console.log(`Found ${aiMessages.length} messages to update.`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const msg of aiMessages) {
            let policyName = null;

            // 1. Try to extract from content (Source: ... )
            const sourceRegex = /Source:<\/strong>\s*([^<]+)/i;
            const match = msg.content.match(sourceRegex);
            if (match && match[1]) {
                const extracted = match[1].trim();
                // Check if it's a valid policy title (exact or starts with)
                const found = validPolicyTitles.find(t => t.toLowerCase() === extracted.toLowerCase() || extracted.toLowerCase().includes(t.toLowerCase()));
                if (found) {
                    policyName = found;
                }
            }

            // 2. Fallback to MessageThemeLog if still no policyName
            if (!policyName) {
                const userMsg = await Message.findOne({
                    conversationId: msg.conversationId,
                    role: 'user',
                    createdAt: { $lt: msg.createdAt }
                }).sort({ createdAt: -1 });

                if (userMsg) {
                    const themeLog = await MessageThemeLog.findOne({ messageId: userMsg._id });
                    if (themeLog && themeLog.themeName) {
                        // Check if themeName matches any policy title
                        const found = validPolicyTitles.find(t => t.toLowerCase() === themeLog.themeName.toLowerCase() || themeLog.themeName.toLowerCase().includes(t.toLowerCase()));
                        if (found) {
                            policyName = found;
                        }
                    }
                }
            }

            if (!policyName) {
                policyName = 'Other';
            }

            msg.policyName = policyName;
            await msg.save();
            updatedCount++;
            console.log(`[Migrated] messageId: ${msg._id}, Policy: ${policyName}`);
        }

        console.log('--- Migration Finished ---');
        console.log(`Total Updated: ${updatedCount}`);
        console.log(`Total Skipped: ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePolicies();
