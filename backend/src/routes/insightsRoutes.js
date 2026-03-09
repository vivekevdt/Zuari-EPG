import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAdoption,
    getThemes,
    getGaps,
    getGapQueue,
    flagGap,
    unflagGap,
    getDemand,
    getEntities
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
router.get('/themes', protect, adminOnly, getThemes);
router.get('/gaps', protect, adminOnly, getGaps);
router.get('/gaps/queue', protect, adminOnly, getGapQueue);
router.post('/gaps/:id/flag', protect, adminOnly, flagGap);
router.delete('/gaps/queue/:id', protect, adminOnly, unflagGap);
router.get('/demand', protect, adminOnly, getDemand);

export default router;
