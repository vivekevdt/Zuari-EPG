import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

// @desc    Submit feedback for an AI response
// @route   POST /api/chat/feedback
// @access  Private
const submitFeedback = async (req, res, next) => {
    try {
        const { userQuestion, aiResponse, thumbs, description } = req.body;

        if (!userQuestion || !aiResponse || !thumbs) {
            res.status(400);
            throw new Error('userQuestion, aiResponse and thumbs are required');
        }

        // Populate entity, level, empCategory for readable names
        const populatedUser = await User.findById(req.user._id)
            .populate('entity', 'name')
            .populate('level', 'name')
            .populate('empCategory', 'name');

        const feedback = await Feedback.create({
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

// @desc    Get all feedbacks (admin)
// @route   GET /api/admin/feedbacks
// @access  Private/Admin
const getFeedbacks = async (req, res, next) => {
    try {
        const { thumbs, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (thumbs) filter.thumbs = thumbs;

        const feedbacks = await Feedback.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Feedback.countDocuments(filter);

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

export { submitFeedback, getFeedbacks };
