import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Square, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchProjects, fetchCertificates, fetchPortfolioSetting } from '../../lib/db';
import type { Project, Certificate } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// ─── Static baseline (used when Supabase unavailable) ──────────
const STATIC_DATA = {
  about: {
    name: 'Narendra Gond',
    role: 'Aspiring Software Developer',
    tagline:
      'Engineering Student, JSPM University Pune (Wagholi) | Aspiring Software Developer | Python • DSA and Algorithms • C Language | Passionate about Problem Solving | Pune, Maharashtra, India.',
    summary:
      'Narendra Gond is a passionate B-Tech Computer Science Engineering student at JSPM University, Pune (Wagholi). He is an Aspiring Software Developer specialising in Python, Data Structures & Algorithms, Core C Language, Full-Stack Web Development, and AI/ML integration.',
    location: 'Wagholi, Pune, Maharashtra, India',
    careerObjective:
      'Seeking to leverage my background in Python programming, C systems execution, full-stack web applications, and competitive algorithmic problem solving to secure a challenging Software Developer role or Internship.',
    focusArea: 'Python, DSA & Algorithms, Full-Stack Web Development (React + Node.js), AI/ML Integration, Cloud Computing (AWS), Computer Vision.',
    developmentPhilosophy:
      'Clean, modular, and optimised code. Problem-first thinking: breaking complex challenges into structured algorithm-driven solutions.',
  },
  education: {
    degree: 'B-Tech in Computer Science Engineering (CSE)',
    university: 'JSPM University',
    campus: 'Wagholi, Pune, Maharashtra, India',
    period: '2024 — 2028 (Expected graduation: 2028)',
    cgpa: '8.60 / 10 (Average CGPA)',
    cgpaFirstYear: '8.65 / 10',
    cgpaSecondYear: '8.55 / 10',
    subjects: 'Data Structures, Analysis & Design of Algorithms, Object-Oriented Software Engineering, Web Engineering, and AI/ML foundations.',
  },
  skills: {
    core: ['Python Programming & OOP', 'Data Structures & Algorithms (DSA)', 'Core C Language', 'Problem Solving & Logic Building', 'Computer Vision & Face Recognition'],
    frontend: ['React', 'Vite', 'Tailwind CSS', 'HTML5', 'CSS3', 'TypeScript', 'JavaScript'],
    backend: ['Node.js', 'Express.js'],
    databases: ['Firebase', 'Supabase', 'MongoDB'],
    ai: ['Google Gemini API', 'OpenAI API', 'Scikit-Learn', 'NLTK', 'SpaCy', 'Generative AI', 'RAG Workflows', 'Prompt Engineering'],
    cloud: ['AWS (S3, EC2, Boto3)', 'Firebase Cloud Storage & Auth', 'Netlify', 'Vercel'],
  },
  experience: [
    {
      role: 'Project Director',
      company: 'Genxcode',
      period: 'January 2026 — April 2026 (Pune, India)',
      responsibilities: 'Led a team of student developers building Python utilities and algorithm runtimes, designed project roadmaps, drafted SRS documents, and conducted code reviews for C and Python.',
      skills: ['Python', 'C Language', 'DSA', 'SRS Drafting', 'System Design', 'Leadership'],
    },
    {
      role: 'AIML & AWS Cloud Intern',
      company: 'EduSkills Virtual Internship',
      period: 'June 2025 (Online)',
      responsibilities: 'Built supervised ML models using Scikit-Learn, configured AWS S3 storage buckets & EC2 virtual machines, and wrote Boto3 automation scripts.',
      skills: ['AWS S3', 'AWS EC2', 'Boto3', 'Python', 'Scikit-Learn', 'Machine Learning'],
    },
    {
      role: 'GenAI, ML & NLP Intern',
      company: 'EduSkills Virtual Internship',
      period: 'June 2026 (Online)',
      responsibilities: 'Developed NLP tokenisation pipelines using NLTK & SpaCy, explored pre-trained LLMs, and designed Retrieval-Augmented Generation (RAG) workflows.',
      skills: ['Generative AI', 'NLP', 'NLTK', 'SpaCy', 'RAG', 'LLMs', 'Prompt Engineering'],
    },
  ],
  contact: {
    email: 'narendragond014@gmail.com',
    location: 'Wagholi, Pune, Maharashtra, India',
    github: 'https://github.com/Narendra-104',
    githubUsername: 'Narendra-104',
    linkedin: 'https://linkedin.com/in/narendra-gond-83a050329',
    linkedinId: 'narendra-gond-83a050329',
    availability: 'Available for Internship 2026 — open to full-time roles & internships (Full-Stack Engineer, AI Engineer, Software Developer).',
    whyHire: 'Strong CS fundamentals (Python, DSA, C), 8.60 CGPA, leadership experience at Genxcode, hands-on AI/ML & AWS Cloud projects, certified skills, and immediate availability for Internship 2026.',
  },
};

