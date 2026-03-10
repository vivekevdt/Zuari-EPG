import QueryFeedback from '../models/QueryFeedback.js';
import UserFeedback from '../models/UserFeedback.js';
import User from '../models/User.js';

// @desc    Submit feedback for an AI response (Query-level)
// @route   POST /api/chat/feedback
// @access  Private
const submitFeedback = async (req, res, next) => {
    try {
        const { queryId, responseId, userQuestion, aiResponse, thumbs, description } = req.body;

        if (!queryId || !responseId || !userQuestion || !aiResponse || !thumbs) {
            res.status(400);
            throw new Error('queryId, responseId, userQuestion, aiResponse and thumbs are required');
        }

        // Populate entity, level, empCategory for readable names
        const populatedUser = await User.findById(req.user._id)
            .populate('entity', 'name')
            .populate('level', 'name')
            .populate('empCategory', 'name');

        const feedback = await QueryFeedback.create({
            queryId,
            responseId,
            userName: req.user.name,
            userMail: req.user.email,
            userEntity: populatedUser?.entity?.name || req.user.entity_code || '',
            userImpactLevel: populatedUser?.level?.name || '',
            userCategory: populatedUser?.empCategory?.name || '',
            userQuestion,
            aiResponse,
            thumbs,
            description: description || ''
        });

        res.status(201).json({
            statusCode: 201,
            success: true,
            data: feedback
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit general user feedback (Sentiment-level)
// @route   POST /api/chat/user-feedback
// @access  Private
const submitGeneralFeedback = async (req, res, next) => {
    try {
        const { rating, category, improvementAreas, successAreas, comment } = req.body;

        if (!rating) {
            res.status(400);
            throw new Error('rating is required');
        }

        const populatedUser = await User.findById(req.user._id)
            .populate('entity', 'name')
            .populate('level', 'name');

        const feedback = await UserFeedback.create({
            user: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            userEntity: populatedUser?.entity?.name || req.user.entity_code || '',
            userImpactLevel: populatedUser?.level?.name || '',
            rating,
            category: category || improvementAreas?.[0] || 'Other',
            improvementAreas: improvementAreas || [],
            successAreas: successAreas || [],
            comment: comment || ''
        });

        res.status(201).json({
            statusCode: 201,
            success: true,
            data: feedback
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all query feedbacks (admin)
const getQueryFeedbacks = async (req, res, next) => {
    try {
        const { thumbs, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (thumbs) filter.thumbs = thumbs;

        const feedbacks = await QueryFeedback.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await QueryFeedback.countDocuments(filter);

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: feedbacks,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all general user feedbacks (admin)
const getUserFeedbacks = async (req, res, next) => {
    try {
        const { category, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (category) filter.category = category;

        const feedbacks = await UserFeedback.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await UserFeedback.countDocuments(filter);

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: feedbacks,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

export { submitFeedback, submitGeneralFeedback, getQueryFeedbacks, getUserFeedbacks };

