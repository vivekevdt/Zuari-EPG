import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all user Q&A pairs (user message + immediately following AI message)
// @route   GET /api/super-admin/interactions
// @access  Private/SuperAdmin
const getInteractionsAdmin = async (req, res, next) => {
    try {
        const { search, entity, impactLevel, empCategory, page = 1, limit = 50 } = req.query;

        // Build user filter
        const userFilter = { roles: { $in: ['employee'] } };
        if (entity) userFilter.entity = entity;
        if (impactLevel) userFilter.level = impactLevel;
        if (empCategory) userFilter.empCategory = empCategory;

        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get matching users
        const users = await User.find(userFilter)
            .populate('entity', 'name')
            .populate('level', 'name')
            .populate('empCategory', 'name')
            .select('name email entity level empCategory entity_code')
            .lean();

        const userIds = users.map(u => u._id);
        const userMap = {};
        users.forEach(u => { userMap[u._id.toString()] = u; });

        // Get all user-role messages for these users
        const userMessages = await Message.find({ userId: { $in: userIds }, role: 'user' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Message.countDocuments({ userId: { $in: userIds }, role: 'user' });

        // For each user message, find the next AI message in the same conversation
        const results = await Promise.all(
            userMessages.map(async (msg) => {
                const aiMsg = await Message.findOne({
                    conversationId: msg.conversationId,
                    role: 'ai',
                    createdAt: { $gt: msg.createdAt }
                }).sort({ createdAt: 1 }).lean();

                const user = userMap[msg.userId.toString()];
                return {
                    _id: msg._id,
                    userQuestion: msg.content,
                    aiResponse: aiMsg?.content || null,
                    userName: user?.name || 'Unknown',
                    userMail: user?.email || '',
                    userEntity: user?.entity?.name || user?.entity_code || '',
                    userImpactLevel: user?.level?.name || '',
                    userCategory: user?.empCategory?.name || '',
                    createdAt: msg.createdAt,
                };
            })
        );

        // Get distinct entity/level/category for filter options
        const allUsers = await User.find({ roles: { $in: ['employee'] } })
            .populate('entity', 'name')
            .populate('level', 'name')
            .populate('empCategory', 'name')
            .select('entity level empCategory entity_code')
            .lean();

        const filterOptions = {
            entities: [...new Set(allUsers.map(u => u.entity?.name || u.entity_code).filter(Boolean))],
            impactLevels: [...new Set(allUsers.map(u => u.level?.name).filter(Boolean))],
            categories: [...new Set(allUsers.map(u => u.empCategory?.name).filter(Boolean))],
        };

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: results,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            filterOptions
        });
    } catch (error) {
        next(error);
    }
};

export { getInteractionsAdmin };
