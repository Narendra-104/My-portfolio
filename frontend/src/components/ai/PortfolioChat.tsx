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
// ─── Language Detection Helper ─────────────────────────────────
function detectQueryLanguage(query: string, currentSelectedLang: string = 'en-US'): 'mr' | 'hi' | 'en' {
  const q = query.toLowerCase().trim();

  // Explicit Marathi request keywords
  if (
    q.includes('marathi') ||
    q.includes('मराठी') ||
    q.includes('marathit') ||
    q.includes('मराठीत') ||
    q.includes('marathi madhe') ||
    q.includes('मराठी मध्ये')
  ) {
    if (q.includes('hindi') || q.includes('हिंदी')) return 'hi';
    return 'mr';
  }

  // Explicit Hindi request keywords
  if (
    q.includes('hindi') ||
    q.includes('हिंदी') ||
    q.includes('hindit') ||
    q.includes('हिंदी में') ||
    q.includes('hindi me')
  ) {
    if (q.includes('marathi') || q.includes('मराठी')) return 'mr';
    return 'hi';
  }

  // Devanagari script vocabulary analysis
  if (/[\u0900-\u097F]/.test(query)) {
    const marathiWords = ['आहे', 'नाही', 'बद्दल', 'करा', 'माझे', 'कुठे', 'सांगा', 'नमस्कार', 'तुम्ही', 'प्रकल्प', 'प्रमाणपत्र', 'शिक्षण', 'कौशल्य', 'अनुभव', 'संपर्क', 'बोला', 'सांग', 'मराठी', 'हॅलो', 'काय', 'माहिती'];
    const hindiWords = ['है', 'हैं', 'नहीं', 'के बारे में', 'करें', 'मेरा', 'कहाँ', 'बताइए', 'नमस्ते', 'परियोजना', 'प्रमाणपत्र', 'शिक्षा', 'कौशल', 'अनुभव', 'संपर्क', 'बताओ', 'बोलो', 'हिंदी', 'क्या', 'जानकारी'];

    const hasMr = marathiWords.some(w => q.includes(w));
    const hasHi = hindiWords.some(w => q.includes(w));
    if (hasMr && !hasHi) return 'mr';
    if (hasHi && !hasMr) return 'hi';
    if (currentSelectedLang.startsWith('mr')) return 'mr';
    if (currentSelectedLang.startsWith('hi')) return 'hi';
    return 'mr';
  }

  if (currentSelectedLang === 'mr-IN') return 'mr';
  if (currentSelectedLang === 'hi-IN') return 'hi';

  return 'en';
}

