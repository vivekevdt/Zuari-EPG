import express from 'express';
import {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    deleteConversation,
    getAvailablePolicies,
    getDynamicFAQs
} from '../controllers/chatController.js';
import { submitFeedback, submitGeneralFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/conversation', protect, createConversation);
router.get('/conversations', protect, getConversations);
router.get('/policies', protect, getAvailablePolicies);
router.post('/faqs', protect, getDynamicFAQs);
router.post('/message', protect, sendMessage);
router.post('/feedback', protect, submitFeedback);
router.post('/user-feedback', protect, submitGeneralFeedback);
router.get('/:id', protect, getMessages);
router.delete('/:id', protect, deleteConversation);

export default router;
