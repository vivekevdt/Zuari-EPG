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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const cleaningStatus = status ? status.toLowerCase() : "active";

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        entity,
        level,
        status: cleaningStatus,
        entity_code
    });

    if (user) {
        // Send welcome email with original password BEFORE returning response
        // Don't await if you don't want to block, but awaiting ensures delivery or logging error
        await emailService.sendWelcomeEmail(user, password);

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id, user.name, user.email),
            role: user.role,
            entity: user.entity,
            level: user.level,
            status: user.status,
            entity_code: user.entity_code
        };
    } else {
        throw new Error('Invalid user data');
    }
};

export default {
    loginUser,
    registerUser,
};
