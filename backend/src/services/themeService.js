import QuestionTheme, { PREDEFINED_THEMES } from '../models/QuestionTheme.js';
import MessageThemeLog from '../models/MessageThemeLog.js';
import aiService from './aiService.js';

// ── Seed the 6 predefined themes exactly once on startup ──────────────────────
export const seedPredefinedThemes = async () => {
    try {
        for (const name of PREDEFINED_THEMES) {
            await QuestionTheme.findOneAndUpdate(
                { name },
                { name, isPredefined: true },
                { upsert: true, setDefaultsOnInsert: true }
            );
        }
    } catch (err) {
        console.error('❌ seedPredefinedThemes failed:', err.message);
    }
};

import { createLog } from '../utils/logger.js';

// ── Classify a question and record the result ─────────────────────────────────
export const classifyAndRecord = async ({
    messageId,
    userId,
    conversationId,
    question,
    entityName = '',
    levelName = ''
}) => {
    try {
        // Telemetry log to DB so we can verify this is hitting in production
        await createLog(userId, 'System (Theme)', 'system', null, `Theme classification started: ${question.substring(0, 30)}`);

        // 1. Fetch all current theme names (predefined + previously discovered)
        const allThemes = await QuestionTheme.find({}).select('name').lean();
        const themeNames = allThemes.map(t => t.name);

        // 2. Ask Gemini to classify
        const result = await aiService.classifyQuestionTheme(question, themeNames);
        if (!result || !result.theme) {
            console.warn('classifyAndRecord: Gemini returned no theme for:', question.substring(0, 60));
            return;
        }

        // 3. Upsert theme (may be new if isNew === true)
        const theme = await QuestionTheme.findOneAndUpdate(
            { name: result.theme },
            {
                $setOnInsert: { name: result.theme, isPredefined: false },
                $inc: { count: 1 }
            },
            { upsert: true, new: true }
        );

        // 4. Write the log entry
        await MessageThemeLog.create({
            messageId,
            userId,
            conversationId,
            themeId: theme._id,
            themeName: theme.name,
            question,
            entity: entityName,
            level: levelName
        });

    } catch (err) {
        // Never throw — this runs fire-and-forget and must not crash the chat
        console.error('classifyAndRecord error:', err.message);
    }
};
