import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Ensure .env is loaded BEFORE initializing the AI client
dotenv.config();

export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});