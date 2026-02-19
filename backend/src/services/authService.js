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
            role: user.role,
            entity: user.entity,
            is_account_activated: user.is_account_activated,
            token: generateToken(user._id, user.name, user.email),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const registerUser = async (name, email, password, role, entity, level, status, entity_code) => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error('User already exists');
    }

    // Generate random password if not provided
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const cleaningStatus = status ? status.toLowerCase() : "active";

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        entity,
        level,
        status: cleaningStatus,
        entity_code,
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
            role: user.role,
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
            role: updatedUser.role,
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
