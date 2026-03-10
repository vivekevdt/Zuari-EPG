import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import QueryFeedback from '../models/QueryFeedback.js';
import InsightFlag from '../models/InsightFlag.js';
import Entity from '../models/Entity.js';
import MessageThemeLog from '../models/MessageThemeLog.js';
import QuestionTheme from '../models/QuestionTheme.js';
import UserFeedback from '../models/UserFeedback.js';

import aiService from '../services/aiService.js';
import DemandCache from '../models/DemandCache.js';
import { generateCSV } from '../utils/csvHelper.js';


// ── Helper: get date range from period string ─────────────────────────────────
const getPeriodRange = (period) => {
    const now = new Date();
    let startDate;
    if (period === '90') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
    } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === '7') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    } else {
        // default: 7 days (Weekly)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }
    const prevStart = new Date(startDate);
    prevStart.setTime(prevStart.getTime() - (now - startDate));
    return { startDate, prevStart, now };
};


// ── Helper: build entity filter for User/Conversation/Message queries ────────
// entityName is the string name of the entity as stored in Entity collection
const getUserIdsByEntity = async (entityName) => {
    if (!entityName || entityName === 'all') return null;
    // Find the entity document by name
    const entityDoc = await Entity.findOne({ name: entityName }).lean();
    if (!entityDoc) return [];
    const users = await User.find({ entity: entityDoc._id }).select('_id').lean();
    return users.map(u => u._id);
};

