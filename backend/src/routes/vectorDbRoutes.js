
import express from 'express';
import { table } from '../db/lancedb.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getDirSize = (dirPath) => {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                size += stats.size;
            }
        }
    } catch (e) {
        return 0;
    }
    return size;
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// @desc    Get all data from vector DB with optional filters
// @route   GET /api/vDB-visualize
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        // Prevent caching
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

        const results = await table.query().limit(1000).toArray();
        // remove vector data to save bandwidth, it's not visualizeable anyway
        const minimized = results.map(({ vector, ...rest }) => rest);

        const dbPath = path.join(__dirname, '../../policy_db');
        let dbSize = 'Unknown';
        try {
            if (fs.existsSync(dbPath)) {
                const sizeInBytes = getDirSize(dbPath);
                dbSize = formatBytes(sizeInBytes);
            }
        } catch (err) {
            console.error("Error calculating DB size:", err);
        }

        res.status(200).json({
            success: true,
            count: minimized.length,
            dbSize,
            data: minimized
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Optimize Vector DB (Compact & Cleanup)
// @route   POST /api/vDB-visualize/optimize
// @access  Public (for now)
router.post('/optimize', async (req, res, next) => {
    try {
        const { optimizeVectorDb } = await import('../services/chunkService.js');
        const result = await optimizeVectorDb();

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
