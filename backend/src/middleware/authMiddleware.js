import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, config.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
            return;
        } catch (error) {
            console.error(error);
            res.status(401);
            next(new Error('Not authorized, token failed'));
            return;
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

export { protect };
