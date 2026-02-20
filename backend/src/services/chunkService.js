import Policy from '../models/Policy.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import generateChunks from '../utils/generateChunks.js';
import { loadPDF, loadDOCX } from '../utils/textLoaders.js';
import { table } from '../db/lancedb.js';
import embed from '../utils/embeddings.js';

// Read content from PDF or DOCX files
const readFileContent = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf') {
            return await loadPDF(filePath);
        } else if (ext === '.docx') {
            return await loadDOCX(filePath);
        } else {
            // Fallback for other text files
            return fs.readFileSync(filePath, 'utf8');
        }
    } catch (error) {
        console.error(`Error extraction text from ${filePath}:`, error);
        throw new Error(`Failed to extract text from file: ${error.message}`);
    }
};

export const processPolicyFile = async (policy) => {
    try {
        // Use path.resolve to handle relative paths correctly if needed, matching upload logic
        const filePath = path.resolve('uploads/policies', policy.filename);

        let textContent = '';
        if (fs.existsSync(filePath)) {
            textContent = await readFileContent(filePath);
        } else {
            console.warn(`File not found at ${filePath}, using placeholder text.`);
            textContent = `Policy content for ${policy.title} (File missing)`;
        }

        const chunks = await generateChunks(textContent);

        // This processPolicyFile logic seems a bit redundant with storeChunks logic regarding chunk creation
        // But let's assume storeChunks handles the db operations
        await storeChunks(policy._id, chunks);

        return true;
    } catch (error) {
        console.error("Error processing policy file:", error);
        throw error;
    }
};

// Function to store chunks for a policy
// We will assume that 'chunks' is an array of strings (the text content of each chunk)
export const storeChunks = async (policyId, chunks) => {
    try {
        const policy = await Policy.findById(policyId);
        if (!policy) {
            throw new Error('Policy not found');
        }

        // Prepare chunk objects
        // generateChunks returns { heading, content }
        const chunkObjects = chunks.map((chunk, index) => ({
            header: chunk.heading || `Section ${index + 1}`,
            content: chunk.content
        }));

        // Update policy with chunks
        policy.chunks = chunkObjects;
        // ischunked is already true or set by controller, but we can set it here too if needed
        // policy.ischunked = true; 

        await policy.save();

        return true;
    } catch (error) {
        console.error("Error storing chunks:", error);
        throw error;
    }
};

// Function to get chunks for a policy (used when publishing)
export const getChunksByPolicyId = async (policyId) => {
    try {
        // Since chunks are now part of Policy, we just need to fetch the policy
        const policy = await Policy.findById(policyId);
        if (!policy) {
            console.warn(`Policy with id ${policyId} not found when fetching chunks`);
            return [];
        }
        return policy.chunks || [];
    } catch (error) {
        console.error("Error fetching chunks:", error);
        throw error;
    }
};

export const publishPolicy = async (policyId) => {
    try {
        const policy = await Policy.findById(policyId);
        if (!policy) throw new Error("Policy not found");

        if (!policy.chunks || policy.chunks.length === 0) {
            throw new Error("Policy has no chunks. Please create chunks first.");
        }

        const texts = policy.chunks.map(c => c.content);
        const vectors = await embed(texts);

        const rows = policy.chunks.map((chunk, i) => ({
            id: `${policy._id}_${i}`,
            vector: vectors[i],
            content: chunk.content,
            heading: chunk.header,
            policy: policy.title,
            entity: "Zuari Industries Ltd"
        }));




        // Delete existing chunks for this policy before adding new ones to avoid duplicates
        await deleteChunks(policy.title, policy.entity);

        await table.add(rows);

        policy.status = 'live';
        await policy.save();

        return { success: true, message: 'Policy published successfully' };
    } catch (error) {
        console.error("Error publishing policy:", error);
        // Update status to failed
        await Policy.findByIdAndUpdate(policyId, { status: 'failed-please retry' });
        throw error;
    }
};

export const deleteChunks = async (policyTitle, entity) => {
    try {
        if (!policyTitle || !entity) {
            console.warn("deleteChunks called with missing title or entity", { policyTitle, entity });
            return;
        }

        // storage of strings in lancedb might need escaping if they contain single quotes
        const safeTitle = policyTitle.replace(/'/g, "\\'");
        const safeEntity = entity.replace(/'/g, "\\'");

        // Delete where policy AND entity match
        await table.delete(`policy = '${safeTitle}' AND entity = '${safeEntity}'`);
        return true;
    } catch (error) {
        console.error(`Error deleting chunks for policy ${policyTitle}:`, error);
        throw error;
    }
};
