import { createLog } from '../utils/logger.js';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token (SuperAdmin Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide both email and password');
        }

        // Find user and explicitly select password field
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        // Verify it's a superadmin (or admin if allowed, sticking to superadmin as requested)
        if (!user.roles?.includes('superAdmin')) {
            res.status(403);
            throw new Error('This login portal is restricted to authorized Super Admins only.');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
             // Log the login event
             await createLog(
                user._id,
                user.name,
                user.roles?.join(', ') || 'superAdmin',
                user.entity,
                'SuperAdmin Logged In via Credentials'
            );

            res.status(200).json({
                statusCode: 200,
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    gender: user.gender,
                    roles: user.roles,
                    entity: user.entity,
                    is_account_activated: user.is_account_activated,
                    token: generateToken(user._id, user.name, user.email),
                },
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Microsoft SSO Login — verify idToken, look up user, return our JWT
// @route   POST /api/auth/microsoft-login
// @access  Public
const microsoftLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400);
            throw new Error('idToken is required');
        }

        const tenantId = process.env.MS_TENANT_ID?.trim();
        const clientId = process.env.MS_CLIENT_ID?.trim();

        if (!tenantId || !clientId) {
            throw new Error('MS_TENANT_ID and MS_CLIENT_ID must be set in backend .env');
        }

        // Fetch Microsoft's public signing keys via JWKS
        const JWKS = createRemoteJWKSet(
            new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`)
        );

        // Verify the idToken signature, issuer, and audience
        const { payload } = await jwtVerify(idToken, JWKS, {
            issuer: [
                `https://login.microsoftonline.com/${tenantId}/v2.0`,
                `https://sts.windows.net/${tenantId}/`,
            ],
            audience: clientId,
        });

        // Extract email from token claims
        const email = (payload.email || payload.preferred_username || '').toLowerCase().trim();

        if (!email) {
            res.status(401);
            throw new Error('Could not extract email from Microsoft token');
        }

        // Look up user in our database
        const user = await User.findOne({ email });

        if (!user) {
            res.status(403);
            throw new Error(
                `Your Microsoft account (${email}) is not registered in the system. ` +
                'Please contact your administrator.'
            );
        }

        // Log the SSO login event
        await createLog(
            user._id,
            user.name,
            user.roles?.join(', ') || 'employee',
            user.entity,
            'User Logged In via Microsoft SSO'
        );

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                roles: user.roles,
                entity: user.entity,
                is_account_activated: user.is_account_activated,
                token: generateToken(user._id, user.name, user.email),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user (admin/super-admin only)
// @route   POST /api/auth/register
// @access  Protected
import authService from '../services/authService.js';

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, roles, entity, level, status, entity_code, empCategory } = req.body;

        if (!name || !email) {
            res.status(400);
            throw new Error('Please provide name and email');
        }

        const userData = await authService.registerUser(name, email, password, roles, entity, level, status, entity_code, empCategory);

        await createLog(userData._id, userData.name, userData.roles?.join(', ') || 'employee', userData.entity, 'User Registered');

        res.status(201).json({
            statusCode: 201,
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user (logs the event)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
    try {
        if (req.user) {
            await createLog(req.user._id, req.user.name, req.user.roles?.join(', ') || 'employee', req.user.entity, 'User Logged Out');
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export { loginUser, microsoftLogin, registerUser, logoutUser };
