import genAI from '../config/gemini.js';
import config from '../config/env.js';
import { searchPolicy } from './search.js';

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




const generateAIResponse = async (messages, userEntity) => {
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
                const searchResults = await searchPolicy(query, userEntity);
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

        const systemContent = SYSTEM_PROMPT_TEMPLATE.replace("{POLICY_TEXT}", policyText);


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

export default {
    generateAIResponse,
};
