import express from 'express';
import { microsoftLogin, registerUser, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/microsoft-login', microsoftLogin);
router.post('/register', registerUser);
router.post('/logout', protect, logoutUser);

export default router;
