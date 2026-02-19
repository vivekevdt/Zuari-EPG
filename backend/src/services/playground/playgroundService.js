
import { GoogleGenAI } from "@google/genai";
import * as lancedb from "@lancedb/lancedb";
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

// Initialize LanceDB table (New separate connection)
const dbPath = process.env.LANCEDB_PATH || path.join(__dirname, '..', '..', '..', 'policy_db');

const initTable = async () => {
    try {
        const db = await lancedb.connect(dbPath);
        return await db.openTable('policies');
    } catch (error) {
        console.error('Error connecting to LanceDB in Playground Service:', error);
        throw error;
    }
};

// Separate Embedding Logic (matching ingestion config)
const embed = async (texts) => {
    try {
        if (!Array.isArray(texts)) {
            throw new Error("Input to embed() must be an array of strings.");
        }

        const response = await genAI.models.embedContent({
            model: "gemini-embedding-001",
            contents: texts.map(t => ({ role: "user", parts: [{ text: t }] })),
            config: {
                outputDimensionality: 3072,
            }
        });

        const embeddings = response.embeddings.map(item => item.values);
        return embeddings;
    } catch (error) {
        console.error("Embedding Error in Playground Service:", error);
        throw new Error("Failed to generate embeddings.");
    }
};

// Prompt Template (Copied from aiService.js)
const SYSTEM_PROMPT_TEMPLATE = `
You are a helpful HR Policy Assistant for employees of the organization.

Your job is to answer employee questions clearly and accurately using the retrieved HR policy excerpts provided below.

========================
RETRIEVED POLICY EXCERPTS
========================

{POLICY_TEXT}

Guidelines:

- Use the retrieved policy excerpts as your primary source of information.
- If the answer is clearly stated in the excerpts, respond confidently.
- If the information is not available in the excerpts, say:

"<p>This is not covered in the current HR policy. Please contact HR.</p>"

- Do not invent policies or add external HR knowledge.
- Keep responses clear, professional, and easy to understand.
- When relevant, briefly reference the document name.

========================
Response Format
========================

You must respond in HTML format. Do not use markdown code blocks. Just return the raw HTML content.
Use semantic HTML tags like <p>, <ul>, <li>, <strong>, <em>, <h3>, etc. to structure your response.
Specifically, use <h3> for section headers (e.g. "Confirmed Holidays", "Optional Holidays").

Structure your response as follows:
<div class="policy-answer">
    <div class="answer-content">
        <p>...answer content...</p>
    </div>
    
    <div class="meta-info" style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 0.5rem; font-size: 0.9em; color: #666;">
        <p><strong>Applicability:</strong> employee category or scope if mentioned in the policy,</p>
        <p><strong>Source:</strong>document name and section if available</p>
    </div>

</div>
`;

export const getPlaygroundResponse = async (question, entityName, availablePolicies) => {
    try {
        if (!config.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const tbl = await initTable();

        // 1. Generate Embedding for the Question
        const [queryVector] = await embed([question]);

        // 2. Build Search Query
        let searchBuilder = tbl.search(queryVector);

        // 3. Apply Filters
        let conditions = [];

        // Filter by Entity
        if (entityName) {
            const safeEntity = entityName.replace(/\'/g, "\\\'");
            conditions.push(`entity = '${safeEntity}'`);
        }

        // Filter by Specific Policies
        if (availablePolicies && availablePolicies.length > 0) {
            const safePolicies = availablePolicies.map(p => `\'${p.replace(/\'/g, "\\\'")}\'`).join(", ");
            conditions.push(`policy IN (${safePolicies})`);
        }

        if (conditions.length > 0) {
            const whereClause = conditions.join(" AND ");
            console.log("Playground Search Filter:", whereClause);
            searchBuilder = searchBuilder.where(whereClause);
        }

        // 4. Execute Search
        const results = await searchBuilder
            .limit(5)
            .toArray();

        // 5. Construct Context for AI
        let policyText = "No relevant policies found.";
        if (results && results.length > 0) {
            policyText = results.map(r =>
                `--- DOCUMENT: ${r.policy} ---\n${r.content}\n--- END DOCUMENT ---\n`
            ).join("\n");
        }

        const systemContent = SYSTEM_PROMPT_TEMPLATE.replace("{POLICY_TEXT}", policyText);

        // 6. Generate Response with Gemini
        // We use single-turn generation here as per request (retains message history only for api call not retain it)
        // If the user wants history context in the API call, we would need to accept `history` array.
        // Assuming for now the frontend sends context or just the latest question. 
        // Based on "retains message history only for api call", I will treat this as stateles.

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: 'user',
                parts: [{ text: question }]
            }],
            config: {
                systemInstruction: systemContent,
                temperature: 0.1,
                maxOutputTokens: 8192,
            }
        });

        let text = "";
        if (typeof response.text === 'function') {
            text = response.text();
        } else if (response.text) {
            text = response.text;
        } else if (response.response && typeof response.response.text === 'function') {
            text = response.response.text();
        }

        return text;

    } catch (error) {
        console.error("Playground Service Error:", error);
        throw error;
    }
};
