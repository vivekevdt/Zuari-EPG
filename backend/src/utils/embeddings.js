import { GoogleGenAI } from "@google/genai";
import config from "../config/env.js";

const ai = new GoogleGenAI({
    apiKey: config.GEMINI_API_KEY,
});

export default async function embed(texts) {
    try {
        if (!Array.isArray(texts)) {
            throw new Error("Input to embed() must be an array of strings.");
        }

        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: texts.map(t => ({ role: "user", parts: [{ text: t }] })),
            config: {
                outputDimensionality: 3072,
            }
        });


        // Extract vectors
        const embeddings = response.embeddings.map(
            (item) => item.values
        );

        return embeddings;
    } catch (error) {
        console.error("Error generating embeddings with Gemini:", error);
        throw error;
    }
}
