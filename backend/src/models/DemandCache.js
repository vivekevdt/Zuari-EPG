import mongoose from 'mongoose';

const demandCacheSchema = new mongoose.Schema({
    entity: {
        type: String, // 'all' or entity name
        required: true
    },
    period: {
        type: String, // '30', '90', 'year'
        required: true
    },
    feedbackCount: {
        type: Number,
        required: true
    },
    clusters: {
        type: Array,
        required: true
    }
}, { timestamps: true });

// Index for fast lookups
demandCacheSchema.index({ entity: 1, period: 1, feedbackCount: 1 });

export default mongoose.model('DemandCache', demandCacheSchema);
