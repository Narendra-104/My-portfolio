import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Square, Bot, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// 1. Comprehensive Portfolio Knowledge Base
const PORTFOLIO_DATA = {
  about: {
    name: "Narendra Gond",
    role: "Aspiring Software Developer",
    tagline: "Engineering Student, JSPM University Pune (Wagholi) | Aspiring Software Developer | Python • DSA and Algorithms • C Language | Passionate about Problem Solving | Pune, Maharashtra, India.",
    summary: "Narendra Gond is a passionate B-Tech Computer Science Engineering student at JSPM University, Pune (Wagholi). He is an Aspiring Software Developer specializing in Python, Data Structures & Algorithms, Core C Language, Full-Stack Web Development, and AI/ML integration.",
    location: "Wagholi, Pune, Maharashtra, India",
    journey: "My technical journey began with deep-diving into C language syntax in my first year, which evolved into a passionate pursuit of Data Structures and Algorithms (DSA). Along the way, I expanded my skills to full-stack web development and AI/Computer Vision integrations, such as face recognition systems.",
    careerObjective: "Seeking to leverage my background in Python programming, C systems execution, full-stack web applications, and competitive algorithmic problem solving to secure a challenging Software Developer role or Internship.",
    developmentPhilosophy: "Clean, modular, and optimized code. Problem-first thinking: breaking complex challenges into structured algorithm-driven solutions with maintainable, ATS-optimized architecture.",
    focusArea: "Python, DSA & Algorithms, Full-Stack Web Development (React + Node.js), AI/ML Integration, Cloud Computing (AWS), Computer Vision.",
  },
  education: {
    degree: "B-Tech in Computer Science Engineering (CSE)",
    university: "JSPM University",
    campus: "Wagholi, Pune, Maharashtra, India",
    branch: "Computer Science Engineering",
    period: "2024 — 2028 (Expected graduation: 2028)",
    cgpa: "8.60 / 10 (Average CGPA)",
    cgpaFirstYear: "8.65 / 10",
    cgpaSecondYear: "8.55 / 10",
    subjects: "Data Structures, Analysis & Design of Algorithms, Object-Oriented Software Engineering, Web Engineering, and AI/ML foundations.",
    howStarted: "Narendra started learning programming with C Language during his 1st year of college. His interest grew into DSA, Python, Full-Stack Web Dev, and AI/ML.",
  },
  skills: {
    core: [
      "Python Programming & OOP",
      "Data Structures & Algorithms (DSA - Lists, Trees, Graphs, Big-O)",
      "Core C Language",
      "Problem Solving & Logic Building",
      "Computer Vision & Face Recognition",
    ],
    fullStack: true,
    frontend: ["React", "Vite", "Tailwind CSS", "HTML5", "CSS3", "TypeScript", "JavaScript"],
    backend: ["Node.js", "Express.js"],
    databases: ["Firebase", "Supabase", "MongoDB"],
    ai: ["Google Gemini API", "OpenAI API", "Scikit-Learn", "NLTK", "SpaCy", "Generative AI", "RAG Workflows", "Prompt Engineering"],
    cloud: ["AWS (S3, EC2, Boto3 Python SDK)", "Firebase Cloud Storage & Auth", "Netlify"],
    systemDesign: ["SRS (Software Requirements Specification) Drafting", "System Design", "Modular Architecture", "Technical Roadmaps", "Code Reviews"],
  },
  projects: [
    {
      id: "visiontrack",
      title: "VisionTrack — AI Attendance & Face Recognition Management System",
      shortName: "VisionTrack",
      category: "Web Application",
      description: "An AI-powered attendance management web app that uses face recognition technology to automate attendance in real time, improve accuracy, and eliminate manual record keeping.",
      howFaceRecognitionWorks: "Computer Vision AI scans the camera feed, detects student faces, recognizes identified profiles, and automatically logs attendance with timestamps into Firebase cloud storage.",
      features: "Real-time face detection, automated attendance logging, Firebase cloud storage, secure Firebase authentication, and an intuitive admin dashboard.",
      tech: "React, Vite, JavaScript, HTML5, CSS3, Tailwind CSS, AI, Computer Vision, Face Recognition, Firebase, Cloud Storage, Netlify",
      liveUrl: "https://6a2c25951868ad16ea8ba5fe--visontrack.netlify.app/",
      status: "~60% complete — work in progress",
    },
    {
      id: "skill-exchange",
      title: "Local Skill Exchange Platform",
      shortName: "Skill Exchange",
      category: "Full-Stack Web Application",
      description: "A peer-to-peer learning platform where users teach and learn skills using a credit-based economy, secure credit escrow system, and AI skill-matching scoring algorithms.",
      howEscrowWorks: "When a user requests a skill session, credits are held securely in an escrow account. Once the session is completed and verified by both parties, credits are released to the teacher.",
      howAiMatchingWorks: "The AI matching algorithm analyzes user profiles, listed skills, learning goals, and availability to pair compatible skill-exchange partners.",
      tech: "React, Node.js, Supabase, AI Matching Engine",
    },
    {
      id: "placement-portal",
      title: "Placement Portal System",
      shortName: "Placement Portal",
      category: "Enterprise Web Application",
      description: "An enterprise recruitment pipeline managing student applicants, job listings, automated resume scraping, and cloud infrastructure cost estimation.",
      howResumeScrapingWorks: "Integrates Scraper API tools to automatically extract, parse, and structure candidate resume data (skills, education, experience) into database records.",
      resourceCostCalculation: "Includes cloud infrastructure cost estimation models that calculate compute, storage, and bandwidth costs based on user scale.",
      tech: "React, Scraper API, Supabase, Cloud Infrastructure",
    },
    {
      id: "ai-portfolio",
      title: "Interactive AI Portfolio Website",
      shortName: "AI Portfolio",
      category: "Portfolio Web Application",
      description: "This portfolio website — a full-stack interactive application with an embedded Gemini AI assistant, dark mode, owner analytics, and multilingual AI support.",
      howBuilt: "Frontend: React + Vite + TypeScript + Tailwind CSS. Backend: Node.js + Express. AI: Google Gemini API with portfolio knowledge base. Animations: Framer Motion.",
      tech: "React, Vite, TypeScript, Tailwind CSS, Node.js, Express.js, Google Gemini API, Framer Motion",
    },
  ],
  experience: [
    {
      role: "Project Director",
      company: "Genxcode",
      period: "January 2026 — April 2026 (Pune, India)",
      responsibilities: "Led a team of student developers building Python utilities and algorithm runtimes, designed project roadmaps, drafted SRS documents, and conducted code reviews for C and Python.",
      skills: ["Python", "C Language", "DSA", "SRS Drafting", "System Design", "Leadership"],
    },
    {
      role: "AIML & AWS Cloud Intern",
      company: "EduSkills Virtual Internship",
      period: "June 2025 (Online)",
      responsibilities: "Built supervised ML models using Scikit-Learn, configured AWS S3 storage buckets & EC2 virtual machines, and wrote Boto3 automation scripts.",
      skills: ["AWS S3", "AWS EC2", "Boto3", "Python", "Scikit-Learn", "Machine Learning"],
    },
    {
      role: "GenAI, ML & NLP Intern",
      company: "EduSkills Virtual Internship",
      period: "June 2026 (Online)",
      responsibilities: "Developed NLP tokenization pipelines using NLTK & SpaCy, explored pre-trained LLMs, and designed Retrieval-Augmented Generation (RAG) workflows.",
      hasNlpPipelines: "YES — Built NLP tokenization and text preprocessing pipelines using NLTK and SpaCy.",
      skills: ["Generative AI", "NLP", "NLTK", "SpaCy", "RAG", "LLMs", "Prompt Engineering"],
    },
  ],
  contact: {
    email: "narendragond012@gmail.com",
    location: "Wagholi, Pune, Maharashtra, India",
    github: "https://github.com/Narendra-104",
    githubUsername: "Narendra-104",
    linkedin: "https://linkedin.com/in/narendra-gond-83a050329",
    linkedinId: "narendra-gond-83a050329",
    availability: "Available for Internship 2026 — open to full-time roles & internships (Full-Stack Engineer, AI Engineer, Software Developer).",
    whyHire: "Strong CS fundamentals (Python, DSA, C), 8.60 CGPA, leadership experience at Genxcode, hands-on AI/ML & AWS Cloud projects, certified skills, and immediate availability for Internship 2026.",
  },
};

