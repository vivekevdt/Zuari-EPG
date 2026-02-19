
import { getPlaygroundResponse } from '../../services/playground/playgroundService.js';

// Playground Chat Controller
// Does NOT use shared search or AI services.
// Does NOT store messages in database.
const handlePlaygroundChat = async (req, res, next) => {
    try {
        const { message, entity, policies } = req.body;

        if (!message) {
            res.status(400);
            throw new Error('Message is required');
        }

        // Validation: Entity and Policies are required
        if (!entity || !policies || policies.length === 0) {
            res.status(400);
            throw new Error('Please select both an Entity and at least one Policy to start the chat.');
        }

        console.log("Playground Chat Request:", { message, entity, policies });

        // 1. Generate Response
        // We pass the parameters directly to the standalone service
        const aiResponse = await getPlaygroundResponse(message, entity, policies);

        // 2. Respond
        res.status(200).json({
            success: true,
            data: {
                role: 'ai',
                content: aiResponse,
                entityContext: entity || 'None',
                policyContext: policies ? policies.join(", ") : 'All'
            },
            message: 'Playground AI Response Generated Successfully'
        });

    } catch (error) {
        console.error("Playground Controller Error:", error);
        next(error);
    }
};

export {
    handlePlaygroundChat
};
