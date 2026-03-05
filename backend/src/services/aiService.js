import genAI from '../config/gemini.js';
import config from '../config/env.js';
import { searchPolicy } from './search.js';

const SYSTEM_PROMPT_TEMPLATE = `
You are a helpful HR Policy Assistant for employees of the organization.

Your job is to answer employee questions clearly and accurately using the retrieved HR policy excerpts provided below.

========================
USER PROFILE INFORMATION
========================

{USER_DATA}

========================
CURRENT SYSTEM TIME
========================

{CURRENT_TIME}

========================
RETRIEVED POLICY EXCERPTS
========================

{POLICY_TEXT}

Guidelines:

- Use the retrieved policy excerpts as your primary source of information.
- Use USER PROFILE INFORMATION for employee-specific questions.
- (e.g., level, department, location, employment type).

- Use the retrieved policy excerpts for HR policy-related questions.

- If the answer is clearly stated in USER PROFILE INFORMATION or policy excerpts, respond confidently.

- VERY IMPORTANT: Do NOT provide policy details, budgets, or rules that apply ONLY to a different Impact Level or Employee Category than the user's current profile, UNLESS the user has an "admin" or "superAdmin" role. 
  - If a user asks for information about a level, role, or category they do not belong to, and they are not an admin, respond with: "<p>This policy is not available for your employee profile. You are only authorized to view information relevant to your own level or role.</p>"

- If the information is completely missing from the excerpts and not related to another role, say:

"<p>This is not covered in the current HR policy, or the policy is not available for your employee profile. Please contact HR.</p>"

- Do not invent policies or add external HR knowledge.
- Keep responses clear, professional, and easy to understand.
- When relevant, briefly reference the document name.

========================
Response Format
========================
If a user asks a date time aware question, respond with the date time aware answer. 

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





const generateAIResponse = async (messages, user) => {
    try {
        if (!config.GEMINI_API_KEY) {
            return "Server Error: Gemini API Key not configured.";
        }

        // 1. Identify the latest user query
        const latestUserMessage = messages.find(msg => msg.role === 'user');
        const query = latestUserMessage ? latestUserMessage.content : "";

        // 2. Search for relevant policies using Vector DB
        let policyText = "No relevant policies found.";
        if (query) {
            try {
                const searchResults = await searchPolicy(query, user);
                if (searchResults && searchResults.length > 0) {

                    policyText = searchResults.map(r =>
                        `--- DOCUMENT: ${r.policy} ---\n${r.content}\n--- END DOCUMENT ---\n`
                    ).join("\n");

                } else {
                    console.log("No relevant policy chunks found.");
                }
            } catch (searchError) {
                console.error("Vector search failed:", searchError);
            }
        }

        const userDataString = JSON.stringify({
            roles: user.roles || ["employee"],
            entity: user.entity ? {
                name: user.entity.name,
                entityCode: user.entity.entityCode
            } : null,
            level: user.level ? {
                name: user.level.name
            } : null,
            empCategory: user.empCategory ? {
                name: user.empCategory.name,
                code: user.empCategory.code
            } : null
        }, null, 2);

        const systemContent = SYSTEM_PROMPT_TEMPLATE
            .replace("{POLICY_TEXT}", policyText)
            .replace("{USER_DATA}", userDataString)
            .replace("{CURRENT_TIME}", new Date().toLocaleString('en-IN', { timeZoneName: 'short' }));

        // 3. Prepare messages for Gemini
        // Convert to Gemini format: { role: 'user' | 'model', parts: [{ text: '...' }] }
        // Input `messages` is [newest, ..., oldest]
        // We need [oldest, ..., newest] for history

        const history = [...messages]
            .reverse()
            .filter(msg => msg.content) // safety check
            .map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        // The last message is the new user input, so we separate it from history for chat.sendMessage
        // Actually, startChat takes history and then we call sendMessage with the new 'user' message? 
        // Or if the last message is already in history, we might duplicate it?
        // Let's assume `messages` INCLUDES the latest user message.
        // `history` now contains everything. We should pop the last user message to send it effectively, 
        // OR we can just use `generateContent` if we concatenate everything, BUT `startChat` is better for multi-turn.

        // Let's split: History (all except last) + Last Message
        const lastMsg = history.pop(); // Remove last message to handle separately if needed, OR just combine all.
        // Actually, for generateContent, we pass the *entire* history including the last user message.
        if (lastMsg) {
            history.push(lastMsg);
        }

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history, // Pass the full conversation history
            config: {
                systemInstruction: systemContent, // System prompt goes here
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
        console.error("Gemini Error:", error);
        return "Sorry, I'm having trouble retrieving a response.";
    }
};

const generateDynamicFAQs = async (policyNames) => {
    try {
        if (!config.GEMINI_API_KEY) {
            return [];
        }

        const prompt = `
You are an HR Policy Assistant. Based on the following available HR policies for the employee:
[${policyNames.join(", ")}]

Generate exactly 4 distinct Frequently Asked Questions (FAQs) that the employee might ask regarding these specific policies. 
Ask simple questino of one sentence.
dont include overtime question
For each FAQ, provide the question. Do not include any greeting or explanation.

Respond STRICTLY with a valid JSON array of objects. Each object must have the exact keys 'question'.
Return ONLY the raw JSON string, no markdown ticks, no additional text.

Example format:
[
  { "question": "What is the annual leave policy?" },
  { "question": "Tell me about health insurance benefits." }
]
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                maxOutputTokens: 1024,
            }
        });

        let text = response.text || (typeof response.text === 'function' ? response.text() : "");
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse FAQ JSON from Gemini:", text);
            return [];
        }
    } catch (error) {
        console.error("Gemini FAQ Error:", error);
        return [];
    }
};

export default {
    generateAIResponse,
    generateDynamicFAQs
};
