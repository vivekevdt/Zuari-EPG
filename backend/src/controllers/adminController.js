import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Entity from '../models/Entity.js';
import Policy from '../models/Policy.js';
import Log from '../models/Log.js';
// We will need a service to handle chunking logic, but for now we can simulate or create a placeholder
import { processPolicyFile, publishPolicy as publishPolicyService, deleteChunks } from '../services/chunkService.js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authService from '../services/authService.js';


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

        const { title, entity } = req.body;

        if (!title || !entity) {
            res.status(400);
            throw new Error('Title and Entity are required');
        }

        const policy = await Policy.create({
            title,
            filename: req.file.filename,
            entity,
            status: 'pending' // Default status, AI processing logic would update this later
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

        const { title, entity } = req.body;

        if (title) policy.title = title;
        if (entity) policy.entity = entity;

        // If title or entity changed, delete old chunks from vector DB
        if ((title && title !== oldTitle) || (entity && entity !== oldEntity)) {
            await deleteChunks(oldTitle, oldEntity);
            // If policy was live, we should reset status because vector data is now gone/stale
            if (policy.status === 'live') {
                policy.status = 'chunked'; // Ready to publish again with new metadata
            }
        }

        if (req.file) {
            // If file is updated, delete old chunks (based on old metadata - caught above or here if unchanged)
            // But wait, if title/entity didn't change, we still want to remove old vectors as content changed!
            // So let's delete chunks regardless if file changed OR metadata changed, to be safe.
            // If we deleted above due to metadata change, this is redundant but harmless (delete is idempotent usually or handles not found).
            // Actually, let's just do it once if ANY chance of inconsistency.
            // Simplest logic: If update hits, wipe vectors. 

            // If file changed, we MUST wipe vectors because content is new.
            await deleteChunks(oldTitle, oldEntity);

            policy.filename = req.file.filename;
            // If file is updated, reset chunked status as content changed
            policy.ischunked = false;
            policy.chunks = []; // Clear existing chunks
            policy.status = 'pending';
        } else if ((title && title !== oldTitle) || (entity && entity !== oldEntity)) {
            // If only metadata changed, we already deleted chunks above.
            // Status set to 'chunked' so user can republish with new metadata.
        }

        // Clean up logic:
        // 1. If File Changed: 
        //      Delete Old Chunks (LanceDB)
        //      Clear Chunks (Mongo)
        //      Status = Pending
        // 2. If Metadata Changed (but no file):
        //      Delete Old Chunks (LanceDB)
        //      Status = Chunked (vectors gone, but Mongo chunks preserved so just need republish)


        const updatedPolicy = await policy.save();

        await Log.create({
            logDescription: `Policy Updated: ${updatedPolicy.title}`,
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
}


// @desc    Download employee CSV template
// @route   GET /api/admin/download-template
// @access  Private/Admin
const downloadEmployeeTemplate = async (req, res, next) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const file = path.join(__dirname, '../../uploads/csv_template/template.xlsx');
        res.download(file);
    } catch (error) {
        next(error);
    }
};

// @desc    Upload employees via CSV
// @route   POST /api/admin/upload-employees
// @access  Private/Admin
const uploadEmployees = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            return next(new Error('Please upload a file'));
        }

        // Use XLSX to read the file (supports both .xlsx and .csv)
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        // format uses headers from first row
        const results = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Clean up file immediately after reading
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) {
            console.error("Error deleting temp file", e);
        }

        if (results.length === 0) {
            res.status(200).json({
                success: true,
                message: "No records found in the file",
                errors: ["File appears to be empty or effectively empty"]
            });
            return;
        }

        for (const row of results) {
            try {
                // Normalize keys to lower case to handle "Full Name" vs "full_name" vs "Name"
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toLowerCase().replace(/ /g, '_')] = row[key];
                });

                // Map columns to User model fields
                // Possible variations based on common template usage
                const name = normalizedRow.full_name || normalizedRow.name || normalizedRow.employee_name;
                const email = normalizedRow.email || normalizedRow.email_address;
                const role = (normalizedRow.role || 'user').toLowerCase();
                const entity = normalizedRow.entity_name || normalizedRow.entity || normalizedRow.company;
                const level = normalizedRow.employee_level || normalizedRow.level || normalizedRow.grade;
                const status = (normalizedRow.status || 'active').toLowerCase();
                const entity_code = normalizedRow.entity_code || normalizedRow.code;
                const password = normalizedRow.password || 'Welcome@1234';

                if (!email || !name || !entity) {
                    errorCount++;
                    // Only push error if it's not a completely empty row (xlsx sometimes reads empty bottom rows)
                    if (Object.keys(normalizedRow).length > 0) {
                        errors.push(`Missing required fields (Name, Email, Entity) for row: ${JSON.stringify(row)}`);
                    }
                    continue;
                }

                // calling authService to register (handles hashing and duplicates)
                await authService.registerUser(name, email, password, role, entity, level, status, entity_code);
                successCount++;

            } catch (err) {
                errorCount++;
                errors.push(`Error processing ${row.email || 'unknown row'}: ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${results.length} records. Created: ${successCount}. Failed: ${errorCount}`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        // Try to cleanup if error occurred before unlink
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
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
    downloadEmployeeTemplate,
    uploadEmployees,
    getPolicies,
    uploadPolicy,
    getLogs,
    createChunks,
    deletePolicy,
    updatePolicy,
    publishPolicy
};
