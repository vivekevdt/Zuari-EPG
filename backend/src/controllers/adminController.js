import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Entity from '../models/Entity.js';
import Policy from '../models/Policy.js';
import Log from '../models/Log.js';
// We will need a service to handle chunking logic, but for now we can simulate or create a placeholder
import { processPolicyFile, publishPolicy as publishPolicyService, deleteChunks } from '../services/chunkService.js';


// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
    try {
        const totalEmployees = await User.countDocuments({ role: 'user' });
        const totalEntities = await Entity.countDocuments();
        const totalInteractions = await Conversation.countDocuments();
        const activePolicies = await Policy.countDocuments({ status: 'live' });
        const totalPolicies = await Policy.countDocuments();

        // Get recent activity (e.g. last 5 conversations)
        const recentActivity = await Conversation.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('userId', 'name email entity');

        // Get interaction analysis (messages per user - simple aggregation)
        // This is a placeholder for more complex analysis, currently just returning counts

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                totalEntities,
                totalInteractions,
                activePolicies,
                totalPolicies,
                recentActivity
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all non-admin users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }

};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await User.findByIdAndDelete(req.params.id);

            // Log User Deletion
            await Log.create({
                logDescription: `User Deleted: ${user.name}`,
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role,
                entity: req.user.entity
            });

            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.entity = req.body.entity || user.entity;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Log Update
            await Log.create({
                logDescription: `User Updated: ${updatedUser.name}`,
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role,
                entity: req.user.entity
            });

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                entity: updatedUser.entity,
                role: updatedUser.role,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};


