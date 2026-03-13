import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import emailService from './emailService.js';

const registerUser = async (name, email, password, roles, entity, level, status, entity_code, empCategory, skipIfExists = false, gender = 'Male') => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        if (skipIfExists) return userExists;
        throw new Error('User already exists');
    }

    const cleaningStatus = status ? status.toLowerCase() : "active";

    // Normalize roles: accept string or array, default to ['employee']
    let normalizedRoles = ['employee'];
    if (roles) {
        if (Array.isArray(roles)) {
            normalizedRoles = roles;
        } else if (typeof roles === 'string') {
            const roleMap = { 'user': 'employee' };
            normalizedRoles = [roleMap[roles] || roles];
        }
    }

    const user = await User.create({
        name,
        email,
        roles: normalizedRoles,
        entity: entity || null,
        level: level || null,
        status: cleaningStatus,
        entity_code: entity_code || '',
        empCategory: empCategory || null,
        gender: gender,
        is_account_activated: true // SSO handles activation seamlessly
    });

    if (user) {
        // Send welcome email informing them to use SSO
        await emailService.sendWelcomeEmail(user);

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
            gender: user.gender,
            is_account_activated: true
        };
    } else {
        throw new Error('Invalid user data');
    }
};

export default {
    registerUser
};
