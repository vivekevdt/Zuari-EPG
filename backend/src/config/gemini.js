import { GoogleGenAI } from "@google/genai";
import config from "./env.js";

if (!config.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

export default genAI;
