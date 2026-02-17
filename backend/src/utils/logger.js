
import Log from '../models/Log.js';

export const createLog = async (userId, name, role, entity, description) => {
    try {
        await Log.create({
            userId,
            name,
            role,
            entity,
            logDescription: description
        });
    } catch (error) {
        console.error("Failed to create log:", error);
        // Don't throw error to prevent interrupting the main flow
    }
};
