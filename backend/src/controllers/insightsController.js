import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import QueryFeedback from '../models/QueryFeedback.js';
import InsightFlag from '../models/InsightFlag.js';
import Entity from '../models/Entity.js';
import MessageThemeLog from '../models/MessageThemeLog.js';
import QuestionTheme from '../models/QuestionTheme.js';
import UserFeedback from '../models/UserFeedback.js';
import ImpactLevel from '../models/ImpactLevel.js';

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
    } else if (period === 'all') {
        startDate = new Date(0); // Jan 1, 1970
    } else if (period === '7') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    } else {
        // default: 7 days (Weekly)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }
    const prevStart = new Date(startDate);
    if (period === 'all') {
        prevStart.setTime(0); // No delta logic for all-time
    } else {
        prevStart.setTime(prevStart.getTime() - (now - startDate));
    }
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
        console.log(startDate, prevStart, now)

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
            content: { $regex: /not covered in the current HR policy/i },
            ...userIdFilter,
            createdAt: { $gte: startDate, $lte: now }
        });
        const prevUnresolvedQueries = await Message.countDocuments({
            role: 'ai',
            content: { $regex: /not covered in the current HR policy/i },
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

        // Dynamic volume chart data based on period
        const volumeData = [];
        if (period === '90') {
            // Last 13 weeks
            for (let i = 12; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                
                const count = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: weekStart, $lte: weekEnd } });
                const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                volumeData.push({ day: `${weekStart.getDate()} ${monthNamesShort[weekStart.getMonth()]}`, count });
            }
        } else if (period === 'year' || period === 'all') {
            // Months for this year or last 12 months
            const monthsCount = period === 'year' ? now.getMonth() + 1 : 12;
            for (let i = monthsCount - 1; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
                
                const count = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: monthStart, $lte: monthEnd } });
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                volumeData.push({ day: monthNames[monthStart.getMonth()], count });
            }
        } else {
            // Default/7 days: last 7 days
            for (let i = 6; i >= 0; i--) {
                const dayStart = new Date(now);
                dayStart.setDate(dayStart.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);
                const count = await Message.countDocuments({ role: 'user', ...userIdFilter, createdAt: { $gte: dayStart, $lte: dayEnd } });
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                volumeData.push({ day: dayNames[dayStart.getDay()], count });
            }
        }

        // Policy access (Aggregated from Message policyName field)
        const policyAggregationMatch = {
            role: 'ai',
            createdAt: { $gte: startDate, $lte: now }
        };
        if (entityUserIds) {
            policyAggregationMatch.userId = { $in: entityUserIds };
        }

        const policyLogs = await Message.aggregate([
            { $match: policyAggregationMatch },
            { $group: { _id: { $ifNull: ['$policyName', 'Other'] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const totalPolicyQueries = policyLogs.reduce((acc, curr) => acc + curr.count, 0);

        let policyAccess = policyLogs.map(log => ({
            name: log._id,
            count: log.count,
            percentage: totalPolicyQueries ? Math.round((log.count / totalPolicyQueries) * 100) : 0
        }));

        // Move "Other" to the end if it exists
        const otherIndex = policyAccess.findIndex(p => p.name === 'Other');
        if (otherIndex !== -1) {
            const [otherPolicy] = policyAccess.splice(otherIndex, 1);
            policyAccess.push(otherPolicy);
        }

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
                dailyVolume: volumeData,
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

// ── GET /insights/thematic-clusters ──────────────────────────────────────────
export const getThematicClusters = async (req, res) => {
    try {
        const { entity, period } = req.query;

        const { startDate, now } = getPeriodRange(period);


        // Entity filter for User/MessageThemeLog
        const entityUserIds = await getUserIdsByEntity(entity);
        const entityFilter = entityUserIds ? { userId: { $in: entityUserIds } } : {};

        // 1. Fetch theme logs within the selected period
        const logs = await MessageThemeLog.find({
            ...entityFilter,
            createdAt: { $gte: startDate, $lte: now }
        }).lean();

        if (logs.length === 0) {
            return res.json({ data: { resolved: [], gaps: [] } });
        }

        // 2. Fetch User and AI messages to accurately determine gap status per query
        const userMessages = await Message.find({ _id: { $in: logs.map(l => l.messageId) } }).select('conversationId createdAt').lean();
        const userMsgMap = new Map(userMessages.map(m => [m._id.toString(), m]));

        const conversationIds = [...new Set(logs.map(l => l.conversationId))];
        const allAiMessages = await Message.find({
            conversationId: { $in: conversationIds },
            role: 'ai'
        }).select('conversationId createdAt content').lean();

        const aiMessagesByConv = {};
        for (const msg of allAiMessages) {
            if (!aiMessagesByConv[msg.conversationId]) aiMessagesByConv[msg.conversationId] = [];
            aiMessagesByConv[msg.conversationId].push(msg);
        }
        for (const conv in aiMessagesByConv) {
            aiMessagesByConv[conv].sort((a, b) => a.createdAt - b.createdAt);
        }

        // 3. Categorize logs into clusters
        const clustersMap = {}; // themeName -> { resolved: [], gaps: [] }

        for (const log of logs) {
            if (!clustersMap[log.themeName]) {
                clustersMap[log.themeName] = { resolved: [], gaps: [] };
            }

            const userMsg = userMsgMap.get(log.messageId.toString());
            let isGap = false;
            let aiMsgContent = "N/A";

            if (userMsg && aiMessagesByConv[log.conversationId]) {
                const aiMsg = aiMessagesByConv[log.conversationId].find(m => m.createdAt > userMsg.createdAt);
                if (aiMsg) {
                    aiMsgContent = aiMsg.content;
                    if (/covered in the current HR policy/i.test(aiMsg.content)) {
                        isGap = true;
                    }
                }
            }

            // Prepare sample detail
            const sampleDetail = {
                question: log.question,
                response: aiMsgContent
            };

            if (isGap) {
                clustersMap[log.themeName].gaps.push(sampleDetail);
            } else {
                clustersMap[log.themeName].resolved.push(sampleDetail);
            }
        }

        // 4. Format into output arrays
        const resolvedArray = [];
        const gapsArray = [];
        let totalResolved = 0;
        let totalGaps = 0;

        for (const [themeName, data] of Object.entries(clustersMap)) {
            // Deduplicate samples by question string
            const uniqueResolved = Array.from(new Map(data.resolved.map(item => [item.question, item])).values());
            const uniqueGaps = Array.from(new Map(data.gaps.map(item => [item.question, item])).values());

            const resolvedCount = data.resolved.length;
            const gapsCount = data.gaps.length;
            totalResolved += resolvedCount;
            totalGaps += gapsCount;

            if (resolvedCount > 0) {
                resolvedArray.push({
                    name: themeName,
                    count: resolvedCount,
                    samples: uniqueResolved.slice(0, 5)
                });
            }
            if (gapsCount > 0) {
                gapsArray.push({
                    name: themeName,
                    count: gapsCount,
                    samples: uniqueGaps.slice(0, 5)
                });
            }
        }

        // Calculate percentages
        resolvedArray.forEach(c => c.percentage = totalResolved > 0 ? Math.round((c.count / totalResolved) * 100) : 0);
        gapsArray.forEach(c => c.percentage = totalGaps > 0 ? Math.round((c.count / totalGaps) * 100) : 0);

        // Sort by count descending
        resolvedArray.sort((a, b) => b.count - a.count);
        gapsArray.sort((a, b) => b.count - a.count);

        res.json({
            data: {
                resolved: resolvedArray,
                gaps: gapsArray
            }
        });

    } catch (err) {
        console.error('getThematicClusters error:', err);
        res.status(500).json({ message: err.message });
    }
};


export const getFeedbackAnalysis = async (req, res) => {
    try {
        const { entity, level, search } = req.query;
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        const prevStart = new Date(startDate);
        prevStart.setDate(prevStart.getDate() - 30);

        // Build filters
        const baseFilter = {};
        if (entity && entity !== 'all') baseFilter.userEntity = entity;
        if (level && level !== 'all') baseFilter.userImpactLevel = level;

        // 1. Overall Experience (Rating)
        const currentFeedbacks = await UserFeedback.find({
            ...baseFilter,
            createdAt: { $gte: startDate, $lte: now }
        }).select('rating').lean();

        const prevFeedbacks = await UserFeedback.find({
            ...baseFilter,
            createdAt: { $gte: prevStart, $lt: startDate }
        }).select('rating').lean();

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
            {
                $match: {
                    ...baseFilter,
                    createdAt: { $gte: startDate, $lte: now }
                }
            },
            { $unwind: '$improvementAreas' },
            { $group: { _id: '$improvementAreas', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const totalFeedbackWithImprovement = await UserFeedback.countDocuments({
            ...baseFilter,
            createdAt: { $gte: startDate, $lte: now },
            'improvementAreas.0': { $exists: true }
        });

        const hotspots = hotspotsAgg.map(h => ({
            area: h._id,
            percentage: totalFeedbackWithImprovement > 0 ? Math.round((h.count / totalFeedbackWithImprovement) * 100) : 0,
            count: h.count
        }));

        // 3. Employee Suggestions (Filtered by entity, level, and search)
        const suggestionFilter = {
            ...baseFilter,
            comment: { $ne: '' }
        };
        if (search) {
            suggestionFilter.userName = { $regex: search, $options: 'i' };
        }

        const suggestions = await UserFeedback.find(suggestionFilter)
            .sort({ createdAt: -1 })
            .limit(100) // Increased limit since it might be filtered
            .select('userName comment rating category createdAt improvementAreas successAreas userEntity userImpactLevel')
            .lean();

        // 4. Metadata for Filters (Unique Entities and Levels across the actual collections)
        const allEntitiesRaw = await Entity.find({}).select('name').lean();
        const entities = allEntitiesRaw.map(e => e.name).sort();

        let levels = [];
        if (entity && entity !== 'all') {
            const entityDoc = await Entity.findOne({ name: entity }).lean();
            if (entityDoc) {
                const levelsRaw = await ImpactLevel.find({ entity: entityDoc._id }).select('name').lean();
                levels = levelsRaw.map(l => l.name).sort();
            }
        }

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
                })),
                filters: {
                    entities,
                    levels
                }
            }
        });
    } catch (err) {
        console.error('getFeedbackAnalysis error:', err);
        res.status(500).json({ message: err.message });
    }
};

export const exportFeedbackAnalysis = async (req, res) => {
    try {
        const { entity, level, search } = req.query;

        // Build filters
        const filter = {};
        if (entity && entity !== 'all') filter.userEntity = entity;
        if (level && level !== 'all') filter.userImpactLevel = level;
        if (search) {
            filter.userName = { $regex: search, $options: 'i' };
        }

        const feedbacks = await UserFeedback.find(filter).sort({ createdAt: -1 }).lean();

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