// ─── Live Portfolio Context ────────────────────────────────────
interface LivePortfolioContext {
  projects: Project[];
  certificates: Certificate[];
  customAbout: any;
  customSkills: any;
  customExperience: any;
  customProfile: any;
  loaded: boolean;
}

// ─── Build full text context for AI answering ─────────────────
function buildContext(live: LivePortfolioContext): string {
  const A = STATIC_DATA.about;
  const E = STATIC_DATA.education;
  const C = STATIC_DATA.contact;
  const EX = STATIC_DATA.experience;
  const SK = STATIC_DATA.skills;

  // Merge custom about if available
  const aboutData = live.customAbout ? { ...A, ...live.customAbout } : A;
  const skillsData = live.customSkills ? { ...SK, ...live.customSkills } : SK;
  const expData: typeof EX = live.customExperience?.length ? live.customExperience : EX;

  const projectLines = live.projects.length > 0
    ? live.projects.map((p, i) =>
        `  ${i + 1}. "${p.title}" [${p.category}] — ${p.description}` +
        (p.tags?.length ? ` | Tags: ${p.tags.join(', ')}` : '') +
        (p.link ? ` | Live: ${p.link}` : '') +
        (p.github ? ` | GitHub: ${p.github}` : '') +
        (p.longDescription ? `\n     Details: ${p.longDescription}` : '')
      ).join('\n')
    : '  (No projects stored in database yet — using default showcase)';

  const certLines = live.certificates.length > 0
    ? live.certificates.map((c, i) =>
        `  ${i + 1}. "${c.title}" by ${c.issuer} (${c.date})` +
        (c.certId ? ` | Cert ID: ${c.certId}` : '') +
        (c.verifyUrl ? ` | Verify: ${c.verifyUrl}` : '')
      ).join('\n')
    : '  (No certificates stored in database yet)';

  const expLines = expData.map((ex: any, i: number) =>
    `  ${i + 1}. ${ex.role} @ ${ex.company} (${ex.period})\n     ${ex.responsibilities || ex.description || ''}`
  ).join('\n');

  return `
=== NARENDRA GOND — LIVE PORTFOLIO DATA ===

[ABOUT]
Name: ${aboutData.name}
Role: ${aboutData.role}
Location: ${aboutData.location || C.location}
Summary: ${aboutData.summary || aboutData.tagline || ''}
Career Objective: ${aboutData.careerObjective || ''}
Development Philosophy: ${aboutData.developmentPhilosophy || ''}
Focus Areas: ${aboutData.focusArea || ''}

[EDUCATION]
Degree: ${E.degree} | University: ${E.university}, ${E.campus}
Period: ${E.period}
CGPA: ${E.cgpa} (Year 1: ${E.cgpaFirstYear}, Year 2: ${E.cgpaSecondYear})
Subjects: ${E.subjects}

[TECHNICAL SKILLS]
Core: ${skillsData.core?.join(', ') || SK.core.join(', ')}
Frontend: ${skillsData.frontend?.join(', ') || SK.frontend.join(', ')}
Backend: ${skillsData.backend?.join(', ') || SK.backend.join(', ')}
Databases: ${skillsData.databases?.join(', ') || SK.databases.join(', ')}
AI/ML: ${skillsData.ai?.join(', ') || SK.ai.join(', ')}
Cloud: ${skillsData.cloud?.join(', ') || SK.cloud.join(', ')}

[PROJECTS — LIVE FROM DATABASE]
${projectLines}

[CERTIFICATES — LIVE FROM DATABASE]
${certLines}

[EXPERIENCE & INTERNSHIPS]
${expLines}

[CONTACT]
Email: ${C.email}
Location: ${C.location}
GitHub: ${C.github} (@${C.githubUsername})
LinkedIn: ${C.linkedin} (ID: ${C.linkedinId})
Availability: ${C.availability}
Why Hire Narendra: ${C.whyHire}
`.trim();
}