// ── GET /insights/adoption ────────────────────────────────────────────────────
export const getAdoption = async (req, res) => {
    try {
        const { entity, period } = req.query;
        const { startDate, prevStart, now } = getPeriodRange(period);

        // Build user ID list if entity filter is applied
        const entityUserIds = await getUserIdsByEntity(entity);
        const userIdFilter = entityUserIds ? { userId: { $in: entityUserIds } } : {};
        // For feedback, use the entity name string directly (as stored by feedbackController)
        const entityFeedbackFilter = entity && entity !== 'all' ? { userEntity: entity } : {};

        // 1. Total Inquiries (Total volume of unique employee questions)
        const totalInquiries = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: startDate, $lte: now } });
        const prevTotalInquiries = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: prevStart, $lt: startDate } });

        // 2. Unresolved / Human Handoff (Assistant returns "not covered")
        // Note: For escalation calculation, we look for "not covered" keywords in AI responses
        const unresolvedQueries = await Message.countDocuments({
            role: 'ai',
            content: { $regex: /not covered/i },
            ...userIdFilter,
            createdAt: { $gte: startDate, $lte: now }
        });
        console.log('Unresolved Queries:', unresolvedQueries);
        const prevUnresolvedQueries = await Message.countDocuments({
            role: 'ai',
            content: { $regex: /not covered/i },
            ...userIdFilter,
            createdAt: { $gte: prevStart, $lt: startDate }
        });

        // 3. AI Resolution Rate
        const resolvedCount = Math.max(0, totalInquiries - unresolvedQueries);
        const prevResolvedCount = Math.max(0, prevTotalInquiries - prevUnresolvedQueries);

        const resolutionRate = totalInquiries > 0 ? Math.round((resolvedCount / totalInquiries) * 100) : 0;
        const prevResolutionRate = prevTotalInquiries > 0 ? Math.round((prevResolvedCount / prevTotalInquiries) * 100) : 0;

        // 4. HR Time Saved (efficiency) - Using 10 minutes average manual handling time
        const hrTimeSavedMinutes = resolvedCount * 10;
        const prevHrTimeSavedMinutes = prevResolvedCount * 10;

        // 5. Human Handoff / Escalation Rate
        const handoffRate = totalInquiries > 0 ? Math.round((unresolvedQueries / totalInquiries) * 100) : 0;
        const prevHandoffRate = prevTotalInquiries > 0 ? Math.round((prevUnresolvedQueries / prevTotalInquiries) * 100) : 0;

        // 6. User Feedback (Helpful vs Unhelpful)
        const helpfulCount = await QueryFeedback.countDocuments({ thumbs: 'up', ...entityFeedbackFilter, createdAt: { $gte: startDate, $lte: now } });
        const prevHelpfulCount = await QueryFeedback.countDocuments({ thumbs: 'up', ...entityFeedbackFilter, createdAt: { $gte: prevStart, $lt: startDate } });
        const unhelpfulCount = await QueryFeedback.countDocuments({ thumbs: 'down', ...entityFeedbackFilter, createdAt: { $gte: startDate, $lte: now } });
        const prevUnhelpfulCount = await QueryFeedback.countDocuments({ thumbs: 'down', ...entityFeedbackFilter, createdAt: { $gte: prevStart, $lt: startDate } });

        // Total unique employees for reference
        const uniqueUserIds = await Conversation.distinct('userId', { ...userIdFilter, createdAt: { $gte: startDate, $lte: now } });
        const totalOrgUsers = await User.countDocuments(entityUserIds ? { _id: { $in: entityUserIds }, roles: 'employee' } : { roles: 'employee' });

        // Daily volume chart (staying the same for now)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(now);
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const count = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: dayStart, $lte: dayEnd } });
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            last7Days.push({ day: dayNames[dayStart.getDay()], count });
        }

        // Policy access (staying the same)
        const themeLogs = await MessageThemeLog.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$themeName', count: { $sum: 1 } } }
        ]);
        const themeToPolicy = {
            'Business Travel Approval & Booking': 'Travel Policy', 'Travel Expense Reimbursement': 'Travel Policy', 'Per Diem & Daily Allowance': 'Travel Policy',
            'Leave Application & Approval': 'Leave and Holiday Policy', 'Leave Balance & Entitlement': 'Leave and Holiday Policy', 'Leave Carry Forward & Encashment': 'Leave and Holiday Policy', 'Holiday Calendar & Optional Holidays': 'Leave and Holiday Policy', 'Maternity, Paternity & Special Leaves': 'Leave and Holiday Policy',
            'Health Insurance Coverage & Benefits': 'Health Insurance Policy', 'Medical Claim & Reimbursement Process': 'Health Insurance Policy', 'Cashless Treatment & Network Hospitals': 'Health Insurance Policy', 'Dependent Coverage (Family Members)': 'Health Insurance Policy',
            'Car Lease Eligibility & Entitlement': 'Car Lease Policy', 'Car Lease Application Process': 'Car Lease Policy',
            'Working Hours, Shifts & Attendance': 'Working Hour Policy', 'Work from Home & Flexi Policy': 'Working Hour Policy', 'Overtime & Compensatory Off': 'Working Hour Policy',
            'Team Events & Departmental Budget': 'Departmental Get-together Policy'
        };
        const policyCounts = {}; let totalThemeQueries = 0;
        themeLogs.forEach(log => {
            const policyName = themeToPolicy[log._id] || 'Other Policies';
            policyCounts[policyName] = (policyCounts[policyName] || 0) + log.count;
            totalThemeQueries += log.count;
        });
        const policyAccess = Object.entries(policyCounts).map(([name, count]) => ({ name, count, percentage: totalThemeQueries ? Math.round((count / totalThemeQueries) * 100) : 0 })).sort((a, b) => b.count - a.count);

        const delta = (curr, prev) => {
            if (prev === 0) return { type: 'neutral', value: 0 }; // Show 0% if no previous data
            const pct = Math.round(((curr - prev) / prev) * 100);
            return { type: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral', value: Math.abs(pct) };
        };

        res.json({
            data: {
                totalInquiries: { value: totalInquiries, delta: delta(totalInquiries, prevTotalInquiries) },
                aiResolutionRate: { value: resolutionRate, delta: delta(resolutionRate, prevResolutionRate) },
                hrTimeSaved: { value: hrTimeSavedMinutes, delta: delta(hrTimeSavedMinutes, prevHrTimeSavedMinutes) },
                humanHandoffRate: { value: handoffRate, delta: delta(handoffRate, prevHandoffRate) },
                userFeedback: {
                    helpful: helpfulCount,
                    unhelpful: unhelpfulCount,
                    helpfulDelta: delta(helpfulCount, prevHelpfulCount),
                    unhelpfulDelta: delta(unhelpfulCount, prevUnhelpfulCount)
                },
                dailyVolume: last7Days,
                policyAccess,
                // These were in original adoption response, keeping for compatibility if frontend needs them
                uniqueEmployees: { value: uniqueUserIds.length, total: totalOrgUsers }
            }
        });
    } catch (err) {
        console.error('getAdoption error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ── GET /insights/themes ──────────────────────────────────────────────────────
// Phase 1: Groups messages by conversation title (which is derived from first user message)
// This gives a real-data approximation of theme clustering.
// ── GET /insights/entities — list all entity names for the filter dropdown ────
export const getEntities = async (req, res) => {
    try {
        const entities = await Entity.find({}).select('name entityCode').sort({ name: 1 }).lean();
        res.json({ data: entities });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── GET /insights/themes — powered by Gemini classification + MessageThemeLog ─
export const getThemes = async (req, res) => {
    try {
        const { entity, period } = req.query;
        const { startDate, prevStart, now } = getPeriodRange(period);

        // Entity filter for MessageThemeLog
        const entityUserIds = await getUserIdsByEntity(entity);
        const entityFilter = entityUserIds ? { userId: { $in: entityUserIds } } : {};

        // Current period: [startDate → now]
        const currAgg = await MessageThemeLog.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now }, ...entityFilter } },
            { $group: { _id: '$themeId', count: { $sum: 1 }, themeName: { $first: '$themeName' }, sample: { $first: '$question' } } },
            { $sort: { count: -1 } }
        ]);

        // Previous period: [prevStart → startDate]
        const prevAgg = await MessageThemeLog.aggregate([
            { $match: { createdAt: { $gte: prevStart, $lt: startDate }, ...entityFilter } },
            { $group: { _id: '$themeId', count: { $sum: 1 }, themeName: { $first: '$themeName' } } }
        ]);

        const prevMap = Object.fromEntries(prevAgg.map(x => [x._id.toString(), x.count]));
        const maxCount = currAgg.length > 0 ? currAgg[0].count : 1;

        // All predefined themes (show even if 0 questions)
        const allPredefined = await QuestionTheme.find({ isPredefined: true }).lean();
        const presentIds = new Set(currAgg.map(x => x._id.toString()));
        const predefinedWithZero = allPredefined
            .filter(t => !presentIds.has(t._id.toString()))
            .map(t => ({ _id: t._id, count: 0, themeName: t.name, sample: '' }));

        const combined = [...currAgg, ...predefinedWithZero];

        const themes = combined.map(t => {
            const id = t._id.toString();
            const currentCount = t.count;
            const prevCount = prevMap[id] || 0;
            let trend = 'stable';
            if (currentCount > prevCount + 1) trend = 'up';
            else if (prevCount > currentCount + 1) trend = 'down';
            return {
                name: t.themeName,
                policy: t.themeName,
                count: currentCount,          // Total in current period (shown in card header)
                currentCount,                  // Explicit alias
                prevCount,                     // Previous equivalent period count
                pct: maxCount > 0 ? Math.round((currentCount / maxCount) * 100) : 0,
                sample: t.sample ? `"${t.sample.substring(0, 100)}"` : '',
                trend
            };
        });

        res.json({ data: themes });
    } catch (err) {
        console.error('getThemes error:', err);
        res.status(500).json({ message: err.message });
    }
};



