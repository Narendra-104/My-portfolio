import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const STABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
];   

function detectLanguageForFallback(text) {
  if (!text) return 'en';
  const lower = text.toLowerCase();
  if (lower.includes('marathi') || lower.includes('मराठी')) return 'mr';
  if (lower.includes('hindi') || lower.includes('हिंदी')) return 'hi';
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    const marathiKeywords = ['आहे', 'काय', 'सांगा', 'कसे', 'माहिती', 'शिक्षण', 'बद्दल', 'झाले', 'नमस्कार', 'गुण'];
    return marathiKeywords.some(w => lower.includes(w)) ? 'mr' : 'hi';
  }
  return 'en';
}

// 🎯 ACCURATE & FULLY UPDATED PORTFOLIO KNOWLEDGE BASE
const SYSTEM_INSTRUCTION = `
You are the official AI Assistant for Narendra Gond's personal portfolio website.

=========================================
CRITICAL OUTPUT & LANGUAGE RULES
=========================================
1. DIRECT RESPONSE ONLY: Output ONLY the final response to the user. NEVER output internal reasoning, checklists, language tags, or metadata (such as "Is it in Marathi?", "Translation:", "Role:").
2. STRICT LANGUAGE MATCHING:
   - Automatically detect the user's input language.
   - If the user writes/speaks in Marathi (e.g., "माहिती सांगा", "प्रोजेक्ट्स दाखवा", "कौशल्ये काय आहेत"), respond 100% in natural Marathi.
   - If the user writes/speaks in Hindi (e.g., "नरेंद्र के बारे में बताओ", "प्रोजेक्ट्स बताओ", "स्किल क्या हैं"), respond 100% in natural Hindi.
   - If the user writes in English, respond 100% in English.

=========================================
NARENDRA GOND'S PORTFOLIO DATA
=========================================

1. ABOUT NARENDRA GOND:
- Name: Narendra Gond
- Location: Pune Division, Maharashtra, India
- Role: Aspiring Software Developer & Computer Science Student
- Bio: Attended JSPM University Pune (Wagholi). Focused on web application design, system architecture, AI integration, problem solving, and cost optimization.

2. EDUCATION:
- Degree: B-Tech in Computer Science Engineering
- University: JSPM University, Pune (Wagholi)
- CGPA: 8.60 / 10 (Average CGPA)
  * 1st Year CGPA: 8.65 / 10
  * 2nd Year CGPA: 8.55 / 10
- Details: Deep focus on Data Structures & Algorithms (DSA), C Language syntax, Web Technologies, Software Engineering, and Machine Learning.

3. WORK EXPERIENCE:
a) Project Director at Genxcode (2026):
   - Leading core team projects, system scaling, and feature delivery.
b) GenAI, ML & NLP Intern at EduSkills (2026):
   - Natural language processing pipelines and ML workflows.
c) AIML & AWS Cloud Intern at EduSkills (2025):
   - Worked on AWS AI/ML services, cloud architecture deployment, and automated pipelines.

4. TECHNICAL SKILLS:
- Core Skills: Python Programming & OOP, Data Structures & Algorithms (DSA), Core C Language, Problem Solving & Logic.
- Tech & Web Development: Full-Stack Web Development (React, Node.js, Express), Gemini API & AI Integration, Cloud Storage & AWS Services, Database Management (Supabase, MongoDB).

5. PROJECTS:
a) VisionTrack:
   - Tech: React, Vite, Tailwind CSS, Firebase
   - Description: AI-powered attendance and face recognition management system featuring real-time detection, automated logging, and an analytics dashboard.
b) Local Skill Exchange Platform:
   - Tech: React, Node.js, AI Matching, Credit-Based Escrow System
   - Description: A peer-to-peer learning platform utilizing AI matching algorithms and a credit-based escrow economy for skill sharing.
c) Placement Portal System:
   - Tech: React, Node.js, Supabase, Web Scraper API
   - Description: An enterprise platform automating resume scraping, AI candidate matching, and transparent cost/resource structure estimation.

6. CONTACT & AVAILABILITY:
- Email: narendragond012@gmail.com
- Status: Open to Full-Stack Engineering, AI Integration, and Software Development roles.
`;

function formatHistoryForGemini(rawHistory) {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) return [];

  return rawHistory
    .map(item => {
      const role = (item.role === 'model' || item.role === 'assistant' || item.sender === 'ai' || item.sender === 'bot') 
        ? 'model' 
        : 'user';

      const text = item.text || item.message || item.content || (item.parts && item.parts[0]?.text) || '';

      if (!text || typeof text !== 'string') return null;

      return { role, parts: [{ text }] };
    })
    .filter(Boolean);
}

async function generateWithFallback(genAI, userQuery, rawHistory) {
  const cleanHistory = formatHistoryForGemini(rawHistory);
  let lastError = null;

  for (const modelName of STABLE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION 
      });

      if (cleanHistory.length > 0) {
        const chat = model.startChat({ history: cleanHistory });
        const result = await chat.sendMessage(userQuery);
        return result.response.text();
      } else {
        const result = await model.generateContent(userQuery);
        return result.response.text();
      }
    } catch (err) {
      console.warn(`⚠️ Model "${modelName}" failed: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to process the request.');
}

router.post('/chat', async (req, res) => {
  try {
    const { message, prompt, text, input, history, chatHistory } = req.body;
    const userQuery = message || prompt || text || input;

    if (!userQuery) {
      return res.status(400).json({ error: 'Message or prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend .env file.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const replyText = await generateWithFallback(genAI, userQuery, history || chatHistory);

    return res.json({ 
      reply: replyText, 
      response: replyText,
      message: replyText
    });
  } catch (error) {
    console.error('❌ Gemini Route Error:', error.message);
    
    if (error.message.includes('429') || error.message.includes('Quota exceeded')) {
      const userQuery = req.body.message || req.body.prompt || req.body.text || req.body.input || '';
      const lang = detectLanguageForFallback(userQuery);
      let replyMsg = "API quota limit reached. Please retry in 1 minute.";
      if (lang === 'mr') {
        replyMsg = "क्षमस्व, सध्या API मर्यादा पूर्ण झाली आहे. कृपया १ मिनिटांनंतर पुन्हा प्रयत्न करा.";
      } else if (lang === 'hi') {
        replyMsg = "क्षमा करें, वर्तमान में API कोटा सीमा समाप्त हो गई है। कृपया 1 मिनट बाद पुनः प्रयास करें।";
      }

      return res.status(429).json({
        error: 'API Rate limit reached.',
        reply: replyMsg,
        response: replyMsg,
        message: replyMsg
      });
    }

    return res.status(500).json({ 
      error: 'Failed to process AI request', 
      details: error.message 
    });
  }
});

export default router;