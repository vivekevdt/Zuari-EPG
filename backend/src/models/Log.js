import mongoose from 'mongoose';

const logSchema = mongoose.Schema({
    logDescription: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for efficient date range filtering
    }
}, {
    timestamps: true
});

const Log = mongoose.model('Log', logSchema);

export default Log;