// @desc    Get all conversations/interactions
// @route   GET /api/admin/interactions
// @access  Private/Admin
const getInteractions = async (req, res, next) => {
    try {
        const { entity, name, startDate, endDate } = req.query;

        let userQuery = {};
        let hasUserFilters = false;

        if (entity && entity !== 'All Entities') {
            userQuery.entity = entity;
            hasUserFilters = true;
        }
        if (name) {
            userQuery.name = { $regex: name, $options: 'i' };
            hasUserFilters = true;
        }

        let conversationQuery = {};

        // If filtering by user attributes
        if (hasUserFilters) {
            const users = await User.find(userQuery).select('_id');

            // If no users match criteria, return empty interactions immediately
            if (users.length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }
            const userIds = users.map(user => user._id);
            conversationQuery.userId = { $in: userIds };
        }

        // Date filtering
        if (startDate || endDate) {
            conversationQuery.updatedAt = {};
            if (startDate) {
                conversationQuery.updatedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                conversationQuery.updatedAt.$lte = end;
            }
        }

        const interactions = await Conversation.find(conversationQuery)
            .populate('userId', 'name email entity')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: interactions
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all entities
// @route   GET /api/admin/entities
// @access  Private/Admin
const getEntities = async (req, res, next) => {
    try {
        const entities = await Entity.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            data: entities
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new entity
// @route   POST /api/admin/entities
// @access  Private/Admin
const createEntity = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Entity name is required');
        }

        const existingEntity = await Entity.findOne({ name });
        if (existingEntity) {
            res.status(400);
            throw new Error('Entity already exists');
        }

        const entity = await Entity.create({ name });

        // Log Entity Creation
        await Log.create({
            logDescription: `Entity Created: ${name}`,
            userId: req.user._id,
            name: req.user.name,
            role: req.user.role,
            entity: req.user.entity
        });

        res.status(201).json({
            success: true,
            data: entity
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an entity
// @route   DELETE /api/admin/entities/:id
// @access  Private/Admin
const deleteEntity = async (req, res, next) => {
    try {
        const entityToDelete = await Entity.findById(req.params.id);


        if (entityToDelete) {
            await Entity.findByIdAndDelete(req.params.id);

            // Log Entity Deletion
            await Log.create({
                logDescription: `Entity Deleted: ${entityToDelete.name}`,
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role,
                entity: req.user.entity
            });

            res.status(200).json({
                success: true,
                message: 'Entity deleted successfully'
            });
        } else {
            res.status(404);
            throw new Error('Entity not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update an entity
// @route   PUT /api/admin/entities/:id
// @access  Private/Admin
const updateEntity = async (req, res, next) => {
    try {
        const entity = await Entity.findById(req.params.id);

        if (entity) {
            entity.name = req.body.name || entity.name;

            const updatedEntity = await entity.save();

            // Log Update
            await Log.create({
                logDescription: `Entity Updated: ${updatedEntity.name}`,
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role,
                entity: req.user.entity
            });

            res.json(updatedEntity);
        } else {
            res.status(404);
            throw new Error('Entity not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all policies
// @route   GET /api/admin/policies
// @access  Private/Admin
const getPolicies = async (req, res, next) => {
    try {
        const policies = await Policy.find().sort({ uploadDate: -1 });
        res.status(200).json({
            success: true,
            data: policies
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload a new policy document
// @route   POST /api/admin/upload-policy
// @access  Private/Admin
const uploadPolicy = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        const { title, entity, category, expiryDate } = req.body;

        if (!title || !entity) {
            res.status(400);
            throw new Error('Title and Entity are required');
        }

        const policy = await Policy.create({
            title,
            filename: req.file.filename,
            entity,
            category: category || 'General',
            expiryDate: expiryDate || null,
            status: 'draft' // Default status changed to draft to match UI
        });

        res.status(201).json({
            success: true,
            data: policy,
            message: 'Policy uploaded successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create chunks for a policy
// @route   POST /api/admin/policies/:id/chunk
// @access  Private/Admin
const createChunks = async (req, res, next) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            res.status(404);
            throw new Error('Policy not found');
        }

        // Logic to process file and create chunks
        // This processPolicyFile function needs to be implemented in chunkService.js
        // It should read the file, split it into chunks, and store them in the Policy model
        await processPolicyFile(policy);

        // Refetch policy to ensure we have the latest state (chunks added) and update status
        const updatedPolicy = await Policy.findById(req.params.id);
        updatedPolicy.ischunked = true;
        await updatedPolicy.save();

        await Log.create({
            logDescription: `Policy Chunked: ${policy.title}`,
            userId: req.user._id,
            name: req.user.name,
            role: req.user.role,
            entity: req.user.entity
        });

        res.status(200).json({
            success: true,
            message: 'Policy process (chunk creation) completed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Publish a policy
// @route   POST /api/admin/policies/:id/publish
// @access  Private/Admin
const publishPolicy = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Call the service to publish (embed and store in vector db)
        await publishPolicyService(id);

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: 'Policy published successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a policy
// @route   DELETE /api/admin/policies/:id
// @access  Private/Admin
const deletePolicy = async (req, res, next) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (policy) {
            // Delete chunks from vector DB
            await deleteChunks(policy.title, policy.entity);

            // Delete policy from MongoDB
            await Policy.findByIdAndDelete(req.params.id);

            await Log.create({
                logDescription: `Policy Deleted: ${policy.title}`,
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role,
                entity: req.user.entity
            });

            res.status(200).json({
                success: true,
                message: 'Policy and associated chunks deleted successfully'
            });
        } else {
            res.status(404);
            throw new Error('Policy not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update a policy
// @route   PUT /api/admin/policies/:id
// @access  Private/Admin
const updatePolicy = async (req, res, next) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            res.status(404);
            throw new Error('Policy not found');
        }

        // Capture original values before update
        const oldTitle = policy.title;
        const oldEntity = policy.entity;
        const currentVersion = policy.version || '1.0';

        const { title, entity, category, expiryDate, changeNote } = req.body;

        // Create version history entry
        const historyEntry = {
            version: currentVersion,
            updatedAt: new Date(),
            changedBy: req.user.name || 'Admin', // Assuming req.user is populated by auth middleware
            changeNote: changeNote || (req.file ? 'Updated document file' : 'Updated metadata'),
            filename: policy.filename
        };

        // Push to history
        if (!policy.versions) policy.versions = [];
        policy.versions.push(historyEntry);

        // Calculate next version
        const versionParts = currentVersion.split('.').map(Number);
        if (versionParts.length === 2) {
            versionParts[1]++; // Increment minor version
            policy.version = versionParts.join('.');
        } else {
            policy.version = (parseFloat(currentVersion) + 0.1).toFixed(1); // Fallback
        }


        if (title) policy.title = title;
        if (entity) policy.entity = entity;
        if (category) policy.category = category;
        // Handle date properly, allowing clearing it if sent as null/empty
        if (expiryDate !== undefined) policy.expiryDate = expiryDate;

        // If title or entity changed, delete old chunks from vector DB
        if ((title && title !== oldTitle) || (entity && entity !== oldEntity)) {
            await deleteChunks(oldTitle, oldEntity);
            // If policy was live, we should reset status because vector data is now gone/stale
            if (policy.status === 'live') {
                policy.status = 'chunked'; // Ready to publish again with new metadata
            }
        }

        if (req.file) {
            // If file changed, we MUST wipe vectors because content is new.
            await deleteChunks(oldTitle, oldEntity);

            policy.filename = req.file.filename;
            // If file is updated, reset chunked status as content changed
            policy.ischunked = false;
            policy.chunks = []; // Clear existing chunks
            policy.status = 'draft'; // Reset to draft on file change as shown in requirements usually
        }

        const updatedPolicy = await policy.save();

        await Log.create({
            logDescription: `Policy Updated: ${updatedPolicy.title} to v${updatedPolicy.version}`,
            userId: req.user._id,
            name: req.user.name,
            role: req.user.role,
            entity: req.user.entity
        });

        res.status(200).json({
            success: true,
            data: updatedPolicy,
            message: 'Policy updated successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get system logs with filters
// @route   GET /api/admin/logs
// @access  Private/Admin
const getLogs = async (req, res, next) => {
    try {
        const { employeeName, startDate, endDate, entity } = req.query;

        let query = {};

        if (employeeName) {
            query.name = { $regex: employeeName, $options: 'i' };
        }

        if (entity && entity !== 'All Entities') {
            query.entity = entity;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Set end date to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const logs = await Log.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        next(error);
    }
};

export {
    getDashboardStats,
    getUsers,
    updateUser,
    deleteUser,
    getInteractions,
    getEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    getPolicies,
    uploadPolicy,
    getLogs,
    createChunks,
    deletePolicy,
    updatePolicy,
    publishPolicy
};
