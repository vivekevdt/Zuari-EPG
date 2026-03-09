import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import InsightFlag from '../models/InsightFlag.js';
import Entity from '../models/Entity.js';
import MessageThemeLog from '../models/MessageThemeLog.js';
import QuestionTheme from '../models/QuestionTheme.js';

import aiService from '../services/aiService.js';
import DemandCache from '../models/DemandCache.js';


// ── Helper: get date range from period string ─────────────────────────────────
const getPeriodRange = (period) => {
    const now = new Date();
    let startDate;
    if (period === '90') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
    } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
    } else {
        // default: 30 days
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
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

        // Total conversations
        const totalConvs = await Conversation.countDocuments({ ...userIdFilter, createdAt: { $gte: startDate, $lte: now } });
        const prevTotalConvs = await Conversation.countDocuments({ ...userIdFilter, createdAt: { $gte: prevStart, $lt: startDate } });

        // Unique employees with conversations
        const uniqueUserIds = await Conversation.distinct('userId', { ...userIdFilter, createdAt: { $gte: startDate, $lte: now } });
        const prevUniqueUserIds = await Conversation.distinct('userId', { ...userIdFilter, createdAt: { $gte: prevStart, $lt: startDate } });

        // Queries this week
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);

        const queriesThisWeek = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: weekStart, $lte: now } });
        const queriesPrevWeek = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: prevWeekStart, $lt: weekStart } });

        // Feedback ratings (helpful / unhelpful / not voted)
        const unhelpfulCount = await Feedback.countDocuments({ thumbs: 'down', ...entityFeedbackFilter, createdAt: { $gte: startDate, $lte: now } });
        const prevUnhelpfulCount = await Feedback.countDocuments({ thumbs: 'down', ...entityFeedbackFilter, createdAt: { $gte: prevStart, $lt: startDate } });
        const helpfulCount = await Feedback.countDocuments({ thumbs: 'up', ...entityFeedbackFilter, createdAt: { $gte: startDate, $lte: now } });

        // Daily query volume for the last 7 days
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

        // Queries by impact level
        const allConvUserIds = await Conversation.distinct('userId', { ...userIdFilter, createdAt: { $gte: startDate, $lte: now } });
        const userLevels = await User.find({ _id: { $in: allConvUserIds } }).select('level').populate('level', 'name');
        const levelCounts = {};
        userLevels.forEach(u => {
            const lvl = u.level?.name || 'Unassigned';
            levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
        });
        const totalLevelUsers = Object.values(levelCounts).reduce((a, b) => a + b, 0);
        const byLevel = Object.entries(levelCounts).map(([name, count]) => ({
            name, count,
            pct: totalLevelUsers ? Math.round((count / totalLevelUsers) * 100) : 0
        }));

        // Total users in org
        const orgFilter = entityUserIds ? { _id: { $in: entityUserIds }, roles: 'employee' } : { roles: 'employee' };
        const totalOrgUsers = await User.countDocuments(orgFilter);

        // Most Accessed Policies (Themes) aggregation - Mapped to high-level policies
        const themeLogs = await MessageThemeLog.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$themeName', count: { $sum: 1 } } }
        ]);

        const themeToPolicy = {
            // Travel Policy
            'Business Travel Approval & Booking': 'Travel Policy',
            'Travel Expense Reimbursement': 'Travel Policy',
            'Per Diem & Daily Allowance': 'Travel Policy',

            // Leave & Holiday Policy
            'Leave Application & Approval': 'Leave and Holiday Policy',
            'Leave Balance & Entitlement': 'Leave and Holiday Policy',
            'Leave Carry Forward & Encashment': 'Leave and Holiday Policy',
            'Holiday Calendar & Optional Holidays': 'Leave and Holiday Policy',
            'Maternity, Paternity & Special Leaves': 'Leave and Holiday Policy',

            // Health Insurance Policy
            'Health Insurance Coverage & Benefits': 'Health Insurance Policy',
            'Medical Claim & Reimbursement Process': 'Health Insurance Policy',
            'Cashless Treatment & Network Hospitals': 'Health Insurance Policy',
            'Dependent Coverage (Family Members)': 'Health Insurance Policy',

            // Car Lease Policy
            'Car Lease Eligibility & Entitlement': 'Car Lease Policy',
            'Car Lease Application Process': 'Car Lease Policy',

            // Working Hour Policy
            'Working Hours, Shifts & Attendance': 'Working Hour Policy',
            'Work from Home & Flexi Policy': 'Working Hour Policy',
            'Overtime & Compensatory Off': 'Working Hour Policy',

            // Departmental Get-together Policy
            'Team Events & Departmental Budget': 'Departmental Get-together Policy'
        };

        const policyCounts = {};
        let totalThemeQueries = 0;

        themeLogs.forEach(log => {
            const policyName = themeToPolicy[log._id] || 'Other Policies';
            policyCounts[policyName] = (policyCounts[policyName] || 0) + log.count;
            totalThemeQueries += log.count;
        });

        const policyAccess = Object.entries(policyCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalThemeQueries ? Math.round((count / totalThemeQueries) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);

        const delta = (curr, prev) => {
            if (prev === 0) return curr > 0 ? { type: 'up', value: curr } : { type: 'neutral', value: 0 };
            const pct = Math.round(((curr - prev) / prev) * 100);
            return { type: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral', value: Math.abs(pct) };
        };

        res.json({
            data: {
                totalConversations: { value: totalConvs, delta: delta(totalConvs, prevTotalConvs) },
                uniqueEmployees: { value: uniqueUserIds.length, total: totalOrgUsers, delta: delta(uniqueUserIds.length, prevUniqueUserIds.length) },
                queriesThisWeek: { value: queriesThisWeek, delta: delta(queriesThisWeek, queriesPrevWeek) },
                unhelpfulRatings: { value: unhelpfulCount, delta: delta(unhelpfulCount, prevUnhelpfulCount) },
                helpfulRatings: { value: helpfulCount },
                dailyVolume: last7Days,
                byLevel,
                policyAccess // New field for the donut chart
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

        const gaps = await Feedback.find(filter)
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

        const feedbackCount = await Feedback.countDocuments(filter);

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
        const feedbacks = await Feedback.find(filter)
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
