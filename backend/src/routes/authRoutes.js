import express from 'express';
import { authUser, registerUser, logoutUser, activateAccount, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/activate-account', activateAccount);
router.post('/forgot-password', forgotPassword);
router.post('/logout', protect, logoutUser);
router.post('/register', registerUser);

export default router;
