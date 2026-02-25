import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import emailService from './emailService.js';


const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            entity: user.entity,
            is_account_activated: user.is_account_activated,
            token: generateToken(user._id, user.name, user.email),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const registerUser = async (name, email, password, roles, entity, level, status, entity_code, empCategory, skipIfExists = false) => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        if (skipIfExists) return userExists;
        throw new Error('User already exists');
    }

    // Generate random password if not provided
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const cleaningStatus = status ? status.toLowerCase() : "active";

    // Normalize roles: accept string or array, default to ['employee']
    let normalizedRoles = ['employee'];
    if (roles) {
        if (Array.isArray(roles)) {
            normalizedRoles = roles;
        } else if (typeof roles === 'string') {
            // Handle legacy single role string
            const roleMap = { 'user': 'employee' };
            normalizedRoles = [roleMap[roles] || roles];
        }
    }

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        roles: normalizedRoles,
        entity: entity || null,
        level: level || null,
        status: cleaningStatus,
        entity_code: entity_code || '',
        empCategory: empCategory || null,
        is_account_activated: false // Force activation/reset on first login
    });

    if (user) {
        // Send welcome email with original/temp password
        await emailService.sendWelcomeEmail(user, tempPassword);

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id, user.name, user.email),
            roles: user.roles,
            entity: user.entity,
            level: user.level,
            status: user.status,
            entity_code: user.entity_code,
            is_account_activated: false
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const activateUserAccount = async (email, currentPassword, newPassword) => {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.is_account_activated = true;

        const updatedUser = await user.save();

        return {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            roles: updatedUser.roles,
            entity: updatedUser.entity,
            is_account_activated: true,
            token: generateToken(updatedUser._id, updatedUser.name, updatedUser.email),
        };
    } else {
        throw new Error('Invalid current password');
    }
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    user.password = hashedPassword;
    user.is_account_activated = false; // Require reset on next login
    await user.save();

    await emailService.sendPasswordResetEmail(user, tempPassword);

    return { message: 'Password reset email sent' };
};

export default {
    loginUser,
    registerUser,
    activateUserAccount,
    forgotPassword
};