export default function PortfolioChat() {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Hi! I'm Narendra's AI Assistant. Ask me anything about his bio, skills, education, projects, experience, or contact details! (English, Marathi, or Hindi)`,
      timestamp: new Date(),
    },
  ]);

  const [selectedLang, setSelectedLang] = useState<'mr-IN' | 'hi-IN' | 'en-US'>('mr-IN');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  useEffect(() => {
    const hasSpeechSupport =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (!hasSpeechSupport) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const speechObj = new SpeechRecognition();

      speechObj.continuous = false;
      speechObj.interimResults = true;

      speechObj.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        setInput(transcript);
        setMicError(null);

        if (event.results[0].isFinal) {
          handleSend(transcript);
        }
      };

      speechObj.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          setMicError('Microphone blocked. Check browser permissions.');
        } else {
          setMicError(`Mic error: ${event.error}`);
        }
      };

      speechObj.onend = () => setIsListening(false);
      recognitionRef.current = speechObj;
    } catch (err) {
      setIsSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

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

  const speakResponse = (text: string) => {
    if (isMuted) return;
    stopSpeaking();

    const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_#`•📌💻💼🎓👋📫]/g, '').trim();
    if (!cleanText) return;

    const isDevanagari = /[\u0900-\u097F]/.test(cleanText);
    let langCode = 'en';

    if (isDevanagari) {
      const lower = cleanText.toLowerCase();
      const marathiKeywords = ['आहे', 'नाही', 'बद्दल', 'करा', 'माझे', 'तुमचे', 'आहेत', 'झाले', 'तुमच्या', 'सांगा', 'प्रोजेक्ट्स', 'शिक्षण', 'काय', 'कसे', 'नमस्कार', 'नरेंद्र'];
      const isMarathi = marathiKeywords.some((word) => lower.includes(word));
      langCode = isMarathi ? 'mr' : 'hi';
    }

    const targetLang = langCode === 'mr' ? 'mr-IN' : langCode === 'hi' ? 'hi-IN' : 'en-US';

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      let matchedVoice = currentVoices.find((v) => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang.startsWith(langCode) || (langCode !== 'en' && vLang.startsWith('hi'));
      });

      if (matchedVoice) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = matchedVoice.lang || targetLang;
        utterance.voice = matchedVoice;
        utterance.rate = 0.95;

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

  const toggleListening = () => {
    stopSpeaking();
    if (!isSpeechSupported || !recognitionRef.current) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    setMicError(null);

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.abort();
        recognitionRef.current.lang = selectedLang;
        setTimeout(() => {
          recognitionRef.current.start();
          setIsListening(true);
        }, 50);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const detectQueryLang = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('marathi') || lower.includes('मराठी')) return 'mr';
    if (lower.includes('hindi') || lower.includes('हिंदी')) return 'hi';

    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const marathiKeywords = ['आहे', 'काय', 'सांगा', 'कसे', 'कशी', 'माहिती', 'शिक्षण', 'बद्दल', 'झाले', 'नमस्कार', 'नरेंद्र', 'राहतात', 'कुठे'];
    const isMarathi = hasDevanagari && (text.includes('ळ') || marathiKeywords.some(w => text.includes(w)));

    if (isMarathi) return 'mr';
    if (hasDevanagari) return 'hi';

    const hinglishMarathi = ['kasa', 'kashi', 'kase', 'kuthe', 'shikshan', 'majha', 'sanga', 'rahtat'];
    if (hinglishMarathi.some(w => lower.includes(w))) return 'mr';

    const hinglishHindi = ['kaise', 'kaisa', 'kya', 'hai', 'bataye', 'batao', 'rahte', 'kahan'];
    if (hinglishHindi.some(w => lower.includes(w))) return 'hi';

    return 'en';
  };

  // Comprehensive local fallback response generator
  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    const lang = detectQueryLang(query);

    const has = (...words: string[]) => words.some(w => q.includes(w));
    const t = (en: string, hi: string, mr: string) => lang === 'hi' ? hi : lang === 'mr' ? mr : en;

    const A = PORTFOLIO_DATA.about;
    const E = PORTFOLIO_DATA.education;
    const S = PORTFOLIO_DATA.skills;
    const P = PORTFOLIO_DATA.projects;
    const EX = PORTFOLIO_DATA.experience;
    const C = PORTFOLIO_DATA.contact;

    // 1. ABOUT & BIO
    if (has('located', 'location', 'where live', 'where is narendra', 'city', 'address', 'कुठे राहतात', 'कहां रहते', 'राहतात')) {
      return t(
        `Narendra is located in ${A.location}.`,
        `नरेन्द्र ${A.location} में रहते हैं।`,
        `नरेंद्र ${A.location} येथे राहतात.`
      );
    }
    if (has('who is narendra', 'background', 'summary', 'about narendra', 'tell me about', 'introduce', 'नरेंद्र कौन', 'नरेंद्र बद्दल', 'नरेंद्रजी बद्दल', 'कोण आहे')) {
      return t(
        A.summary,
        `नरेन्द्र गोंड JSPM यूनिवर्सिटी, पुणे से B-Tech CSE के छात्र हैं। वे Python, DSA, C भाषा, Full-Stack Web Dev, और AI/ML में विशेषज्ञता रखते हैं और 2026 की इंटर्नशिप के लिए उपलब्ध हैं।`,
        `नरेंद्र गोंड हे JSPM युनिव्हर्सिटी, पुणे येथून B-Tech CSE चे विद्यार्थी आहेत. ते Python, DSA, C भाषा, Full-Stack Web Dev, आणि AI/ML मध्ये तज्ज्ञ आहेत आणि 2026 च्या इंटर्नशिपसाठी उपलब्ध आहेत.`
      );
    }
    if (has('career goal', 'objective', 'aim', 'focus area', 'target', 'लक्ष्य', 'उद्दिष्ट', 'ध्येय')) {
      return t(
        `Career Goal: ${A.careerObjective} Focus Areas: ${A.focusArea}`,
        `करियर लक्ष्य: ${A.careerObjective} मुख्य क्षेत्र: ${A.focusArea}`,
        `करिअर उद्दिष्ट: ${A.careerObjective} मुख्य क्षेत्रे: ${A.focusArea}`
      );
    }
    if (has('philosophy', 'development philosophy', 'coding style', 'approach')) {
      return t(
        A.developmentPhilosophy,
        `विकास दर्शन: नरेन्द्र स्वच्छ, मॉड्यूलर और अनुकूलित कोड लिखने में विश्वास करते हैं। वे समस्या-प्रथम सोच और स्केलेबल सिस्टम डिज़ाइन पर ध्यान केंद्रित करते हैं।`,
        `विकास तत्वज्ञान: नरेंद्र स्वच्छ, मॉड्युलर आणि ऑप्टिमाइझ्ड कोड लिहिण्यावर विश्वास ठेवतात. ते समस्या-प्रथम विचार आणि स्केलेबल सिस्टम डिझाइनवर लक्ष केंद्रित करतात.`
      );
    }

    // 2. EDUCATION & ACADEMICS
    if (has('where did narendra study', 'which university', 'college', 'degree', 'branch', 'engineering', 'शिक्षण', 'कॉलेज', 'युनिव्हर्सिटी', 'विश्वविद्यालय')) {
      return t(
        `Narendra is pursuing ${E.degree} (${E.branch}) at ${E.university}, ${E.campus} (${E.period}).`,
        `नरेन्द्र ${E.university}, ${E.campus} से ${E.degree} (${E.period}) कर रहे हैं।`,
        `नरेंद्र ${E.university}, ${E.campus} येथून ${E.degree} (${E.period}) करत आहेत.`
      );
    }
    if (has('cgpa', 'marks', 'grade', 'score', 'percentage', '1st year', '2nd year', 'first year', 'second year', 'गुण', 'अंक')) {
      return t(
        `Narendra's Average CGPA is ${E.cgpa} (1st Year: ${E.cgpaFirstYear}, 2nd Year: ${E.cgpaSecondYear}).`,
        `नरेन्द्र का औसतन CGPA ${E.cgpa} है (पहला साल: ${E.cgpaFirstYear}, दूसरा साल: ${E.cgpaSecondYear})।`,
        `नरेंद्रचा सरासरी CGPA ${E.cgpa} आहे (पहिले वर्ष: ${E.cgpaFirstYear}, दुसरे वर्ष: ${E.cgpaSecondYear}).`
      );
    }
    if (has('subjects', 'course', 'curriculum', 'study', 'विषय', 'अभ्यास')) {
      return t(
        `Academic focus: ${E.subjects}`,
        `अकादमिक विषय: ${E.subjects}`,
        `शैक्षणिक विषय: ${E.subjects}`
      );
    }
    if (has('how started', 'start learning', 'first programming', 'begin', 'सुरुवात')) {
      return t(
        E.howStarted,
        `नरेन्द्र ने C भाषा के साथ प्रोग्रामिंग सीखना शुरू किया। इसके बाद वे DSA, Python, Full-Stack Web Dev और AI/ML की ओर बढ़े।`,
        `नरेंद्र यांनी C भाषेसह प्रोग्रामिंग शिकण्यास सुरुवात केली. त्यानंतर ते DSA, Python, Full-Stack Web Dev आणि AI/ML कडे वळले.`
      );
    }

    // 3. TECHNICAL SKILLS
    if (has('python')) {
      return t(
        `Yes! Python is Narendra's primary language. He uses it for OOP, ML models (Scikit-Learn), NLP pipelines (NLTK, SpaCy), and AWS cloud automation (Boto3).`,
        `हाँ! Python नरेन्द्र की प्राथमिक भाषा है। वे OOP, ML (Scikit-Learn), NLP (NLTK, SpaCy) और AWS (Boto3) के लिए Python का उपयोग करते हैं।`,
        `हो! Python ही नरेंद्रची प्राथमिक भाषा आहे. ते OOP, ML (Scikit-Learn), NLP (NLTK, SpaCy) आणि AWS (Boto3) साठी Python वापरतात.`
      );
    }
    if (has('dsa', 'data structure', 'algorithm', 'big-o')) {
      return t(
        `Yes! DSA & Algorithms is Narendra's core specialization (Lists, Trees, Graphs, Big-O Analysis).`,
        `हाँ! DSA & Algorithms नरेन्द्र की मुख्य विशेषज्ञता है।`,
        `हो! DSA & Algorithms हे नरेंद्रचे मुख्य स्पेशलायझेशन आहे.`
      );
    }
    if (has('c language', 'c lang', 'core c', 'सी भाषा')) {
      return t(
        `Yes! Core C Language is Narendra's foundation language. He led C code reviews at Genxcode.`,
        `हाँ! Core C Language नरेन्द्र की आधारभूत भाषा है।`,
        `हो! Core C Language ही नरेंद्रची पायाभूत भाषा आहे.`
      );
    }
    if (has('oop', 'object oriented')) {
      return t(
        `Yes! Narendra is proficient in Object-Oriented Programming (OOP) in Python and C++.`,
        `हाँ, नरेन्द्र Object-Oriented Programming (OOP) में कुशल हैं।`,
        `हो, नरेंद्र Object-Oriented Programming (OOP) मध्ये कुशल आहेत.`
      );
    }
    if (has('full stack', 'full-stack', 'fullstack')) {
      return t(
        `Yes! Narendra is a Full-Stack Web Developer. Frontend: ${S.frontend.join(', ')}. Backend: ${S.backend.join(', ')}. Databases: ${S.databases.join(', ')}.`,
        `हाँ! नरेन्द्र एक Full-Stack Web Developer हैं। Frontend: ${S.frontend.join(', ')}। Backend: ${S.backend.join(', ')}। Databases: ${S.databases.join(', ')}।`,
        `हो! नरेंद्र एक Full-Stack Web Developer आहेत. Frontend: ${S.frontend.join(', ')}. Backend: ${S.backend.join(', ')}. Databases: ${S.databases.join(', ')}.`
      );
    }
    if (has('gemini', 'openai', 'ai api', 'ai/ml')) {
      return t(
        `Narendra integrates AI APIs such as Google Gemini API (powering this portfolio) and OpenAI API into web applications.`,
        `नरेन्द्र Google Gemini API और OpenAI API का उपयोग वेब एप्लिकेशन्स में AI इंटीग्रेशन के लिए करते हैं।`,
        `नरेंद्र वेब ॲप्लिकेशन्समध्ये AI एकात्मतेसाठी Google Gemini API आणि OpenAI API चा वापर करतात.`
      );
    }
    if (has('aws', 'cloud', 's3', 'ec2', 'boto3')) {
      return t(
        `Narendra has AWS Cloud experience: Amazon S3 buckets, EC2 virtual machines, and Boto3 Python SDK automation scripts.`,
        `नरेन्द्र को AWS Cloud का अनुभव है: Amazon S3, EC2, और Boto3 Python SDK ऑटोमेशन।`,
        `नरेंद्रला AWS Cloud चा अनुभव आहे: Amazon S3, EC2, आणि Boto3 Python SDK ऑटोमेशन.`
      );
    }
    if (has('srs', 'system design', 'requirement specification')) {
      return t(
        `Yes! Narendra has experience drafting Software Requirement Specifications (SRS), designing modular system architecture, and leading technical roadmaps at Genxcode.`,
        `हाँ! नरेन्द्र को SRS ड्राफ्टिंग, सिस्टम डिज़ाइन और तकनीकी रोडमैप प्लानिंग का अनुभव है।`,
        `हो! नरेंद्रला SRS ड्राफ्टिंग, सिस्टम डिझाइन आणि तांत्रिक रोडमॅप प्लॅनिंगचा अनुभव आहे.`
      );
    }
    if (has('skill', 'technology', 'tech stack', 'कौशल्य', 'स्किल')) {
      return t(
        `Narendra's Skills: Core: ${S.core.join(', ')}. Frontend: ${S.frontend.join(', ')}. Backend: ${S.backend.join(', ')}. AI & Cloud: ${S.ai.join(', ')}, ${S.cloud.join(', ')}.`,
        `नरेन्द्र की स्किल्स: ${S.core.join(', ')}। Web: React, Node.js, Firebase, Supabase। AI/Cloud: AWS, Gemini API, Scikit-Learn, NLTK, SpaCy।`,
        `नरेंद्रची कौशल्ये: ${S.core.join(', ')}. Web: React, Node.js, Firebase, Supabase. AI/Cloud: AWS, Gemini API, Scikit-Learn, NLTK, SpaCy.`
      );
    }

    // 4. PROJECTS
    if (has('visiontrack', 'vision track', 'face recognition', 'attendance')) {
      const v = P[0];
      return t(
        `${v.title}: ${v.description} Face Recognition: ${v.howFaceRecognitionWorks} Live Demo: ${v.liveUrl}`,
        `VisionTrack एक AI-संचालित फेस रिकग्निशन उपस्थिति प्रणाली है जो कैमरे से चेहरे पहचानकर Firebase में उपस्थिति दर्ज करती है। Live: ${v.liveUrl}`,
        `VisionTrack ही एक AI-संचालित फेस रिकग्निशन उपस्थिती प्रणाली आहे जी कॅमेऱ्याद्वारे चेहरे ओळखून Firebase मध्ये उपस्थिती नोंदवते. Live: ${v.liveUrl}`
      );
    }
    if (has('skill exchange', 'escrow', 'credit-based')) {
      const s = P[1];
      return t(
        `${s.title}: ${s.description} Escrow: ${s.howEscrowWorks} AI Matching: ${s.howAiMatchingWorks} Tech: ${s.tech}`,
        `Local Skill Exchange Platform एक P2P स्किल-शेयरिंग प्लेटफॉर्म है जो क्रेडिट-आधारित एस्क्रो सिस्टम और AI स्किल मैचिंग एल्गोरिदम का उपयोग करता है।`,
        `Local Skill Exchange Platform हा एक P2P स्किल-शेअरिंग प्लॅटफॉर्म आहे जो क्रेडिट-आधारित एस्क्रो सिस्टम आणि AI स्किल मॅचिंग अल्गोरिदम वापरतो.`
      );
    }
    if (has('placement portal', 'scraper', 'resume scraping', 'resource cost')) {
      const p = P[2];
      return t(
        `${p.title}: ${p.description} Resume Scraping: ${p.howResumeScrapingWorks} Resource Cost: ${p.resourceCostCalculation} Tech: ${p.tech}`,
        `Placement Portal System एक एंटरप्राइज भर्ती प्रणाली है जो Scraper API रिज़्यूमे स्क्रैपिंग और इन्फ्रास्ट्रक्चर लागत अनुमान प्रदान करता है।`,
        `Placement Portal System ही एक एंटरप्राइज भरती प्रणाली आहे जी Scraper API रिझ्युमे स्क्रॅपिंग आणि इन्फ्रास्ट्रक्चर खर्च अंदाज प्रदान करते.`
      );
    }
    if (has('how is this portfolio', 'ai portfolio', 'this website', 'built this site')) {
      const a = P[3];
      return t(
        `${a.title}: ${a.howBuilt}`,
        `यह पोर्टफोलियो React, Vite, Node.js, Express और Google Gemini API द्वारा संचालित एक फ़ुल-स्टैक इंटरएक्टिव वेब ऐप है।`,
        `हे पोर्टफोलिओ React, Vite, Node.js, Express आणि Google Gemini API द्वारे समर्थित एक फुल-स्टॅक परस्परसंवादी वेब ॲप आहे.`
      );
    }
    if (has('project', 'projets', 'प्रोजेक्ट')) {
      return t(
        `Narendra's 4 Key Projects:\n1. VisionTrack (AI Face Recognition Attendance System)\n2. Local Skill Exchange Platform (P2P Credit & Escrow system)\n3. Placement Portal System (Resume Scraping & Cloud Cost Estimation)\n4. Interactive AI Portfolio Website (Full-stack + Gemini API)`,
        `नरेन्द्र के 4 मुख्य प्रोजेक्ट्स:\n1. VisionTrack (AI फेस रिकग्निशन)\n2. Local Skill Exchange Platform (P2P क्रेडिट व एस्क्रो)\n3. Placement Portal System (रिज़्यूमे स्क्रैपिंग)\n4. Interactive AI Portfolio (React + Node.js + Gemini API)`,
        `नरेंद्रचे 4 मुख्य प्रोजेक्ट्स:\n1. VisionTrack (AI फेस रिकग्निशन)\n2. Local Skill Exchange Platform (P2P क्रेडिट व एस्क्रो)\n3. Placement Portal System (रिझ्युमे स्क्रॅपिंग)\n4. Interactive AI Portfolio (React + Node.js + Gemini API)`
      );
    }

    // 5. EXPERIENCE & INTERNSHIPS
    if (has('genxcode', 'project director')) {
      const e = EX[0];
      return t(
        `At ${e.company} (${e.period}), Narendra was ${e.role}. Responsibilities: ${e.responsibilities}`,
        `${e.company} (${e.period}) में नरेन्द्र ${e.role} थे। जिम्मेदारियां: ${e.responsibilities}`,
        `${e.company} (${e.period}) मध्ये नरेंद्र ${e.role} होते. जबाबदाऱ्या: ${e.responsibilities}`
      );
    }
    if (has('eduskills', 'edu skill', 'nlp', 'natural language', 'aws intern', 'genai intern')) {
      return t(
        `EduSkills Internships:\n1. GenAI, ML & NLP Intern (June 2026): ${EX[2].responsibilities}\n2. AIML & AWS Cloud Intern (June 2025): ${EX[1].responsibilities}`,
        `EduSkills में 2 इंटर्नशिप पूरी कीं:\n1. GenAI, ML & NLP Intern (June 2026): NLTK, SpaCy से NLP पाइपलाइन और RAG वर्कफ़्लो।\n2. AWS Cloud Intern (June 2025): Scikit-Learn से ML मॉडल और AWS S3/EC2/Boto3।`,
        `EduSkills मधील 2 इंटर्नशिप्स:\n1. GenAI, ML & NLP Intern (June 2026): NLTK, SpaCy सह NLP पाइपलाइन आणि RAG वर्कफ्लो.\n2. AWS Cloud Intern (June 2025): Scikit-Learn सह ML मॉडेल आणि AWS S3/EC2/Boto3.`
      );
    }
    if (has('experience', 'internship', 'work', 'job', 'अनुभव', 'इंटर्नशिप')) {
      return t(
        `Narendra's Experience:\n1. Project Director @ Genxcode (Jan–Apr 2026)\n2. AIML & AWS Cloud Intern @ EduSkills (June 2025)\n3. GenAI, ML & NLP Intern @ EduSkills (June 2026)`,
        `नरेन्द्र का अनुभव:\n1. Project Director @ Genxcode (Jan–Apr 2026)\n2. AIML & AWS Cloud Intern @ EduSkills (June 2025)\n3. GenAI, ML & NLP Intern @ EduSkills (June 2026)`,
        `नरेंद्रचा अनुभव:\n1. Project Director @ Genxcode (Jan–Apr 2026)\n2. AIML & AWS Cloud Intern @ EduSkills (June 2025)\n3. GenAI, ML & NLP Intern @ EduSkills (June 2026)`
      );
    }

    // 6. CONTACT & HIRING
    if (has('email', 'mail', 'ईमेल', 'इमेल')) {
      return t(
        `Narendra's official email is ${C.email}.`,
        `नरेन्द्र का आधिकारिक ईमेल ${C.email} है।`,
        `नरेंद्रचा अधिकृत ईमेल ${C.email} आहे.`
      );
    }
    if (has('contact', 'reach', 'message', 'send message', 'संपर्क')) {
      return t(
        `Contact Narendra via email (${C.email}) or send a message using the Contact section form on this portfolio.`,
        `नरेन्द्र से ${C.email} पर संपर्क करें या Contact Form से मैसेज भेजें।`,
        `नरेंद्रशी ${C.email} वर संपर्क करा किंवा Contact Form द्वारे संदेश पाठवा.`
      );
    }
    if (has('hiring', 'hire', 'available', 'internship 2026', 'roles looking for', 'why hire')) {
      return t(
        `Status: ${C.availability}\nWhy Hire Narendra: ${C.whyHire}`,
        `स्थिति: ${C.availability}\nनरेन्द्र को क्यों चुनें: ${C.whyHire}`,
        `स्थिती: ${C.availability}\nनरेंद्रला का निवडावे: ${C.whyHire}`
      );
    }
    if (has('github', 'linkedin', 'social', 'profile link')) {
      return t(
        `GitHub: ${C.github} (Username: ${C.githubUsername})\nLinkedIn: ${C.linkedin} (ID: ${C.linkedinId})\nYou can click the GitHub or LinkedIn icons in the Contact section to view details and visit directly.`,
        `GitHub: ${C.github} (Username: ${C.githubUsername})\nLinkedIn: ${C.linkedin} (ID: ${C.linkedinId})`,
        `GitHub: ${C.github} (Username: ${C.githubUsername})\nLinkedIn: ${C.linkedin} (ID: ${C.linkedinId})`
      );
    }

    // DEFAULT
    return t(
      `Hello! I am Narendra Gond's Portfolio AI Assistant. You can ask me anything about his About & Bio, Education & CGPA, Technical Skills, Projects (VisionTrack, Skill Exchange, Placement Portal), Experience, Certificates, or Contact/Hiring details!`,
      `नमस्ते! मैं नरेन्द्र गोंड का Portfolio AI असिस्टेंट हूँ। आप मुझसे उनकी बायो, शिक्षा, CGPA, स्किल्स, प्रोजेक्ट्स (VisionTrack, Skill Exchange), अनुभव या संपर्क के बारे में कुछ भी पूछ सकते हैं!`,
      `नमस्कार! मी नरेंद्र गोंडचा Portfolio AI असिस्टंट आहे. तुम्ही मला त्यांचे बायो, शिक्षण, CGPA, कौशल्ये, प्रोजेक्ट्स (VisionTrack, Skill Exchange), अनुभव किंवा संपर्काबद्दल काहीही विचारू शकता!`
    );
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    stopSpeaking();

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setMicError(null);

    let aiReplyText = '';

    try {
      let response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      }).catch(() => null);

      if (!response || !response.ok) {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSend }),
        }).catch(() => null);
      }

      if (response && response.ok) {
        const data = await response.json();
        aiReplyText = data.reply || data.response || data.message;
      } else {
        throw new Error('Backend unavailable');
      }
    } catch (err) {
      aiReplyText = generateLocalResponse(textToSend);
    }

    const aiMsg: Message = {
      id: Math.random().toString(),
      sender: 'ai',
      text: aiReplyText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    speakResponse(aiReplyText);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-headline font-bold text-xs text-zinc-200">Portfolio Assistant 2.5</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-md border border-zinc-700 focus:outline-none cursor-pointer"
          >
            <option value="mr-IN">मराठी (MR)</option>
            <option value="hi-IN">हिंदी (HI)</option>
            <option value="en-US">English (EN)</option>
          </select>

          <button
            onClick={() => {
              if (isMuted) {
                setIsMuted(false);
              } else {
                setIsMuted(true);
                stopSpeaking();
              }
            }}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
          >
            {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-br-none font-medium shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {micError && (
        <div className="px-4 py-1.5 bg-red-950/80 border-t border-red-800/50 text-red-300 text-[10px] flex items-center gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Input controls */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <Square size={16} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          placeholder="Ask in English, हिंदी, or मराठी..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
        />

        <button
          onClick={() => handleSend(input)}
          className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-md"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}