// ─── Smart keyword-based local responder ──────────────────────
function generateLocalResponse(query: string, live: LivePortfolioContext, selectedLang: string = 'en-US'): string {
  const q = query.toLowerCase().trim();
  const lang = detectQueryLanguage(query, selectedLang);

  // Broad keyword checker — checks both raw query and normalized query
  const has = (...words: string[]) => words.some(w => q.includes(w));

  const A = STATIC_DATA.about;
  const E = STATIC_DATA.education;
  const C = STATIC_DATA.contact;
  const SK = STATIC_DATA.skills;
  const EX = live.customExperience?.length ? live.customExperience : STATIC_DATA.experience;

  // ── GREETING ──
  if (has('greeting', 'hi ', 'hello', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'हे', 'हॅलो', 'हैलो') || q === 'hi') {
    if (lang === 'mr') {
      return `👋 नमस्कार! मी नरेंद्रचा AI पोर्टफोलिओ सहाय्यक आहे.\n\nमाझ्याकडे त्याच्या पोर्टफोलिओचा थेट डेटा आहे — तुम्ही मला विचारू शकता:\n• 👨‍💻 परिचय आणि पार्श्वभूमी (About)\n• 🎓 शिक्षण आणि CGPA (Education)\n• 🛠️ कौशल्ये आणि तंत्रज्ञान (Skills)\n• 🚀 प्रकल्प (${live.projects.length} लाइव्ह DB मधून)\n• 🏆 प्रमाणपत्रे (${live.certificates.length} लाइव्ह DB मधून)\n• 💼 अनुभव आणि इंटर्नशिप (Experience)\n• 📧 संपर्क आणि उपलब्धता (Contact)\n\nतुम्हाला नरेंद्रबद्दल काय जाणून घ्यायचे आहे?`;
    }
    if (lang === 'hi') {
      return `👋 नमस्ते! मैं नरेंद्र का AI पोर्टफोलियो सहायक हूँ।\n\nमेरे पास उनके पोर्टफोलियो का लाइव डेटा है — आप मुझसे पूछ सकते हैं:\n• 👨‍💻 परिचय और पृष्ठभूमि (About)\n• 🎓 शिक्षा और CGPA (Education)\n• 🛠️ कौशल और तकनीक (Skills)\n• 🚀 प्रोजेक्ट्स (${live.projects.length} लाइव DB से)\n• 🏆 प्रमाण पत्र (${live.certificates.length} लाइव DB से)\n• 💼 अनुभव और इंटर्नशिप (Experience)\n• 📧 संपर्क और उपलब्धता (Contact)\n\nआप नरेंद्र के बारे में क्या जानना चाहते हैं?`;
    }
    return `👋 Hello! I'm Narendra's AI Portfolio Assistant.\n\nI have live data from his portfolio — you can ask me about:\n• 👨‍💻 About & Background\n• 🎓 Education & CGPA\n• 🛠️ Skills & Technologies\n• 🚀 Projects (${live.projects.length} live from DB)\n• 🏆 Certificates (${live.certificates.length} live from DB)\n• 💼 Experience & Internships\n• 📧 Contact & Availability\n\nWhat would you like to know about Narendra?`;
  }

  // ── ABOUT ──
  if (has(
    'who is', 'who are', 'about narendra', 'tell me about', 'about him', 'tell about narendra',
    'introduce', 'introduction', 'background', 'summary', 'bio', 'narendra gond', 'owner',
    'portfolio', 'portfoilio', 'portfilio', 'whose', 'narendra kaun',
    'कोण आहे', 'नरेंद्र बद्दल', 'बारे में', 'परिचय', 'नरेंद्र कोण', 'about'
  ) && !has('project', 'skill', 'certif', 'education', 'contact', 'experience')) {
    if (lang === 'mr') {
      return `👨‍💻 **नरेंद्र गोंड** — ${A.role}\n\n${A.summary}\n\n📍 स्थान: **${A.location}**\n🎯 करिअरचे ध्येय: ${A.careerObjective}`;
    }
    if (lang === 'hi') {
      return `👨‍💻 **नरेंद्र गोंड** — ${A.role}\n\n${A.summary}\n\n📍 स्थान: **${A.location}**\n🎯 करियर का लक्ष्य: ${A.careerObjective}`;
    }
    return `👨‍💻 **Narendra Gond** — ${A.role}\n\n${A.summary}\n\n📍 ${A.location}\n🎯 Career Goal: ${A.careerObjective}`;
  }

  if (has('location', 'where', 'city', 'address', 'pune', 'कुठे', 'कहाँ')) {
    if (lang === 'mr') {
      return `📍 नरेंद्र **${A.location}** मध्ये राहतो. तो नवीन संधींसाठी उत्सुक असून रिमोट आणि हायब्रिड रोलसाठी उपलब्ध आहे.`;
    }
    if (lang === 'hi') {
      return `📍 नरेंद्र **${A.location}** में स्थित हैं। वे नए अवसरों की तलाश में हैं और रिमोट/हाइब्रिड भूमिकाओं के लिए उपलब्ध हैं।`;
    }
    return `📍 Narendra is based in **${A.location}**. He is actively looking for opportunities and is open to remote/hybrid roles as well.`;
  }

  if (has('career goal', 'objective', 'aim', 'target', 'focus area', 'लक्ष्य', 'ध्येय')) {
    if (lang === 'mr') {
      return `🎯 **करिअरचे ध्येय:**\n${A.careerObjective}\n\n🔭 **लक्ष्य क्षेत्र:** ${A.focusArea}`;
    }
    if (lang === 'hi') {
      return `🎯 **करियर का लक्ष्य:**\n${A.careerObjective}\n\n🔭 **मुख्य फोकस:** ${A.focusArea}`;
    }
    return `🎯 **Career Objective:**\n${A.careerObjective}\n\n🔭 **Focus Areas:** ${A.focusArea}`;
  }

  // ── EDUCATION ──
  if (has(
    'education', 'college', 'university', 'degree', 'jspm', 'branch', 'engineering',
    'study', 'studies', 'course', 'sikshan', 'shikshan', 'शिक्षण', 'शिक्षा', 'कॉलेज',
    'विश्वविद्यालय', 'डिग्री', 'b-tech', 'btech', 'b.tech', 'cse'
  )) {
    if (lang === 'mr') {
      return `🎓 **शिक्षण (Education):**\n• पदवी: **${E.degree}**\n📍 विद्यापीठ: ${E.university}, ${E.campus}\n📅 कालावधी: ${E.period}\n📚 मुख्य विषय: ${E.subjects}`;
    }
    if (lang === 'hi') {
      return `🎓 **शिक्षा (Education):**\n• डिग्री: **${E.degree}**\n📍 विश्वविद्यालय: ${E.university}, ${E.campus}\n📅 अवधि: ${E.period}\n📚 मुख्य विषय: ${E.subjects}`;
    }
    return `🎓 **Education:**\n${E.degree}\n📍 ${E.university}, ${E.campus}\n📅 ${E.period}\n📚 Subjects: ${E.subjects}`;
  }

  if (has('cgpa', 'marks', 'grade', 'score', 'percentage', 'first year', '1st year', 'second year', '2nd year', 'गुण', 'अंक')) {
    if (lang === 'mr') {
      return `📊 **शैक्षणिक कामगिरी (CGPA):**\n• सरासरी CGPA: **${E.cgpa} / 10**\n• प्रथम वर्ष: ${E.cgpaFirstYear}\n• द्वितीय वर्ष: ${E.cgpaSecondYear}`;
    }
    if (lang === 'hi') {
      return `📊 **शैक्षणिक प्रदर्शन (CGPA):**\n• औसत CGPA: **${E.cgpa} / 10**\n• प्रथम वर्ष: ${E.cgpaFirstYear}\n• द्वितीय वर्ष: ${E.cgpaSecondYear}`;
    }
    return `📊 **Academic Performance:**\n• Average CGPA: **${E.cgpa}**\n• 1st Year: ${E.cgpaFirstYear}\n• 2nd Year: ${E.cgpaSecondYear}`;
  }

  // ── SKILLS ──
  if (has(
    'skill', 'skills', 'technology', 'tech stack', 'tech', 'what can', 'what know',
    'tools', 'python', 'react', 'dsa', 'aws', 'node', 'javascript', 'typescript',
    'machine learning', 'artificial', 'frontend', 'backend', 'database',
    'कौशल्य', 'कौशल', 'स्किल', 'तंत्रज्ञान', 'कौशल्ये'
  )) {
    if (lang === 'mr') {
      return `🛠️ **नरेंद्रची संपूर्ण तांत्रिक कौशल्ये (Tech Stack):**\n\n• **मुख्य (Core):** ${SK.core.join(', ')}\n• **फ्रंटएंड (Frontend):** ${SK.frontend.join(', ')}\n• **बॅकएंड (Backend):** ${SK.backend.join(', ')}\n• **डेटाबेस (Databases):** ${SK.databases.join(', ')}\n• **AI/ML:** ${SK.ai.join(', ')}\n• **क्लाउड (Cloud):** ${SK.cloud.join(', ')}`;
    }
    if (lang === 'hi') {
      return `🛠️ **नरेंद्र का पूरा तकनीकी कौशल (Tech Stack):**\n\n• **मुख्य (Core):** ${SK.core.join(', ')}\n• **फ्रंटएंड (Frontend):** ${SK.frontend.join(', ')}\n• **बैकएंड (Backend):** ${SK.backend.join(', ')}\n• **डेटाबेस (Databases):** ${SK.databases.join(', ')}\n• **AI/ML:** ${SK.ai.join(', ')}\n• **क्लाउड (Cloud):** ${SK.cloud.join(', ')}`;
    }
    return `🛠️ **Narendra's Full Tech Stack:**\n\n• **Core:** ${SK.core.join(', ')}\n• **Frontend:** ${SK.frontend.join(', ')}\n• **Backend:** ${SK.backend.join(', ')}\n• **Databases:** ${SK.databases.join(', ')}\n• **AI/ML:** ${SK.ai.join(', ')}\n• **Cloud:** ${SK.cloud.join(', ')}`;
  }

  // ── PROJECTS ──
  if (has(
    'project', 'projects', 'projets', 'prakalp', 'prakel', 'proje', 'work made',
    'what build', 'what built', 'what made', 'portfolio project', 'built what',
    'anout project', 'about project', 'tell project', 'show project',
    'प्रोजेक्ट', 'प्रकल्प', 'बनाए', 'प्रकल्पे', 'परियोजना'
  )) {
    if (live.projects.length > 0) {
      const list = live.projects.map((p, i) => `${i + 1}. **${p.title}** [${p.category}]\n   ${p.description}${p.link ? `\n   🔗 Live: ${p.link}` : ''}`).join('\n\n');
      if (lang === 'mr') {
        return `🚀 **नरेंद्रचे प्रकल्प** (${live.projects.length} डेटाबेस मधून लाइव्ह):\n\n${list}\n\nकोणत्याही प्रकल्पाबद्दल अधिक सविस्तर माहितीसाठी विचारू शकता!`;
      }
      if (lang === 'hi') {
        return `🚀 **नरेंद्र के प्रोजेक्ट्स** (${live.projects.length} डेटाबेस से लाइव):\n\n${list}\n\nकिसी भी प्रोजेक्ट के बारे में विस्तार से जानने के लिए पूछें!`;
      }
    } else {
      // Static project data as fallback when DB is empty
      const staticProjects = [
        { title: 'VisionTrack', category: 'Computer Vision / AI', description: 'A real-time face recognition and attendance tracking system built using OpenCV, Python, and Firebase. Automates attendance logging with live camera feed.', tech: 'Python, OpenCV, Firebase, Face Recognition' },
        { title: 'Skill Exchange Platform', category: 'Full-Stack Web App', description: 'A peer-to-peer skill-sharing platform where users can exchange skills and knowledge. Built with React, Node.js, Supabase, and Tailwind CSS.', tech: 'React, Node.js, Supabase, TailwindCSS' },
        { title: 'Placement Portal', category: 'Full-Stack / AI', description: 'A college placement management portal with AI-powered resume analysis, job matching, and student tracking. Built with React, Express.js, and Gemini API.', tech: 'React, Express.js, Google Gemini API, MongoDB' },
      ];
      const list = staticProjects.map((p, i) => `${i + 1}. **${p.title}** [${p.category}]\n   ${p.description}\n   🛠️ Tech: ${p.tech}`).join('\n\n');
      if (lang === 'mr') {
        return `🚀 **नरेंद्रचे प्रमुख प्रकल्प:**\n\n${list}\n\nकोणत्याही प्रकल्पाबद्दल अधिक माहितीसाठी विचारा!`;
      }
      if (lang === 'hi') {
        return `🚀 **नरेंद्र के प्रमुख प्रोजेक्ट्स:**\n\n${list}\n\nकिसी भी प्रोजेक्ट के बारे में अधिक जानकारी के लिए पूछें!`;
      }
      return `🚀 **Narendra's Key Projects:**\n\n${list}\n\nAsk me about any project for more details!`;
    }
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

  // ── CERTIFICATES ──
  if (has(
    'certificate', 'certification', 'certified', 'cert', 'award', 'achievement',
    'certif', 'credentials', 'tell about cert', 'show cert',
    'सर्टिफिकेट', 'प्रमाणपत्र', 'प्रमाणपत्रे', 'सर्टिफ़िकेट'
  )) {
    if (live.certificates.length > 0) {
      const certList = live.certificates.map((c, i) =>
        `${i + 1}. **${c.title}**\n   📋 Issued by: ${c.issuer} | 📅 ${c.date}${c.certId ? `\n   🔑 Cert ID: ${c.certId}` : ''}${c.verifyUrl ? `\n   ✅ Verify: ${c.verifyUrl}` : ''}`
      ).join('\n\n');

      if (lang === 'mr') {
        return `🏆 **नरेंद्रची प्रमाणपत्रे** (${live.certificates.length} डेटाबेस मधून लाइव्ह):\n\n${certList}`;
      }
      if (lang === 'hi') {
        return `🏆 **नरेंद्र के प्रमाण पत्र** (${live.certificates.length} डेटाबेस से लाइव):\n\n${certList}`;
      }
      return `🏆 **Narendra's Certificates** (${live.certificates.length} from live database):\n\n${certList}`;
    } else {
      // Static certificate fallback
      const staticCerts = [
        { title: 'AIML Virtual Internship Certificate', issuer: 'EduSkills Foundation (AICTE-Supported)', date: 'June 2025', detail: 'Supervised ML, Scikit-Learn, AWS S3 & EC2, Boto3 automation' },
        { title: 'GenAI, ML & NLP Internship Certificate', issuer: 'EduSkills Foundation (AICTE-Supported)', date: 'June 2026', detail: 'Generative AI, NLTK, SpaCy, RAG Workflows, LLMs' },
      ];
      const staticList = staticCerts.map((c, i) => `${i + 1}. **${c.title}**\n   📋 Issued by: ${c.issuer} | 📅 ${c.date}\n   📝 Topics: ${c.detail}`).join('\n\n');
      if (lang === 'mr') {
        return `🏆 **नरेंद्रची प्रमाणपत्रे:**\n\n${staticList}`;
      }
      if (lang === 'hi') {
        return `🏆 **नरेंद्र के प्रमाण पत्र:**\n\n${staticList}`;
      }
      return `🏆 **Narendra's Certificates:**\n\n${staticList}`;
    }
  }

  // ── EXPERIENCE ──
  if (has(
    'experience', 'internship', 'intern', 'work', 'job', 'company', 'genxcode',
    'eduskills', 'career', 'professional', 'role', 'position', 'worked',
    'अनुभव', 'इंटर्नशिप', 'काम', 'कंपनी', 'अनुभव'
  )) {
    if (lang === 'mr') {
      return `💼 **नरेंद्रचा अनुभव (Experience):**\n\n1. **प्रकल्प संचालक (Project Director)** @ Genxcode (Jan 2026 — Apr 2026)\n2. **GenAI, ML आणि NLP इंटर्न** @ EduSkills (June 2026)\n3. **AIML आणि AWS क्लाउड इंटर्न** @ EduSkills (June 2025)`;
    }
    if (lang === 'hi') {
      return `💼 **नरेंद्र का अनुभव (Experience):**\n\n1. **प्रोजेक्ट डायरेक्टर** @ Genxcode (Jan 2026 — Apr 2026)\n2. **GenAI, ML और NLP इंटर्न** @ EduSkills (June 2026)\n3. **AIML और AWS क्लाउड इंटर्न** @ EduSkills (June 2025)`;
    }
    const lines = (EX as any[]).map((ex: any, i: number) => `${i + 1}. **${ex.role}** @ ${ex.company} (${ex.period})`).join('\n');
    return `💼 **Narendra's Experience:**\n\n${lines}\n\nAsk me about any specific role for full details!`;
  }

  // ── LANGUAGE SWITCH ──
  if (has('speak in english', 'reply in english', 'answer in english', 'english me', 'english mein')) {
    return `👋 Sure! I'll respond in English now.\n\n**What would you like to know about Narendra Gond?**\n\n• 👨‍💻 **About** — background, bio, philosophy\n• 🎓 **Education** — JSPM University, CGPA, subjects\n• 🛠️ **Skills** — Python, DSA, React, AI/ML, AWS\n• 🚀 **Projects** — ${live.projects.length > 0 ? `${live.projects.length} live from DB` : 'VisionTrack, Skill Exchange, Placement Portal'}\n• 🏆 **Certificates** — ${live.certificates.length > 0 ? `${live.certificates.length} certifications` : 'AI/ML & AWS Cloud'}\n• 💼 **Experience** — Genxcode, EduSkills internships\n• 📧 **Contact** — email, GitHub, LinkedIn\n\nJust ask naturally! 😊`;
  }

  // ── CONTACT ──
  if (has('contact', 'reach', 'message', 'email', 'mail', 'github', 'linkedin', 'connect', 'संपर्क', 'ईमेल', 'गिटहब')) {
    if (lang === 'mr') {
      return `📬 **नरेंद्रशी संपर्क साधा:**\n\n📧 ईमेल: **${C.email}**\n💻 GitHub: **${C.github}** (@${C.githubUsername})\n🔗 LinkedIn: **${C.linkedin}**\n📍 स्थान: ${C.location}\n\nपोर्टफोलिओवरील संपर्क फॉर्म (Contact Form) वापरून थेट संदेश पाठवा!`;
    }
    if (lang === 'hi') {
      return `📬 **नरेंद्र से संपर्क करें:**\n\n📧 ईमेल: **${C.email}**\n💻 GitHub: **${C.github}** (@${C.githubUsername})\n🔗 LinkedIn: **${C.linkedin}**\n📍 स्थान: ${C.location}\n\nपोर्टफोलियो के संपर्क फॉर्म (Contact Form) का उपयोग करके सीधे संदेश भेजें!`;
    }
    return `📬 **Contact Narendra:**\n\n📧 Email: ${C.email}\n💻 GitHub: ${C.github}\n🔗 LinkedIn: ${C.linkedin}\n📍 Location: ${C.location}\n\nOr use the **Contact Form** directly on this portfolio!`;
  }

  // ── DEFAULT FRIENDLY FALLBACK ──
  if (lang === 'mr') {
    return `😊 मला पूर्णपणे समजले नाही — पण मी मदतीसाठी तयार आहे!\n\n**तुम्हाला नरेंद्र गोंडबद्दल काय जाणून घ्यायचे आहे?**\n\n• 👨‍💻 **परिचय** — पार्श्वभूमी आणि करिअर ध्येय\n• 🎓 **शिक्षण** — JSPM युनिव्हर्सिटी आणि CGPA\n• 🛠️ **कौशल्ये** — Python, DSA, React, AI/ML, AWS\n• 🚀 **प्रकल्प** — ${live.projects.length > 0 ? `${live.projects.length} लाइव्ह प्रोजेक्ट्स` : 'VisionTrack, Skill Exchange'}\n• 🏆 **प्रमाणपत्रे** — AI/ML आणि AWS क्लाउड\n• 💼 **अनुभव** — Genxcode आणि EduSkills इंटर्नशिप\n• 📧 **संपर्क** — ईमेल आणि सोशल मीडिया\n\nतुम्ही मराठी, हिंदी किंवा इंग्रजीत सहजपणे विचारू शकता! 😊`;
  }
  if (lang === 'hi') {
    return `😊 मैं पूरी तरह से समझ नहीं पाया — लेकिन मैं मदद के लिए तैयार हूँ!\n\n**आप नरेंद्र गोंड के बारे में क्या जानना चाहते हैं?**\n\n• 👨‍💻 **परिचय** — पृष्ठभूमि और करियर लक्ष्य\n• 🎓 **शिक्षा** — JSPM यूनिवर्सिटी और CGPA\n• 🛠️ **कौशल** — Python, DSA, React, AI/ML, AWS\n• 🚀 **प्रोजेक्ट्स** — ${live.projects.length > 0 ? `${live.projects.length} लाइव प्रोजेक्ट्स` : 'VisionTrack, Skill Exchange'}\n• 🏆 **प्रमाण पत्र** — AI/ML और AWS क्लाउड\n• 💼 **अनुभव** — Genxcode और EduSkills इंटर्नशिप\n• 📧 **संपर्क** — ईमेल और सोशल मीडिया\n\nआप हिंदी, मराठी या अंग्रेजी में आसानी से पूछ सकते हैं! 😊`;
  }
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
      text: `👋 Hi! I'm Narendra's AI Portfolio Assistant.\n\nYou can ask me about his skills, projects, certificates, experience, education, and more — in English, हिंदी, or मराठी!`,
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

  const speakResponse = (text: string, activeLangCode?: string) => {
    if (isMuted) return;
    stopSpeaking();
    const clean = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_#`•📌💻💼🎓👋📫🚀🏆☁️🧮👁️🔄✅ℹ️⚠️🤔😊🐍🎨⚙️💡🎯🌱📊📬📧🔗🏢]/g, '').trim();
    if (!clean) return;

    const isDevanagari = /[\u0900-\u097F]/.test(clean);
    const marathiKeywords = ['आहे', 'नाही', 'बद्दल', 'करा', 'माझे', 'कुठे', 'सांगा', 'नमस्कार', 'हॅलो', 'तुम्ही', 'प्रकल्प', 'प्रमाणपत्र', 'शिक्षण', 'कौशल्य', 'अनुभव', 'संपर्क', 'माहिती'];
    const hindiKeywords = ['है', 'हैं', 'नहीं', 'के बारे में', 'करें', 'मेरा', 'कहाँ', 'बताइए', 'नमस्ते', 'हैलो', 'परियोजना', 'प्रमाणपत्र', 'शिक्षा', 'कौशल', 'अनुभव', 'संपर्क', 'जानकारी'];

    let langCode = 'en';
    if (isDevanagari) {
      if (marathiKeywords.some(w => clean.includes(w)) || activeLangCode === 'mr-IN' || selectedLang === 'mr-IN') {
        langCode = 'mr';
      } else if (hindiKeywords.some(w => clean.includes(w)) || activeLangCode === 'hi-IN' || selectedLang === 'hi-IN') {
        langCode = 'hi';
      } else {
        langCode = (activeLangCode || selectedLang).startsWith('mr') ? 'mr' : 'hi';
      }
    } else if ((activeLangCode || selectedLang) === 'mr-IN') {
      langCode = 'mr';
    } else if ((activeLangCode || selectedLang) === 'hi-IN') {
      langCode = 'hi';
    }

    const targetLang = langCode === 'mr' ? 'mr-IN' : langCode === 'hi' ? 'hi-IN' : 'en-US';

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const vs = window.speechSynthesis.getVoices().length > 0
        ? window.speechSynthesis.getVoices()
        : voices;

      // Intelligent voice lookup with Devanagari fallbacks
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (langCode === 'mr') {
        // 1. Try exact Marathi voice
        matchedVoice = vs.find(v => v.lang.toLowerCase().includes('mr'));
        // 2. If Marathi voice not installed on OS, fallback to Hindi voice (reads Devanagari fluently)
        if (!matchedVoice) {
          matchedVoice = vs.find(v => v.lang.toLowerCase().includes('hi'));
        }
      } else if (langCode === 'hi') {
        // 1. Try Hindi voice
        matchedVoice = vs.find(v => v.lang.toLowerCase().includes('hi'));
        // 2. Fallback to Marathi voice
        if (!matchedVoice) {
          matchedVoice = vs.find(v => v.lang.toLowerCase().includes('mr'));
        }
      }

      // 3. Fallback to any Indian voice (e.g. en-IN or Google Indian English)
      if (!matchedVoice && (langCode === 'mr' || langCode === 'hi')) {
        matchedVoice = vs.find(v =>
          v.lang.toLowerCase().includes('in') ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('kalpana')
        );
      }

      // 4. Default English fallback
      if (!matchedVoice && langCode === 'en') {
        matchedVoice = vs.find(v => v.lang.toLowerCase().startsWith('en'));
      }

      const utterance = new SpeechSynthesisUtterance(clean.substring(0, 350));
      utterance.lang = matchedVoice ? matchedVoice.lang : targetLang;
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      setTimeout(() => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      }, 50);
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

    // Auto-detect query language and sync selected language state
    const detectedLang = detectQueryLanguage(textToSend, selectedLang);
    let activeLang = selectedLang;
    if (detectedLang === 'mr' && selectedLang !== 'mr-IN') {
      activeLang = 'mr-IN';
      setSelectedLang('mr-IN');
    } else if (detectedLang === 'hi' && selectedLang !== 'hi-IN') {
      activeLang = 'hi-IN';
      setSelectedLang('hi-IN');
    }

    // Build context with live data for backend prompt with explicit language instruction
    let context = buildContext(liveData);
    if (detectedLang === 'mr' || activeLang === 'mr-IN') {
      context += '\n\n[CRITICAL SYSTEM INSTRUCTION: The user is speaking/asking in MARATHI. You MUST reply completely in MARATHI language using Devanagari script.]';
    } else if (detectedLang === 'hi' || activeLang === 'hi-IN') {
      context += '\n\n[CRITICAL SYSTEM INSTRUCTION: The user is speaking/asking in HINDI. You MUST reply completely in HINDI language using Devanagari script.]';
    }

    let aiReplyText = '';

    try {
      // Try backend with full live context & language instruction
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
      // Local smart fallback with live data and language selection
      aiReplyText = generateLocalResponse(textToSend, liveData, activeLang);
    }

    const aiMsg: Message = { id: Math.random().toString(), sender: 'ai', text: aiReplyText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    speakResponse(aiReplyText, activeLang);
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
