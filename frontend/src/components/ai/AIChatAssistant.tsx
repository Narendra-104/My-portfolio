import React, { useState, useRef, useEffect } from 'react';
import { portfolioData } from '../../data';
import { MessageSquare, X, Send, Bot, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Hi! I'm Narendra's AI Assistant. Ask me anything in English, Marathi, or Hindi!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestions = [
    { label: '🚀 Tell me about VisionTrack', query: 'visiontrack' },
    { label: '💼 View Internships & Experience', query: 'experience' },
    { label: '📊 Check CGPA & Education', query: 'education' },
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const playAudioStreamFallback = (text: string, lang: string) => {
    try {
      const maxLen = 200;
      const shortText = text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
      const encodedText = encodeURIComponent(shortText);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    stopSpeaking();

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return;

    const isDevanagari = /[\u0900-\u097F]/.test(cleanText);
    let langCode = 'en';

    if (isDevanagari) {
      const isMarathi =
        cleanText.includes('आहे') ||
        cleanText.includes('काय') ||
        cleanText.includes('माहिती') ||
        cleanText.includes('नमस्कार') ||
        cleanText.includes('प्रकल्प') ||
        cleanText.includes('कशी') ||
        cleanText.includes('नरेंद्र') ||
        cleanText.includes('माझे');

      langCode = isMarathi ? 'mr' : 'hi';
    }

    const targetLang = langCode === 'mr' ? 'mr-IN' : langCode === 'hi' ? 'hi-IN' : 'en-US';

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang.startsWith(langCode) || (langCode !== 'en' && vLang.startsWith('hi'));
      });

      if (matchingVoice) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = matchingVoice.lang || targetLang;
        utterance.voice = matchingVoice;

        let hasStarted = false;
        utterance.onstart = () => { hasStarted = true; };
        utterance.onerror = () => { if (!hasStarted) playAudioStreamFallback(cleanText, langCode); };

        try {
          window.speechSynthesis.speak(utterance);
          return;
        } catch (e) {}
      }
    }

    playAudioStreamFallback(cleanText, langCode);
  };

  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    const has = (...words: string[]) => words.some(w => q.includes(w));

    if (has('located', 'location', 'where live', 'where is narendra', 'city', 'address', 'कुठे राहतात', 'कहां रहते', 'राहतात')) {
      return "Narendra is located in Wagholi, Pune, Maharashtra, India.";
    }

    if (has('who is narendra', 'background', 'summary', 'about narendra', 'tell me about', 'introduce', 'नरेंद्र कौन', 'नरेंद्र बद्दल', 'कोण आहे')) {
      return "Narendra Gond is a B-Tech Computer Science Engineering student at JSPM University, Pune (Wagholi). He specializes in Python, DSA, C Language, Full-Stack Web Development, and AI/ML integration. Available for Internship 2026.";
    }

    if (has('career goal', 'objective', 'aim', 'focus area', 'target')) {
      return "Career Goal: Seeking a Software Developer role or Internship leveraging Python, C, full-stack web development, and competitive algorithmic problem solving.";
    }

    if (has('education', 'cgpa', 'university', 'jspm', 'degree', 'branch', 'marks')) {
      return "Education: B-Tech in Computer Science Engineering at JSPM University, Pune (Wagholi). Average CGPA: 8.60 / 10 (1st Year: 8.65, 2nd Year: 8.55). Batch: 2024 — 2028.";
    }

    if (has('skills', 'python', 'dsa', 'c language', 'tech', 'full stack')) {
      return "Core Skills: Python Programming & OOP, DSA & Algorithms, Core C Language, Problem Solving. Full-Stack Web: React, Vite, Tailwind CSS, Node.js, Express.js, Firebase, Supabase. AI & Cloud: Google Gemini API, OpenAI API, AWS (S3, EC2, Boto3), Scikit-Learn, NLTK, SpaCy.";
    }

    if (has('visiontrack', 'face recognition', 'attendance')) {
      return "VisionTrack: AI Attendance & Face Recognition Management System. Automatically recognizes faces in real time, logs attendance into Firebase, and features an admin dashboard. Live at: https://6a2c25951868ad16ea8ba5fe--visontrack.netlify.app/";
    }

    if (has('skill exchange', 'escrow')) {
      return "Local Skill Exchange Platform: P2P skill-sharing application featuring a credit-based escrow economy and AI skill matching scoring algorithms. Built with React, Node.js, and Supabase.";
    }

    if (has('placement portal', 'scraper')) {
      return "Placement Portal System: Enterprise recruitment pipeline featuring automated candidate resume scraping via Scraper API and cloud infrastructure resource cost estimation models.";
    }

    if (has('project', 'projets')) {
      return "Narendra's 4 Projects: 1. VisionTrack (AI Face Recognition Attendance System), 2. Local Skill Exchange Platform (P2P Credit & Escrow System), 3. Placement Portal System (Resume Scraping & Cloud Cost Estimation), 4. Interactive AI Portfolio Website.";
    }

    if (has('experience', 'internship', 'genxcode', 'eduskills', 'work')) {
      return "Experience: 1. Project Director at Genxcode (Jan–Apr 2026, Pune) — Led dev team, Python/C runtimes, SRS drafting. 2. AIML & AWS Cloud Intern at EduSkills (June 2025) — Scikit-Learn ML models, AWS S3/EC2, Boto3. 3. GenAI, ML & NLP Intern at EduSkills (June 2026) — NLTK/SpaCy NLP pipelines, LLMs, RAG workflows.";
    }

    if (has('contact', 'email', 'reach', 'hire', 'available')) {
      return "Contact: Email: narendragond012@gmail.com | Status: Available for Internship 2026 | GitHub: Narendra-104 | LinkedIn: narendra-gond-83a050329";
    }

    return "Hello! I am Narendra Gond's AI Assistant. Ask me about his Bio, Location, Education & CGPA, Skills, Projects (VisionTrack, Skill Exchange, Placement Portal), Experience (Genxcode, EduSkills), or Contact details!";
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let aiReplyText = '';
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        aiReplyText = data.reply || generateLocalResponse(textToSend);
      } else {
        aiReplyText = generateLocalResponse(textToSend);
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      speakText(aiReplyText);
    } catch (err) {
      const aiReplyText = generateLocalResponse(textToSend);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      speakText(aiReplyText);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer border border-white/20"
        >
          <Bot size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="font-headline font-bold text-xs tracking-wide">Ask My AI</span>
          <Sparkles size={14} className="text-yellow-300 animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[540px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="font-headline font-bold text-xs text-zinc-200">Gemini Portfolio Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isMuted) setIsMuted(false);
                  else { setIsMuted(true); stopSpeaking(); }
                }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => { setIsOpen(false); stopSpeaking(); }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none font-medium'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs animate-pulse flex items-center gap-2">
                  <Bot size={14} /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-zinc-900/50 border-t border-zinc-800 flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.query)}
                className="text-[10px] font-semibold bg-zinc-800/80 hover:bg-primary/20 text-zinc-300 hover:text-primary px-2.5 py-1 rounded-full border border-zinc-700/50 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              placeholder="Ask anything about Narendra..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => handleSend(input)}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};