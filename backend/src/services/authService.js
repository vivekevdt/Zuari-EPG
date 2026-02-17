import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role:user.role,
            entity:user.entity,
            token: generateToken(user._id, user.name, user.email),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const registerUser = async (name, email, password,role, entity) => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        entity
    });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id, user.name, user.email),
            role:user.role,
            entity:user.entity
        };
    } else {
        throw new Error('Invalid user data');
    }
};

export default {
    loginUser,
    registerUser,
};
