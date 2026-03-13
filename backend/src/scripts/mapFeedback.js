import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import QueryFeedback from '../models/QueryFeedback.js';
import UserFeedback from '../models/UserFeedback.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mapFeedback = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // 1. Get all User Feedbacks (Overall ratings)
        const userFeedbacks = await UserFeedback.find().lean();
        console.log(`Found ${userFeedbacks.length} overall user feedback entries.`);

        const mapping = [];

        for (const uf of userFeedbacks) {
            // Find related query feedbacks (individual thumbs up/down) by email
            const relatedQueryFeedbacks = await QueryFeedback.find({
                userMail: uf.userEmail
            }).lean();

            mapping.push({
                user: uf.userName,
                email: uf.userEmail,
                overallRating: uf.rating,
                comment: uf.comment,
                queryFeedbacksCount: relatedQueryFeedbacks.length,
                individualQueries: relatedQueryFeedbacks.map(qf => ({
                    question: qf.userQuestion,
                    thumbs: qf.thumbs,
                    timestamp: qf.createdAt
                }))
            });
        }

        // Display results
        console.log('\n--- Feedback Mapping Results ---');
        mapping.forEach(m => {
            console.log(`\nUser: ${m.user} (${m.email})`);
            console.log(`Overall Rating: ${m.overallRating}/5 | Comment: ${m.comment || 'N/A'}`);
            console.log(`Individual Query Actions: ${m.queryFeedbacksCount}`);
            m.individualQueries.forEach(q => {
                console.log(`  - [${q.thumbs.toUpperCase()}] "${q.question}"`);
            });
        });

        // 2. Statistics
        const usersWithBoth = mapping.filter(m => m.queryFeedbacksCount > 0).length;
        console.log(`\n--- Statistics ---`);
        console.log(`Total users who gave overall feedback: ${userFeedbacks.length}`);
        console.log(`Users who also rated specific AI answers: ${usersWithBoth}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error mapping feedback:', err);
        process.exit(1);
    }
};

mapFeedback();
