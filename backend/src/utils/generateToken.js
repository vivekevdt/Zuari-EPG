import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const generateToken = (id, name, email) => {
    return jwt.sign({ id, name, email }, config.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;