// ─── Smart keyword-based local responder ──────────────────────
function generateLocalResponse(query: string, live: LivePortfolioContext): string {
  const q = query.toLowerCase().trim();
  const has = (...words: string[]) => words.some(w => q.includes(w));
  const A = STATIC_DATA.about;
  const E = STATIC_DATA.education;
  const C = STATIC_DATA.contact;
  const SK = STATIC_DATA.skills;
  const EX = live.customExperience?.length ? live.customExperience : STATIC_DATA.experience;

  // ── GREETING ──
  if (has('hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'हे')) {
    return `👋 Hello! I'm Narendra's AI Portfolio Assistant.\n\nI have live data from his portfolio — you can ask me about:\n• 👨‍💻 About & Background\n• 🎓 Education & CGPA\n• 🛠️ Skills & Technologies\n• 🚀 Projects (${live.projects.length} live from DB)\n• 🏆 Certificates (${live.certificates.length} live from DB)\n• 💼 Experience & Internships\n• 📧 Contact & Availability\n\nWhat would you like to know about Narendra?`;
  }

  // ── ABOUT ──
  if (has('who is', 'about narendra', 'tell me about', 'introduce', 'background', 'summary', 'bio', 'narendra gond', 'कोण आहे', 'नरेंद्र बद्दल')) {
    return `👨‍💻 **Narendra Gond** — ${A.role}\n\n${A.summary}\n\n📍 ${A.location}\n🎯 Career Goal: ${A.careerObjective}`;
  }
  if (has('location', 'where', 'city', 'address', 'pune', 'कुठे', 'कहाँ')) {
    return `📍 Narendra is based in **${A.location}**. He is actively looking for opportunities and is open to remote/hybrid roles as well.`;
  }
  if (has('philosophy', 'coding style', 'approach', 'how code')) {
    return `💡 **Development Philosophy:**\n${A.developmentPhilosophy}`;
  }
  if (has('career goal', 'objective', 'aim', 'target', 'focus area', 'लक्ष्य', 'ध्येय')) {
    return `🎯 **Career Objective:**\n${A.careerObjective}\n\n🔭 **Focus Areas:** ${A.focusArea}`;
  }

  // ── EDUCATION ──
  if (has('education', 'college', 'university', 'degree', 'jspm', 'branch', 'engineering', 'शिक्षण', 'कॉलेज')) {
    return `🎓 **Education:**\n${E.degree}\n📍 ${E.university}, ${E.campus}\n📅 ${E.period}\n📚 Subjects: ${E.subjects}`;
  }
  if (has('cgpa', 'marks', 'grade', 'score', 'percentage', 'first year', '1st year', 'second year', '2nd year', 'गुण', 'अंक')) {
    return `📊 **Academic Performance:**\n• Average CGPA: **${E.cgpa}**\n• 1st Year: ${E.cgpaFirstYear}\n• 2nd Year: ${E.cgpaSecondYear}`;
  }
  if (has('subject', 'course', 'curriculum', 'विषय')) {
    return `📚 **Academic Subjects:**\n${E.subjects}`;
  }
  if (has('how start', 'begin', 'first program', 'सुरुवात', 'शुरुआत')) {
    return `🌱 Narendra started his programming journey with **C Language** in his 1st year of B-Tech. His interest grew into DSA → Python → Full-Stack Web Development → AI/ML & Cloud.`;
  }

  // ── SKILLS ──
  if (has('python')) {
    return `🐍 **Python** is Narendra's primary language!\n• OOP & functional programming\n• ML models with Scikit-Learn\n• NLP pipelines with NLTK & SpaCy\n• AWS cloud automation with Boto3\n• Used in AI portfolio, VisionTrack & EduSkills internships`;
  }
  if (has('dsa', 'data structure', 'algorithm', 'big-o', 'tree', 'graph', 'linked list')) {
    return `🧮 **DSA & Algorithms** is Narendra's core specialisation:\nLists, Stacks, Queues, Trees, Graphs, Big-O Analysis.\nHe applies DSA in competitive problem solving and system design at Genxcode.`;
  }
  if (has('c language', 'core c', 'c lang', 'सी भाषा')) {
    return `⚙️ **Core C Language** is Narendra's foundation language.\nHe led C code reviews at Genxcode and uses it for systems-level problem solving and algorithm implementation.`;
  }
  if (has('react', 'frontend', 'ui', 'html', 'css', 'typescript', 'javascript')) {
    return `🎨 **Frontend Skills:**\n${SK.frontend.join(', ')}\n\nHe uses React + Vite + TypeScript for all his web applications including this portfolio and VisionTrack.`;
  }
  if (has('node', 'backend', 'express', 'server', 'api')) {
    return `⚙️ **Backend Skills:**\n${SK.backend.join(', ')}\nDatabases: ${SK.databases.join(', ')}`;
  }
  if (has('aws', 'cloud', 's3', 'ec2', 'boto3')) {
    return `☁️ **AWS Cloud Experience:**\n• Amazon S3 buckets & EC2 virtual machines\n• Boto3 Python SDK automation scripts\n• Completed AIML & AWS Cloud Internship at EduSkills (June 2025)`;
  }
  if (has('ai', 'ml', 'machine learning', 'gemini', 'openai', 'nlp', 'rag', 'generative')) {
    return `🤖 **AI/ML Skills:**\n${SK.ai.join(', ')}\n\nHe completed a GenAI, ML & NLP internship at EduSkills (June 2026), building NLP pipelines with NLTK & SpaCy and RAG workflows.`;
  }
  if (has('computer vision', 'face recognition', 'opencv')) {
    return `👁️ **Computer Vision:** Narendra built the VisionTrack AI Attendance System using face recognition technology that auto-detects student faces via camera and logs attendance into Firebase cloud storage.`;
  }
  if (has('full stack', 'fullstack', 'full-stack')) {
    return `💻 **Full-Stack Development:**\n• Frontend: ${SK.frontend.join(', ')}\n• Backend: ${SK.backend.join(', ')}\n• Databases: ${SK.databases.join(', ')}\n• Cloud: ${SK.cloud.join(', ')}`;
  }
  if (has('skill', 'technology', 'tech stack', 'what can', 'कौशल्य', 'स्किल', 'tools')) {
    return `🛠️ **Narendra's Full Tech Stack:**\n\n• **Core:** ${SK.core.join(', ')}\n• **Frontend:** ${SK.frontend.join(', ')}\n• **Backend:** ${SK.backend.join(', ')}\n• **Databases:** ${SK.databases.join(', ')}\n• **AI/ML:** ${SK.ai.join(', ')}\n• **Cloud:** ${SK.cloud.join(', ')}`;
  }

  // ── PROJECTS (LIVE DATA) ──
  if (has('project', 'projets', 'what build', 'what made', 'प्रोजेक्ट', 'बनाए')) {
    if (live.projects.length === 0) {
      return `🚀 Narendra has built several impressive projects!\n\n1. **VisionTrack** — AI Face Recognition Attendance System\n2. **Local Skill Exchange Platform** — P2P Credit & Escrow learning\n3. **Placement Portal System** — Enterprise recruitment with resume scraping\n4. **Interactive AI Portfolio** — This website (React + Gemini AI)\n\n(Live DB sync in progress — ask me about any specific project!)`;
    }
    const list = live.projects.map((p, i) => `${i + 1}. **${p.title}** [${p.category}]\n   ${p.description}${p.link ? `\n   🔗 Live: ${p.link}` : ''}`).join('\n\n');
    return `🚀 **Narendra's Projects** (${live.projects.length} from live database):\n\n${list}\n\nAsk me about any project for more details!`;
  }

  // Dynamic project search from live DB
  for (const project of live.projects) {
    const titleWords = project.title.toLowerCase().split(/\s+/);
    const tagWords = (project.tags || []).map(t => t.toLowerCase());
    const allWords = [...titleWords, ...tagWords];
    if (allWords.some(w => w.length > 3 && q.includes(w)) || q.includes(project.title.toLowerCase())) {
      return `🚀 **${project.title}**\n📂 Category: ${project.category}\n\n${project.description}${project.longDescription ? `\n\n${project.longDescription}` : ''}${project.tags?.length ? `\n\n🏷️ Tags: ${project.tags.join(', ')}` : ''}${project.link ? `\n🔗 Live Demo: ${project.link}` : ''}${project.github ? `\n💻 GitHub: ${project.github}` : ''}`;
    }
  }

  // Specific static project fallbacks
  if (has('visiontrack', 'vision track', 'face recog', 'attendance')) {
    return `👁️ **VisionTrack — AI Attendance & Face Recognition System**\n\nAn AI-powered attendance management web app that uses Computer Vision to automate attendance in real time.\n\n🔬 How it works: The camera feed detects student faces → recognises profiles → logs attendance with timestamps into Firebase cloud storage.\n\n⚙️ Tech: React, Vite, JavaScript, Firebase, AI, Computer Vision, Netlify\n🔗 Live: https://6a2c25951868ad16ea8ba5fe--visontrack.netlify.app/\n📊 Status: ~60% complete — in progress`;
  }
  if (has('skill exchange', 'escrow', 'credit based', 'p2p', 'peer')) {
    return `🔄 **Local Skill Exchange Platform**\n\nA peer-to-peer learning platform where users teach & learn skills using a credit-based economy with secure credit escrow.\n\n💡 AI Matching: Analyses user profiles, listed skills, and availability to pair compatible skill-exchange partners.\n\n⚙️ Tech: React, Node.js, Supabase, AI Matching Engine`;
  }
  if (has('placement portal', 'resume scrap', 'recruitment')) {
    return `🏢 **Placement Portal System**\n\nAn enterprise recruitment pipeline managing student applicants, job listings, automated resume scraping, and cloud infrastructure cost estimation.\n\n⚙️ Tech: React, Scraper API, Supabase, Cloud Infrastructure`;
  }
  if (has('this portfolio', 'this website', 'ai portfolio', 'how built', 'how is this site')) {
    return `💼 **Interactive AI Portfolio Website** — This website!\n\nFull-stack interactive application with:\n• Embedded Gemini AI assistant (me!)\n• Real-time Supabase database sync\n• Owner edit mode with password protection\n• Dark mode + Framer Motion animations\n• Multilingual AI support (English, Hindi, Marathi)\n\n⚙️ Tech: React + Vite + TypeScript + Tailwind CSS + Node.js + Google Gemini API + Supabase`;
  }

  // ── CERTIFICATES (LIVE DATA) ──
  if (has('certificate', 'certification', 'certified', 'cert', 'award', 'सर्टिफिकेट', 'प्रमाणपत्र')) {
    if (live.certificates.length === 0) {
      return `🏆 Narendra has earned professional certifications in AI/ML, AWS Cloud, and Web Development.\n\n(Live certificate data is loading from database — check the Certificates section on the portfolio for the full list with verification links!)`;
    }
    const list = live.certificates.map((c, i) =>
      `${i + 1}. **${c.title}**\n   📋 Issued by: ${c.issuer} | 📅 ${c.date}${c.certId ? `\n   🔑 Cert ID: ${c.certId}` : ''}${c.verifyUrl ? `\n   ✅ Verify: ${c.verifyUrl}` : ''}`
    ).join('\n\n');
    return `🏆 **Narendra's Certificates** (${live.certificates.length} from live database):\n\n${list}`;
  }

  // Dynamic certificate search from live DB
  for (const cert of live.certificates) {
    const titleWords = cert.title.toLowerCase().split(/\s+/);
    if (titleWords.some(w => w.length > 3 && q.includes(w)) || q.includes(cert.issuer.toLowerCase())) {
      return `🏆 **${cert.title}**\n📋 Issued by: **${cert.issuer}**\n📅 Date: ${cert.date}${cert.certId ? `\n🔑 Certificate ID: ${cert.certId}` : ''}${cert.verifyUrl ? `\n✅ Verify: ${cert.verifyUrl}` : ''}`;
    }
  }

  // ── EXPERIENCE ──
  if (has('genxcode', 'project director', 'team lead')) {
    const ex = EX[0] as any;
    return `💼 **${ex.role} @ ${ex.company}** (${ex.period})\n\n${ex.responsibilities || ex.description}\n\n🛠️ Skills used: ${(ex.skills || []).join(', ')}`;
  }
  if (has('eduskills', 'edu skill', 'nlp intern', 'genai intern', 'rag')) {
    const ex2 = EX[2] as any;
    return `🧠 **${ex2.role} @ ${ex2.company}** (${ex2.period})\n\n${ex2.responsibilities || ex2.description}\n\n🛠️ Skills: ${(ex2.skills || []).join(', ')}`;
  }
  if (has('aws intern', 'cloud intern', 'eduskills aws', 'scikit')) {
    const ex1 = EX[1] as any;
    return `☁️ **${ex1.role} @ ${ex1.company}** (${ex1.period})\n\n${ex1.responsibilities || ex1.description}\n\n🛠️ Skills: ${(ex1.skills || []).join(', ')}`;
  }
  if (has('experience', 'internship', 'work', 'job', 'company', 'अनुभव', 'इंटर्नशिप', 'काम')) {
    const lines = (EX as any[]).map((ex: any, i: number) =>
      `${i + 1}. **${ex.role}** @ ${ex.company} (${ex.period})`
    ).join('\n');
    return `💼 **Narendra's Experience:**\n\n${lines}\n\nAsk me about any specific role for full details!`;
  }

  // ── CONTACT ──
  if (has('email', 'mail', 'ईमेल', 'इमेल')) {
    return `📧 Narendra's official email: **${C.email}**\n\nYou can also use the Contact Form on this portfolio to send him a direct message!`;
  }
  if (has('github', 'git hub', 'repository', 'repo', 'code')) {
    return `💻 GitHub: **${C.github}**\nUsername: @${C.githubUsername}\n\nClick the GitHub link in the Contact section to visit his profile!`;
  }
  if (has('linkedin', 'linked in')) {
    return `🔗 LinkedIn: **${C.linkedin}**\nProfile ID: ${C.linkedinId}\n\nClick the LinkedIn link in the Contact section to connect!`;
  }
  if (has('contact', 'reach', 'message', 'संपर्क', 'connect')) {
    return `📬 **Contact Narendra:**\n\n📧 Email: ${C.email}\n💻 GitHub: ${C.github}\n🔗 LinkedIn: ${C.linkedin}\n📍 Location: ${C.location}\n\nOr use the **Contact Form** directly on this portfolio!`;
  }
  if (has('hire', 'hiring', 'available', 'internship 2026', 'recruit', 'opportunity', 'open to work')) {
    return `✅ **Hiring Status:**\n${C.availability}\n\n🌟 **Why hire Narendra?**\n${C.whyHire}`;
  }

  // ── DATA STATUS ──
  if (has('live data', 'database', 'supabase', 'how many project', 'how many cert', 'sync')) {
    return `📊 **Live Portfolio Data Status:**\n• 🚀 Projects loaded: **${live.projects.length}** (from Supabase)\n• 🏆 Certificates loaded: **${live.certificates.length}** (from Supabase)\n• 🔄 Data syncs in real-time across all devices\n\n${live.loaded ? '✅ Database connection active' : '⚠️ Using cached data'}`;
  }

  // ── DEFAULT FRIENDLY FALLBACK ──
  return `🤔 I didn't quite catch that — but I'm here to help!\n\n**What would you like to know about Narendra Gond?**\n\n• 👨‍💻 **About** — background, bio, philosophy\n• 🎓 **Education** — JSPM University, CGPA, subjects\n• 🛠️ **Skills** — Python, DSA, React, AI/ML, AWS\n• 🚀 **Projects** — ${live.projects.length > 0 ? `${live.projects.length} live projects: ${live.projects.slice(0, 2).map(p => p.title).join(', ')}...` : 'VisionTrack, Skill Exchange, Placement Portal...'}\n• 🏆 **Certificates** — ${live.certificates.length > 0 ? `${live.certificates.length} certifications` : 'professional certifications'}\n• 💼 **Experience** — Genxcode, EduSkills internships\n• 📧 **Contact** — email, GitHub, LinkedIn, availability\n\nJust ask naturally — I understand English, हिंदी, and मराठी! 😊`;
}

// ─── Main Component ────────────────────────────────────────────
export default function PortfolioChat() {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedLang, setSelectedLang] = useState<'mr-IN' | 'hi-IN' | 'en-US'>('en-US');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [liveData, setLiveData] = useState<LivePortfolioContext>({
    projects: [],
    certificates: [],
    customAbout: null,
    customSkills: null,
    customExperience: null,
    customProfile: null,
    loaded: false,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `👋 Hi! I'm Narendra's AI Portfolio Assistant.\n\nFetching live portfolio data... 🔄\n\nYou can ask me about his skills, projects, certificates, experience, education, and more — in English, हिंदी, or मराठी!`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Fetch all live portfolio data on mount ──
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoadingData(true);
      try {
        const [projects, certificates, customAbout, customSkills, customExperience, customProfile] =
          await Promise.allSettled([
            fetchProjects(),
            fetchCertificates(),
            fetchPortfolioSetting<any>('portfolio_custom_about'),
            fetchPortfolioSetting<any>('portfolio_custom_skills'),
            fetchPortfolioSetting<any>('portfolio_custom_experience'),
            fetchPortfolioSetting<any>('portfolio_custom_profile'),
          ]);

        const newData: LivePortfolioContext = {
          projects: projects.status === 'fulfilled' && projects.value ? projects.value : [],
          certificates: certificates.status === 'fulfilled' && certificates.value ? certificates.value : [],
          customAbout: customAbout.status === 'fulfilled' ? customAbout.value : null,
          customSkills: customSkills.status === 'fulfilled' ? customSkills.value : null,
          customExperience: customExperience.status === 'fulfilled' ? customExperience.value : null,
          customProfile: customProfile.status === 'fulfilled' ? customProfile.value : null,
          loaded: true,
        };

        setLiveData(newData);

        const projectCount = newData.projects.length;
        const certCount = newData.certificates.length;

        setMessages(prev => [
          ...prev,
          {
            id: 'data-loaded',
            sender: 'ai',
            text: `✅ **Live data loaded!**\n• 🚀 ${projectCount} project${projectCount !== 1 ? 's' : ''} from database\n• 🏆 ${certCount} certificate${certCount !== 1 ? 's' : ''} from database\n\n**What would you like to know about Narendra?** Ask me anything! 😊`,
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        setLiveData(prev => ({ ...prev, loaded: true }));
        setMessages(prev => [
          ...prev,
          {
            id: 'data-fallback',
            sender: 'ai',
            text: `ℹ️ Using cached portfolio data. I can still answer all questions about Narendra's skills, projects, experience, and more!\n\nWhat would you like to know? 😊`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAllData();
  }, []);

  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [projects, certificates] = await Promise.allSettled([fetchProjects(), fetchCertificates()]);
      setLiveData(prev => ({
        ...prev,
        projects: projects.status === 'fulfilled' && projects.value ? projects.value : prev.projects,
        certificates: certificates.status === 'fulfilled' && certificates.value ? certificates.value : prev.certificates,
      }));
      addAIMessage(`🔄 Data refreshed!\n• 🚀 Projects: ${projects.status === 'fulfilled' && projects.value ? projects.value.length : 0}\n• 🏆 Certificates: ${certificates.status === 'fulfilled' && certificates.value ? certificates.value.length : 0}`);
    } catch (e) {
      addAIMessage('⚠️ Refresh failed — still using cached data.');
    } finally {
      setIsLoadingData(false);
    }
  };

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
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  useEffect(() => {
    const hasSpeechSupport =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (!hasSpeechSupport) { setIsSpeechSupported(false); return; }

    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const speech = new SR();
      speech.continuous = false;
      speech.interimResults = true;
      speech.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setInput(transcript);
        setMicError(null);
        if (event.results[0].isFinal) handleSend(transcript);
      };
      speech.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') setMicError('Microphone blocked. Check browser permissions.');
        else setMicError(`Mic error: ${event.error}`);
      };
      speech.onend = () => setIsListening(false);
      recognitionRef.current = speech;
    } catch { setIsSpeechSupported(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { return () => stopSpeaking(); }, []);

  const addAIMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text, timestamp: new Date() }]);
  };

  const speakResponse = (text: string) => {
    if (isMuted) return;
    stopSpeaking();
    const clean = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_#`•📌💻💼🎓👋📫🚀🏆☁️🧮👁️🔄✅ℹ️⚠️🤔😊🐍🎨⚙️💡🎯🌱📊📬📧🔗🏢]/g, '').trim();
    if (!clean) return;

    const isDevanagari = /[\u0900-\u097F]/.test(clean);
    const marathiKws = ['आहे', 'नाही', 'बद्दल', 'करा', 'माझे', 'कुठे', 'सांगा', 'नमस्कार'];
    let langCode = 'en';
    if (isDevanagari) langCode = marathiKws.some(w => clean.includes(w)) ? 'mr' : 'hi';
    const targetLang = langCode === 'mr' ? 'mr-IN' : langCode === 'hi' ? 'hi-IN' : 'en-US';

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const vs = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      const matched = vs.find(v => v.lang.toLowerCase().startsWith(langCode));
      const utterance = new SpeechSynthesisUtterance(clean.substring(0, 300));
      utterance.lang = matched?.lang || targetLang;
      if (matched) utterance.voice = matched;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
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
        setTimeout(() => { recognitionRef.current.start(); setIsListening(true); }, 50);
      } catch { setIsListening(false); }
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    stopSpeaking();
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }

    const userMsg: Message = { id: Math.random().toString(), sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setMicError(null);

    // Build context with live data for backend prompt
    const context = buildContext(liveData);
    let aiReplyText = '';

    try {
      // Try backend with full live context
      let response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, context }),
      }).catch(() => null);

      if (!response || !response.ok) {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSend, context }),
        }).catch(() => null);
      }

      if (response && response.ok) {
        const data = await response.json();
        aiReplyText = data.reply || data.response || data.message;
      } else {
        throw new Error('Backend unavailable');
      }
    } catch {
      // Local smart fallback with live data
      aiReplyText = generateLocalResponse(textToSend, liveData);
    }

    const aiMsg: Message = { id: Math.random().toString(), sender: 'ai', text: aiReplyText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    speakResponse(aiReplyText);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLoadingData ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="font-headline font-bold text-xs text-zinc-200">Portfolio Assistant 3.0</span>
          {isLoadingData && <span className="text-[9px] text-amber-400 font-semibold">fetching data…</span>}
          {!isLoadingData && liveData.loaded && (
            <span className="text-[9px] text-emerald-400 font-semibold">
              {liveData.projects.length}P • {liveData.certificates.length}C live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={refreshData}
            disabled={isLoadingData}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer disabled:opacity-40"
            title="Refresh live data from database"
          >
            <RefreshCw size={12} className={isLoadingData ? 'animate-spin' : ''} />
          </button>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-md border border-zinc-700 focus:outline-none cursor-pointer"
          >
            <option value="en-US">English (EN)</option>
            <option value="hi-IN">हिंदी (HI)</option>
            <option value="mr-IN">मराठी (MR)</option>
          </select>

          <button
            onClick={() => { if (isMuted) { setIsMuted(false); } else { setIsMuted(true); stopSpeaking(); } }}
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
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <Sparkles size={12} className="text-primary" />
              </div>
            )}
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
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input); }}
          placeholder="Ask about skills, projects, certificates…"
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