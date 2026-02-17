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
        const { name, email, password, role, entity } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please provide all fields');
        }

        const userData = await authService.registerUser(name, email, password, role, entity);

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

export {
    authUser,
    registerUser,
    logoutUser
};
