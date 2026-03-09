import connectDB from '../config/db.js';
import QuestionTheme, { PREDEFINED_THEMES } from '../models/QuestionTheme.js';

const run = async () => {
    await connectDB();
    // Clear old stale data (policy names that were incorrectly seeded)
    await QuestionTheme.deleteMany({});
    console.log('Cleared old QuestionTheme records');

    for (const name of PREDEFINED_THEMES) {
        await QuestionTheme.findOneAndUpdate(
            { name },
            { name, isPredefined: true },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }
    console.log(`✅ Seeded ${PREDEFINED_THEMES.length} predefined question categories`);
    const all = await QuestionTheme.find({}).lean();
    console.log('Current themes in DB:', all.map(t => `  - ${t.name}`).join('\n'));
    process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
