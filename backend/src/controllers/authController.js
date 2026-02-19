import authService from '../services/authService.js';
import { createLog } from '../utils/logger.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        const userData = await authService.loginUser(email, password);

        // Log Login Activity
        await createLog(userData._id, userData.name, userData.role, userData.entity, 'User Logged In');

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, entity, level, status, entity_code } = req.body;

        if (!name || !email) {
            res.status(400);
            throw new Error('Please provide name and email');
        }

        const userData = await authService.registerUser(name, email, password, role, entity, level, status, entity_code);

        // Log Registration
        await createLog(userData._id, userData.name, userData.role, userData.entity, 'User Registered');

        res.status(201).json({
            statusCode: 201,
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
    try {
        // Since JWT is stateless, we just log the event. 
        // In a real app with token blacklisting, we would blacklist the token here.
        if (req.user) {
            await createLog(req.user._id, req.user.name, req.user.role, req.user.entity, 'User Logged Out');
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Activate User Account (Change First Time Password)
// @route   POST /api/auth/activate-account
// @access  Public
const activateAccount = async (req, res, next) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            res.status(400);
            throw new Error('Please provide all fields');
        }

        const userData = await authService.activateUserAccount(email, currentPassword, newPassword);

        // Log Activation
        await createLog(userData._id, userData.name, userData.role, userData.entity, 'Account Activated');

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400);
            throw new Error('Please provide email');
        }

        await authService.forgotPassword(email);

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        next(error);
    }
};

export {
    authUser,
    registerUser,
    logoutUser,
    activateAccount,
    forgotPassword
};