// ── GET /insights/gaps ────────────────────────────────────────────────────────
export const getGaps = async (req, res) => {
    try {
        const { entity, period, type } = req.query;
        const { startDate, now } = getPeriodRange(period);

        const filter = {
            thumbs: 'down',
            createdAt: { $gte: startDate, $lte: now }
        };
        if (entity && entity !== 'all') filter.userEntity = entity;

        const gaps = await QueryFeedback.find(filter)
            .sort({ createdAt: -1 })
            .select('_id userQuestion userEntity userImpactLevel createdAt')
            .lean();

        // Map to privacy-safe shape
        const result = gaps.map(g => ({
            id: g._id,
            type: 'unhelpful',
            question: g.userQuestion,
            entity: g.userEntity || 'Unknown',
            level: g.userImpactLevel || 'Unknown',
            count: 1,
            createdAt: g.createdAt
        }));

        res.json({ data: result });
    } catch (err) {
        console.error('getGaps error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ── GET /insights/gaps/queue ──────────────────────────────────────────────────
export const getGapQueue = async (req, res) => {
    try {
        const queue = await InsightFlag.find({ flaggedBy: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ data: queue });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── POST /insights/gaps/:id/flag ──────────────────────────────────────────────
export const flagGap = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, policy, entity, level } = req.body;

        // Upsert — silently skip if already flagged by this admin
        const flag = await InsightFlag.findOneAndUpdate(
            { feedbackId: id, flaggedBy: req.user._id },
            { feedbackId: id, flaggedBy: req.user._id, question, policy, entity, level },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ data: flag });
    } catch (err) {
        if (err.code === 11000) return res.json({ data: { alreadyFlagged: true } });
        res.status(500).json({ message: err.message });
    }
};

// ── DELETE /insights/gaps/queue/:id ──────────────────────────────────────────
export const unflagGap = async (req, res) => {
    try {
        const { id } = req.params;
        await InsightFlag.findOneAndDelete({ _id: id, flaggedBy: req.user._id });
        res.json({ data: { success: true } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── GET /insights/demand ──────────────────────────────────────────────────────
export const getDemand = async (req, res) => {
    try {
        const { entity, period } = req.query;
        const { startDate, now } = getPeriodRange(period);

        const filter = {
            thumbs: 'down',
            createdAt: { $gte: startDate, $lte: now }
        };
        if (entity && entity !== 'all') filter.userEntity = entity;

        const feedbackCount = await QueryFeedback.countDocuments(filter);

        if (feedbackCount === 0) {
            return res.json({ data: [] });
        }

        // 1. Check Cache first
        const cacheEntry = await DemandCache.findOne({
            entity: entity || 'all',
            period: period || '30',
            feedbackCount
        }).lean();

        if (cacheEntry) {
            return res.json({ data: cacheEntry.clusters });
        }


        // 2. Fetch fresh data if cache miss
        const feedbacks = await QueryFeedback.find(filter)
            .select('userQuestion userEntity userImpactLevel userCategory')
            .lean();

        const questions = feedbacks.map(f => f.userQuestion);
        const clusters = await aiService.clusterDemandGaps(questions);

        // 3. Map clusters with entity/level details
        const demand = clusters.map(cluster => {
            const segments = new Set();
            let count = 0;

            (cluster.indices || []).forEach(idx => {
                const f = feedbacks[idx];
                if (!f) return;
                count++;
                if (f.userEntity) segments.add(f.userEntity);
                if (f.userImpactLevel) segments.add(f.userImpactLevel);
            });

            return {
                theme: cluster.theme,
                count: count || cluster.samples.length,
                strength: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low',
                samples: cluster.samples,
                segments: [...segments]
            };
        }).sort((a, b) => b.count - a.count);

        // 4. Update Cache (upsert)
        await DemandCache.findOneAndUpdate(
            { entity: entity || 'all', period: period || '30' },
            { entity: entity || 'all', period: period || '30', feedbackCount, clusters: demand },
            { upsert: true, new: true }
        );

        res.json({ data: demand });
    } catch (err) {
        console.error('getDemand error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const getFeedbackAnalysis = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        const prevStart = new Date(startDate);
        prevStart.setDate(prevStart.getDate() - 30);

        // 1. Overall Experience (Rating)
        const currentFeedbacks = await UserFeedback.find({ createdAt: { $gte: startDate, $lte: now } }).select('rating').lean();
        const prevFeedbacks = await UserFeedback.find({ createdAt: { $gte: prevStart, $lt: startDate } }).select('rating').lean();

        const avgRating = currentFeedbacks.length > 0
            ? (currentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / currentFeedbacks.length)
            : 0;

        const prevAvgRating = prevFeedbacks.length > 0
            ? (prevFeedbacks.reduce((sum, f) => sum + f.rating, 0) / prevFeedbacks.length)
            : 0;

        const ratingDiff = (avgRating - prevAvgRating).toFixed(1);
        const ratingDeltaPrefix = ratingDiff >= 0 ? '+' : '';

        // 2. Improvement Hotspots (Aggregate improvementAreas)
        const hotspotsAgg = await UserFeedback.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $unwind: '$improvementAreas' },
            { $group: { _id: '$improvementAreas', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const totalFeedbackWithImprovement = await UserFeedback.countDocuments({
            createdAt: { $gte: startDate, $lte: now },
            'improvementAreas.0': { $exists: true }
        });

        const hotspots = hotspotsAgg.map(h => ({
            area: h._id,
            percentage: totalFeedbackWithImprovement > 0 ? Math.round((h.count / totalFeedbackWithImprovement) * 100) : 0,
            count: h.count
        }));

        // 3. Employee Suggestions (Recent feedbacks with comments)
        const suggestions = await UserFeedback.find({ comment: { $ne: '' } })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('userName comment rating category createdAt improvementAreas successAreas userEntity userImpactLevel')
            .lean();

        res.json({
            data: {
                rating: avgRating.toFixed(1),
                ratingDelta: `${ratingDeltaPrefix}${ratingDiff}`,
                hotspots: hotspots.slice(0, 5), // Top 5 hotspots
                suggestions: suggestions.map(s => ({
                    id: s._id,
                    user: s.userName,
                    text: s.comment,
                    rating: s.rating,
                    category: s.category,
                    date: s.createdAt,
                    improvementAreas: s.improvementAreas,
                    successAreas: s.successAreas,
                    entity: s.userEntity,
                    level: s.userImpactLevel
                }))
            }
        });
    } catch (err) {
        console.error('getFeedbackAnalysis error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const exportFeedbackAnalysis = async (req, res) => {
    try {
        const feedbacks = await UserFeedback.find({}).sort({ createdAt: -1 }).lean();

        const headers = [
            'userName',
            'userEmail',
            'userEntity',
            'userImpactLevel',
            'rating',
            'category',
            'improvementAreas',
            'successAreas',
            'comment',
            'createdAt'
        ];

        // Format data for CSV (especially arrays and dates)
        const formattedData = feedbacks.map(f => {
            const date = new Date(f.createdAt);
            const day = String(date.getDate()).padStart(2, '0');
            const monthNum = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return {
                ...f,
                improvementAreas: (f.improvementAreas || []).join('; '),
                successAreas: (f.successAreas || []).join('; '),
                date: `="${day}/${monthNum}/${year}"`
            };
        });

        const csv = generateCSV(formattedData, [
            'userName',
            'userEmail',
            'userEntity',
            'userImpactLevel',
            'rating',
            'category',
            'improvementAreas',
            'successAreas',
            'comment',
            'date'
        ]);

        const csvWithBOM = '\uFEFF' + csv;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=user_feedback.csv');
        res.status(200).send(csvWithBOM);
    } catch (err) {
        console.error('exportFeedbackAnalysis error:', err);
        res.status(500).json({ message: err.message });
    }
};
