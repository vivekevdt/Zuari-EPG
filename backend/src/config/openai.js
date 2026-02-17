import { OpenAI } from 'openai';
import config from './env.js';

if (!config.OPENAI_API_KEY) {
    console.warn("Usage Warning: OPENAI_API_KEY is missing in environment variables.");
}

const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

export default openai;
