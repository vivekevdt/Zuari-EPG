import express from 'express';
import { getVectorDbData, optimizeVectorDb } from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure user is superAdmin
const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superAdmin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as super admin');
    }
};

// Vector DB Visualization
router.get('/vector-db', protect, superAdmin, getVectorDbData);
router.post('/vector-db/optimize', protect, superAdmin, optimizeVectorDb);

export default router;
