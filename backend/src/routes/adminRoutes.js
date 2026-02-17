import express from 'express';
import multer from 'multer';
import path from 'path';
import {
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
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

// Admin middleware to ensure user is admin
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/policies/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Policies Only (PDF, DOC, DOCX)!');
        }
    }
});

const router = express.Router();

// Dashboard Stats
router.get('/dashboard-stats', protect, admin, getDashboardStats);

// User Management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

// Interaction Monitoring
router.get('/interactions', protect, admin, getInteractions);

// Entity Management
router.route('/entities')
    .get(protect, admin, getEntities)
    .post(protect, admin, createEntity);

router.put('/entities/:id', protect, admin, updateEntity);
router.delete('/entities/:id', protect, admin, deleteEntity);

// Policy Management
router.get('/policies', protect, admin, getPolicies);
router.post('/upload-policy', protect, admin, upload.single('policyDocument'), uploadPolicy);
router.put('/policies/:id', protect, admin, upload.single('policyDocument'), updatePolicy);
router.post('/policies/:id/chunk', protect, admin, createChunks);
router.post('/policies/:id/publish', protect, admin, publishPolicy);
router.delete('/policies/:id', protect, admin, deletePolicy);

// Logs
router.get('/logs', protect, admin, getLogs);

export default router;
