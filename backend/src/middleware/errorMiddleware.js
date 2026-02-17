const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Check if it's a known Mongoose validation error
    if (err.name === 'ValidationError') {
        res.status(400);
        return res.json({
            statusCode: 400,
            success: false,
            message: Object.values(err.errors).map(val => val.message).join(', '),
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    }

    // Check for Mongoose duplicate key error
    if (err.code === 11000) {
        res.status(400);
        return res.json({
            statusCode: 400,
            success: false,
            message: 'Duplicate field value entered',
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    }

    res.status(statusCode);
    res.json({
        statusCode: statusCode,
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };
