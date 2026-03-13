import express from 'express';
import { microsoftLogin, loginUser, registerUser, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/microsoft-login', microsoftLogin);
router.post('/register', registerUser);
router.post('/logout', protect, logoutUser);

export default router;
