import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const getConversations = async (userId) => {
    return await Conversation.find({ userId }).sort({ updatedAt: -1 });
};

const getConversation = async (conversationId) => {
    return await Conversation.findById(conversationId);
};

const getMessages = async (conversationId) => {
    return await Message.find({ conversationId }).sort({ createdAt: 1 });
};

const getRecentMessages = async (conversationId, limit = 10) => {
    return await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

const createNewConversation = async (userId, title = 'New Conversation') => {
    return await Conversation.create({
        userId,
        title,
    });
};

const saveMessage = async (conversationId, userId, role, content) => {
    return await Message.create({
        conversationId,
        userId,
        role,
        content,
    });
};

const deleteConversation = async (conversationId) => {
    await Message.deleteMany({ conversationId });
    return await Conversation.findByIdAndDelete(conversationId);
};

const updateLastMessage = async (conversationId, content) => {
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
        conversation.lastMessage = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        await conversation.save();
    }
    return conversation;
};

export default {
    getConversations,
    getConversation,
    getMessages,
    getRecentMessages,
    createNewConversation,
    saveMessage,
    updateLastMessage,
    deleteConversation,
};
