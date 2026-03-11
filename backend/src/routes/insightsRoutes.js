import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAdoption,
    getThematicClusters,
    getEntities,
    getFeedbackAnalysis,
    exportFeedbackAnalysis
} from '../controllers/insightsController.js';

const router = express.Router();

// RBAC: admin or superAdmin only
const adminOnly = (req, res, next) => {
    if (req.user && (req.user.roles?.includes('admin') || req.user.roles?.includes('superAdmin'))) {
        return next();
    }
    res.status(403).json({ message: 'Not authorized' });
};

router.get('/entities', protect, adminOnly, getEntities);
router.get('/adoption', protect, adminOnly, getAdoption);
router.get('/thematic-clusters', protect, adminOnly, getThematicClusters);
router.get('/feedback-analysis', protect, adminOnly, getFeedbackAnalysis);
router.get('/feedback-analysis/export', protect, adminOnly, exportFeedbackAnalysis);

export default router;
