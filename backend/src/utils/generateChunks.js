import genAI from "../config/gemini.js";

// -----------------------------
// Split large documents safely
// -----------------------------

// -----------------------------
// System Instruction
// -----------------------------
const systemInstruction = `
You are a document structuring assistant.

IMPORTANT:
- Return ONLY valid JSON.
- Do NOT include explanation.
- Do NOT include markdown.
- Do NOT include backticks.
- Ensure JSON is complete and properly closed.
- Output must start with [ and end with ].

Task:
1. Split document into logical chunks.
2. Max 400 words per chunk.
3. OUTPUT ONLY PLAIN TEXT: Strip all HTML tags, styling, and structural codes.
4. Preserve exact wording — do NOT summarize or rewrite.

Format:
[
  {
    "heading": "Section title if available else null",
    "content": "Exact original text (Plain text only, absolute NO HTML)"
  }
]
`
;


// Split large docs safely
function splitIntoBlocks(text, maxWords = 1500) {
  const words = text.split(/\s+/);
  const blocks = [];

  for (let i = 0; i < words.length; i += maxWords) {
    blocks.push(words.slice(i, i + maxWords).join(" "));
  }

  return blocks;
}

export default async function generateChunks(rawText) {

  if (!rawText || rawText.trim().length < 50) {
    return [];
  }

  const blocks = splitIntoBlocks(rawText);
  let finalChunks = [];

  for (const block of blocks) {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction },
            { text: block }]
          }
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 50000,
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                heading: { type: "string", nullable: true },
                content: { type: "string" }
              },
              required: ["content"]
            }
          }
        }
      });

      // Compatibility check for different SDK versions
      let jsonString = "";
      if (typeof response.text === 'function') {
        jsonString = response.text();
      } else if (response.text) {
        jsonString = response.text;
      } else if (response.response && typeof response.response.text === 'function') {
        jsonString = response.response.text();
      }


      let parsed = [];
      try {
        parsed = JSON.parse(jsonString);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // Try to clean markdown
        const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      }

      if (Array.isArray(parsed)) {
        finalChunks.push(...parsed);
      } else if (parsed && typeof parsed === 'object') {
        // in case it returns a single object instead of array
        finalChunks.push(parsed);
      }
    } catch (err) {
      console.error("Error structuring chunk:", err.message);
      // Fallback: simple chunking if AI fails
      finalChunks.push({ content: block.substring(0, 1000), heading: "Error parsing" });
    }
  }

  // Filter out any chunks with empty content to avoid validation errors
  return finalChunks.filter(chunk => chunk.content && chunk.content.trim() !== "");
}