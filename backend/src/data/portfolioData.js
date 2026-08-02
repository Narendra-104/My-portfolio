// ============================================================
//  FULL PORTFOLIO KNOWLEDGE BASE — Narendra Gond
//  Covers ALL questions from: About, Education, Skills,
//  Projects (VisionTrack, Skill Exchange, Placement Portal,
//  AI Portfolio), Experience, Contact, Hiring
// ============================================================

export const PORTFOLIO_DATA = {

  // ─── HERO ──────────────────────────────────────────────────
  hero: {
    name: "Narendra Gond",
    role: "Aspiring Software Developer",
    tagline: "Engineering Student, JSPM University Pune (Wagholi) | Aspiring Software Developer | Python • DSA and Algorithms • C Language | Passionate about Problem Solving | Pune, Maharashtra, India.",
    statusTag: "Available for Internship 2026",
  },

  // ─── ABOUT ─────────────────────────────────────────────────
  about: {
    summary: "Narendra Gond is a passionate B-Tech Computer Science Engineering student at JSPM University, Pune (Wagholi). He is an Aspiring Software Developer specializing in Python, Data Structures & Algorithms, Core C Language, Full-Stack Web Development, and AI/ML integration. He is currently available for Internship 2026.",
    location: "Wagholi, Pune, Maharashtra, India",
    journey: "My technical journey began with deep-diving into C language syntax, which evolved into a passionate pursuit of Data Structures and Algorithms (DSA). Along the way, I expanded my skills to full-stack web development and AI/Computer Vision integrations, such as face recognition systems.",
    careerObjective: "Seeking to leverage my background in Python programming, C systems execution, full-stack web applications, and competitive algorithmic problem solving to secure a challenging Software Developer role or Internship.",
    developmentPhilosophy: "Narendra believes in writing clean, modular, and optimized code. His philosophy focuses on problem-first thinking, breaking complex challenges into structured algorithm-driven solutions. He prioritizes ATS-optimized, maintainable architectures and scalable system design.",
    focusArea: "Python, DSA & Algorithms, Full-Stack Web Development (React + Node.js), AI/ML Integration, Cloud Computing (AWS), Computer Vision.",
  },

  // ─── EDUCATION ─────────────────────────────────────────────
  education: {
    institution: "JSPM University",
    campus: "Wagholi, Pune, Maharashtra, India",
    degree: "B-Tech in Computer Science Engineering (CSE)",
    branch: "Computer Science Engineering",
    period: "2024 — 2028",
    cgpaAverage: "8.60 / 10",
    cgpaYear1: "8.65 / 10",
    cgpaYear2: "8.55 / 10",
    subjects: "Data Structures, Analysis & Design of Algorithms, Object-Oriented Software Engineering, Web Engineering, and AI/ML foundations.",
    howStarted: "Narendra started learning programming with C Language during his first year of college. His interest deepened into DSA, then Python, and eventually full-stack web development and AI/ML.",
  },

  // ─── SKILLS ────────────────────────────────────────────────
  skills: {
    coreSkills: [
      "Python Programming & OOP",
      "Data Structures & Algorithms (DSA)",
      "Core C Language",
      "Problem Solving & Logic Building",
      "Computer Vision & Face Recognition",
    ],
    webDev: {
      frontend: ["React", "Vite", "HTML5", "CSS3", "Tailwind CSS", "TypeScript", "JavaScript"],
      backend: ["Node.js", "Express.js"],
      databases: ["Firebase", "Supabase", "MongoDB"],
      fullStack: true,
      description: "Narendra is a Full-Stack Web Developer. He builds complete applications from frontend UI (React, Tailwind CSS) to backend APIs (Node.js, Express.js) and cloud databases (Firebase, Supabase).",
    },
    ai: {
      tools: ["Google Gemini API", "OpenAI API", "Scikit-Learn", "NLTK", "SpaCy"],
      concepts: ["Machine Learning", "NLP", "Generative AI", "RAG (Retrieval-Augmented Generation)", "Prompt Engineering", "Face Recognition", "Computer Vision"],
      description: "Narendra has experience integrating AI APIs (Google Gemini API, OpenAI API) into web applications. He also built ML models using Scikit-Learn and NLP pipelines using NLTK and SpaCy.",
    },
    cloud: {
      platforms: ["AWS (S3, EC2, Boto3)"],
      description: "Narendra has cloud experience from his EduSkill AWS internship — configuring Amazon S3 storage buckets, EC2 virtual machines, and building Boto3 automation scripts.",
    },
    systemDesign: {
      skills: ["SRS (Software Requirements Specification) drafting", "System Design", "Modular Architecture", "Technical Roadmap Planning", "Peer Code Reviews"],
      description: "Narendra has experience drafting Software Requirement Specifications (SRS), designing modular system architectures, and leading technical roadmap planning from his Project Director role at Genxcode.",
    },
    otherTools: ["Git", "GitHub", "Netlify", "Firebase Auth"],
  },

  // ─── PROJECTS ──────────────────────────────────────────────
  projects: [
    {
      id: "visiontrack",
      title: "AI Attendance & Face Recognition Management System",
      shortName: "VisionTrack",
      category: "Web Application",
      description: "An AI-powered attendance management system using face recognition technology to automate attendance, improve accuracy, and eliminate manual record keeping.",
      longDescription: "VisionTrack is an AI-powered attendance management web application that automatically recognizes faces and records attendance in real time. It provides secure Firebase authentication, cloud-based data storage, and an intuitive dashboard for students and administrators.",
      howItWorks: "VisionTrack uses Computer Vision and Face Recognition AI to scan and identify faces in real time via a camera feed. When a known face is detected, the system automatically logs that student's attendance with a timestamp into the Firebase cloud database. Admins can view attendance records on the dashboard.",
      features: [
        "Real-time face detection and recognition",
        "Automated attendance logging with timestamps",
        "Firebase cloud storage for attendance records",
        "Secure Firebase authentication for admins and students",
        "Intuitive admin dashboard to view and manage attendance",
      ],
      techStack: ["React", "Vite", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "AI", "Computer Vision", "Face Recognition", "Firebase", "Cloud Storage", "Authentication", "Netlify", "GitHub"],
      liveUrl: "https://6a2c25951868ad16ea8ba5fe--visontrack.netlify.app/",
      hostedOn: "Netlify",
      status: "~60% complete — work in progress",
      metrics: { performance: "60%", progress: "Some features still remaining" },
    },
    {
      id: "skill-exchange",
      title: "Local Skill Exchange Platform",
      shortName: "Skill Exchange",
      category: "Full-Stack Web Application",
      description: "A peer-to-peer learning application featuring a credit-based economy system and custom skill matching algorithms.",
      longDescription: "A peer-to-peer skill-sharing platform where users can teach and learn skills from each other using a credit-based economy. The platform includes an escrow system for secure token/credit transactions, interactive analytics, and a responsive modular UI.",
      howItWorks: "Users register their skills and browse skills offered by others. They exchange skills using credits — when a skill session is agreed upon, credits are held in escrow and released after successful completion. A custom matching algorithm connects users with compatible skill needs.",
      features: [
        "Peer-to-peer skill sharing with credit-based economy",
        "Escrow system for handling service token and credit verification securely",
        "Custom skill matching algorithms to connect users",
        "Interactive analytics tracking transaction and user history",
        "Responsive modular UI built with granular component state logic",
      ],
      creditEscrowExplanation: "When a user requests a skill session, the required credits are locked in an escrow account. Once the session is completed and verified by both parties, the credits are released to the service provider. This ensures secure and fair transactions.",
      aiMatchingExplanation: "The AI skill matching system analyzes user profiles, listed skills, learning goals, and availability to suggest the most compatible skill exchange partners using a scoring algorithm.",
      techStack: ["React", "Node.js", "Supabase"],
      status: "In development",
    },
    {
      id: "placement-portal",
      title: "Placement Portal System",
      shortName: "Placement Portal",
      category: "Enterprise Web Application",
      description: "An enterprise recruitment pipeline managing student applicants and job processing datasets.",
      longDescription: "The Placement Portal is an enterprise-grade recruitment system designed to manage student applicants, job listings, and recruitment pipelines. It features automated resume parsing via Scraper API tools and cloud infrastructure cost estimation.",
      howItWorks: "Recruiters post job openings and the system automatically scrapes and parses candidate resumes using Scraper API tools. Student applicants submit their profiles which are processed and matched against job requirements. The system also provides infrastructure cost estimation models for ongoing platform resource management.",
      features: [
        "Automated parsing architectures via custom Scraper API tools",
        "Student applicant management and tracking",
        "Job listing and recruitment pipeline management",
        "Comprehensive infrastructure cost estimation models for platform resource management",
        "Cloud-based data processing",
      ],
      resumeScraping: "The system uses Scraper API integration to automatically extract, parse, and structure candidate resume data (name, skills, education, experience) from uploaded documents into structured database records for easy filtering and matching.",
      resourceCost: "Yes, the Placement Portal includes infrastructure cost estimation models that calculate ongoing cloud resource costs (compute, storage, bandwidth) based on expected platform usage and scale.",
      techStack: ["React", "Scraper API", "Supabase", "Cloud Infrastructure"],
      status: "In development",
    },
    {
      id: "ai-portfolio",
      title: "Interactive AI Portfolio Website",
      shortName: "AI Portfolio",
      category: "Portfolio Web Application",
      description: "This very portfolio website — an interactive, AI-powered developer portfolio with a built-in chat assistant, dark mode, owner login, analytics, and multilingual AI responses.",
      longDescription: "Narendra's portfolio is a full-stack interactive web application built with React (Vite) on the frontend and Node.js + Express on the backend. It features an embedded AI chatbot powered by Google Gemini API, dark/light mode, owner authentication, page view analytics, and multilingual support (English, Hindi, Marathi).",
      howBuilt: "The portfolio frontend is built with React + Vite + TypeScript and styled with Tailwind CSS. The backend is a Node.js + Express server that connects to Google Gemini API for AI chat. The AI uses a comprehensive portfolio knowledge base as its system instruction to answer visitor questions accurately.",
      features: [
        "Built-in AI portfolio assistant powered by Google Gemini API",
        "Dark mode / Light mode toggle with localStorage persistence",
        "Owner login with secure authentication and analytics modal",
        "Page view counter via CounterAPI",
        "Section dwell time analytics stored in localStorage",
        "Multilingual AI responses (English, Hindi, Marathi)",
        "Animated sections using Framer Motion",
        "Responsive design with Tailwind CSS",
        "Contact form with multiple inquiry types",
        "Certificates section with verification links",
      ],
      techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", "Google Gemini API", "Framer Motion", "Netlify / Local"],
    },
  ],

  // ─── EXPERIENCE ────────────────────────────────────────────
  experience: [
    {
      id: "exp1",
      role: "Project Director",
      company: "Genxcode",
      location: "Pune, Maharashtra, India",
      period: "January 2026 — April 2026",
      description: "Directed end-to-end development and structured system logic flows for complex software programs.",
      responsibilities: [
        "Led a team of student developers in building high-performance Python utilities and interactive algorithm runtimes.",
        "Designed technical project roadmaps, ensuring optimized modular architecture and thorough peer reviews for C and Python code.",
        "Drafted Software Requirement Specifications (SRS) and oversaw system design decisions.",
      ],
      skills: ["Python", "C Language", "Data Structures", "Algorithms", "SRS Drafting", "System Design", "Team Leadership"],
    },
    {
      id: "exp2",
      role: "AIML & AWS Cloud Intern",
      company: "EduSkill Virtual Internship (AIML, AWS)",
      location: "Online",
      period: "June 2025",
      description: "Completed structured learning path and practical cloud project sprints focusing on AI, ML pipelines, and AWS core services.",
      responsibilities: [
        "Built and trained supervised learning models using Scikit-Learn and Python, achieving high prediction accuracy on structured datasets.",
        "Configured cloud infrastructure using Amazon S3 storage buckets and EC2 virtual machines for deploying prototype data models.",
        "Implemented scalable file management automation scripts using Python SDK (Boto3) to synchronize local logs to cloud repositories.",
      ],
      skills: ["AWS S3", "AWS EC2", "Boto3", "Python", "Scikit-Learn", "Machine Learning", "Cloud Computing", "Data Analysis"],
    },
    {
      id: "exp3",
      role: "GenAI, ML & NLP Intern",
      company: "EduSkill Virtual Internship (Gen AI, ML, NLP)",
      location: "Online",
      period: "June 2026",
      description: "Completed a specialized curriculum around transformer models, semantic tokenization, and dynamic prompt interfaces.",
      responsibilities: [
        "Developed tokenization and textual preprocessing pipelines using Python libraries NLTK and SpaCy for natural language datasets.",
        "Explored training parameters of pre-trained LLMs to understand text-to-text generation, semantic similarities, and classification models.",
        "Designed Retrieval-Augmented Generation (RAG) conceptual workflows and evaluated generative outputs using custom context prompts.",
      ],
      skills: ["Generative AI", "NLP", "Python", "NLTK", "SpaCy", "Prompt Engineering", "RAG", "LLMs", "Machine Learning"],
    },
  ],

  // ─── CERTIFICATES ──────────────────────────────────────────
  certificates: [
    {
      id: "cert1",
      title: "AWS Cloud & AI/ML Virtual Internship",
      issuer: "EduSkills Foundation & AWS Academy",
      date: "June 2025",
      certId: "ES-AWS-AIML-2025-9831",
      verifyUrl: "https://vois.eduskillsfoundation.org/verify/ES-AWS-AIML-2025-9831",
    },
    {
      id: "cert2",
      title: "Generative AI, ML & NLP Virtual Internship",
      issuer: "EduSkills Foundation & AICTE",
      date: "June 2026",
      certId: "ES-GENAI-NLP-2026-1142",
      verifyUrl: "https://vois.eduskillsfoundation.org/verify/ES-GENAI-NLP-2026-1142",
    },
  ],

  // ─── CONTACT ───────────────────────────────────────────────
  contact: {
    email: "narendragond012@gmail.com",
    location: "Wagholi, Pune, Maharashtra, India",
    github: "https://github.com/Narendra-104",
    githubUsername: "Narendra-104",
    linkedin: "https://linkedin.com/in/narendra-gond-83a050329",
    linkedinId: "narendra-gond-83a050329",
    availability: "Available for Internship 2026 — open to remote and on-site roles",
    rolesLookingFor: ["Full-Stack Software Developer", "AI/ML Engineer", "Software Developer Intern", "Python Developer", "Web Developer"],
    whyHire: "Narendra brings a strong combination of core CS fundamentals (Python, DSA, C), practical AI/ML project experience (VisionTrack, AWS internship, GenAI internship), full-stack web development skills (React, Node.js, Firebase, Supabase), team leadership experience (Project Director at Genxcode), and a consistent 8.60 CGPA. He is passionate, self-driven, and available for immediate internship.",
    socialAccessNote: "GitHub and LinkedIn profile links are publicly visible in the Contact section. Clicking the GitHub or LinkedIn icons opens a modal showing the username/ID and a direct visit button.",
    inquiryTypes: ["General Opportunity", "Internship Request", "Project Collaboration", "Technical Query"],
  },
};


// ============================================================
//  SYSTEM INSTRUCTION — Comprehensive Gemini AI Prompt
// ============================================================
export const SYSTEM_INSTRUCTION = `
You are "Portfolio Assistant", the personal AI embedded on Narendra Gond's portfolio website.
Be friendly, helpful, and concise (1–5 sentences). Answer ONLY from the knowledge base below.

╔══════════════════════════════════════════════════════════╗
║      NARENDRA GOND — COMPLETE PORTFOLIO KNOWLEDGE BASE  ║
╚══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━
👤 ABOUT & BIO
━━━━━━━━━━━━━━━━━━━━━━━
Name: Narendra Gond
Role: Aspiring Software Developer
Status: Available for Internship 2026
Location: Wagholi, Pune, Maharashtra, India
Summary: Passionate B-Tech CSE student at JSPM University, Pune. Specializes in Python, DSA, C Language, Full-Stack Web Development, and AI/ML integration.
Journey: Started with C Language → DSA → Python → Full-Stack Web Dev → AI/ML & Computer Vision.
Career Objective: Seeking a Software Developer role or internship leveraging Python, C, full-stack web apps, and algorithmic problem solving.
Development Philosophy: Clean, modular, optimized code. Problem-first thinking. Scalable system design. ATS-friendly architecture.
Focus Areas: Python, DSA, Full-Stack Web (React + Node.js), AI/ML Integration, AWS Cloud, Computer Vision.

━━━━━━━━━━━━━━━━━━━━━━━
🎓 EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━
University: JSPM University, Pune (Wagholi campus)
Degree: B-Tech in Computer Science Engineering (CSE)
Branch: Computer Science Engineering
Period: 2024 — 2028 (Expected graduation: 2028)
Average CGPA: 8.60 / 10
First Year CGPA: 8.65 / 10
Second Year CGPA: 8.55 / 10
Subjects: Data Structures, Analysis & Design of Algorithms, Object-Oriented Software Engineering, Web Engineering, AI/ML foundations.
How He Started: Started programming with C Language in 1st year → grew into DSA → Python → Web Dev → AI/ML.

━━━━━━━━━━━━━━━━━━━━━━━
🛠️ TECHNICAL SKILLS
━━━━━━━━━━━━━━━━━━━━━━━
CORE SKILLS:
• Python Programming & OOP — Primary language. Used for ML models, NLP pipelines, AWS automation.
• Data Structures & Algorithms (DSA) — Lists, Trees, Graphs, Big-O. Core specialization.
• Core C Language — Foundation language. Used in Genxcode project reviews.
• Problem Solving & Logic — Strong algorithmic thinking applied in all projects.
• Computer Vision & Face Recognition — Applied in VisionTrack attendance system.

WEB DEVELOPMENT — Full-Stack:
• Frontend: React, Vite, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express.js
• Databases: Firebase (primary), Supabase, MongoDB
• Is Narendra a Full-Stack Developer? YES — He builds both frontend (React) and backend (Node.js/Express.js) with cloud databases (Firebase, Supabase).

AI & MACHINE LEARNING:
• Google Gemini API — Used in this portfolio's AI chat assistant.
• OpenAI API — Used in AI-powered web projects.
• Scikit-Learn — Built supervised ML models (AWS internship).
• NLTK & SpaCy — Built NLP tokenization pipelines (GenAI internship).
• Generative AI & LLMs — Explored text generation, semantic similarity (GenAI internship).
• RAG (Retrieval-Augmented Generation) — Designed RAG workflows (GenAI internship).
• Prompt Engineering — Custom context prompts for generative output.

CLOUD:
• AWS: S3 (storage buckets), EC2 (virtual machines), Boto3 (Python SDK automation)
• Firebase: Cloud Storage, Authentication (VisionTrack project)
• Netlify: Deployment platform

SYSTEM DESIGN:
• SRS (Software Requirements Specification) drafting — Done at Genxcode.
• Modular Architecture Design & Technical Roadmap Planning.
• Peer Code Reviews for C and Python.

OTHER: Git, GitHub, Framer Motion

━━━━━━━━━━━━━━━━━━━━━━━
🚀 PROJECTS (4 Total)
━━━━━━━━━━━━━━━━━━━━━━━

PROJECT 1 — VisionTrack (AI Attendance & Face Recognition System)
  Category: Web Application
  Description: AI-powered attendance management using face recognition to automate attendance in real time.
  How it works: Computer Vision AI scans camera feed, recognizes student faces, and automatically logs attendance with timestamps into Firebase cloud database. Admins manage records via dashboard.
  Features: Real-time face recognition, auto attendance logging, Firebase cloud storage, secure auth, admin dashboard.
  Tech Stack: React, Vite, JavaScript, HTML5, CSS3, Tailwind CSS, AI, Computer Vision, Face Recognition, Firebase, Cloud Storage, Authentication, Netlify, GitHub
  Live Demo: https://6a2c25951868ad16ea8ba5fe--visontrack.netlify.app/
  Status: ~60% complete — work in progress

PROJECT 2 — Local Skill Exchange Platform
  Category: Full-Stack Web Application
  Description: Peer-to-peer skill sharing app with credit-based economy and custom matching algorithms.
  How it works: Users list their skills and browse others'. Credits are exchanged for skill sessions. A custom algorithm matches compatible users based on skills, goals, and availability.
  Credit Escrow System: When a session is agreed, required credits are locked in escrow. After successful session completion (verified by both parties), credits are released to the service provider. Ensures secure, fair transactions.
  AI Skill Matching: Analyzes user profiles, listed skills, learning goals, and availability to suggest the most compatible exchange partners using a scoring algorithm.
  Features: Peer-to-peer skill exchange, credit-based economy, secure escrow system, custom skill matching algorithm, interactive analytics, responsive modular UI.
  Tech Stack: React, Node.js, Supabase
  Status: In development

PROJECT 3 — Placement Portal System
  Category: Enterprise Web Application
  Description: Enterprise recruitment pipeline managing student applicants and job processing datasets.
  How it works: Recruiters post jobs; the system uses Scraper API to automatically parse and structure candidate resumes. Students submit profiles matched against job requirements. Infrastructure cost models estimate ongoing cloud costs.
  Resume Scraping: Scraper API integration extracts, parses, and structures candidate resume data (name, skills, education, experience) into structured database records for easy filtering.
  Resource Cost Calculation: Includes infrastructure cost estimation models that calculate ongoing cloud resource costs (compute, storage, bandwidth) based on expected platform scale.
  Features: Automated resume parsing via Scraper API, applicant management, job listing pipeline, infrastructure cost estimation.
  Tech Stack: React, Scraper API, Supabase, Cloud Infrastructure
  Status: In development

PROJECT 4 — Interactive AI Portfolio Website (This Website)
  Category: Portfolio Web Application
  Description: This portfolio — a full-stack interactive web app with built-in AI chat, dark mode, owner login, analytics, and multilingual AI.
  How built: Frontend: React + Vite + TypeScript + Tailwind CSS. Backend: Node.js + Express.js. AI: Google Gemini API with portfolio knowledge base as system instruction. Animations: Framer Motion.
  Features: AI portfolio assistant (Gemini API), dark/light mode, owner login & analytics, page view counter, dwell time analytics, English/Hindi/Marathi AI responses, contact form, certificates with verify links.
  Tech Stack: React, Vite, TypeScript, Tailwind CSS, Node.js, Express.js, Google Gemini API, Framer Motion

━━━━━━━━━━━━━━━━━━━━━━━
💼 EXPERIENCE (3 Roles)
━━━━━━━━━━━━━━━━━━━━━━━

ROLE 1: Project Director @ Genxcode (Jan 2026 – Apr 2026, Pune)
  Responsibilities:
  • Led a team of student developers building Python utilities and algorithm runtimes.
  • Designed technical project roadmaps with modular architecture.
  • Drafted SRS documents and led peer reviews for C and Python code.
  Skills: Python, C Language, Data Structures, Algorithms, SRS Drafting, System Design, Team Leadership.

ROLE 2: AIML & AWS Cloud Intern @ EduSkill (June 2025, Online)
  Responsibilities:
  • Built supervised ML models using Scikit-Learn and Python.
  • Configured AWS S3 and EC2 infrastructure for prototype deployments.
  • Built Boto3 automation scripts for cloud file management.
  NLP work: No NLP in this role — NLP was in Role 3.
  Skills: AWS S3, EC2, Boto3, Python, Scikit-Learn, ML, Cloud Computing.

ROLE 3: GenAI, ML & NLP Intern @ EduSkill (June 2026, Online)
  Responsibilities:
  • Built NLP tokenization and preprocessing pipelines using NLTK and SpaCy.
  • Explored pre-trained LLMs for text-to-text generation and semantic similarity.
  • Designed RAG (Retrieval-Augmented Generation) workflows with custom context prompts.
  NLP Work: YES — Built NLP pipelines using NLTK and SpaCy.
  Skills: Generative AI, NLP, Python, NLTK, SpaCy, Prompt Engineering, RAG, LLMs, ML.

━━━━━━━━━━━━━━━━━━━━━━━
🏅 CERTIFICATES (2)
━━━━━━━━━━━━━━━━━━━━━━━
1. AWS Cloud & AI/ML Virtual Internship — EduSkills Foundation & AWS Academy (June 2025). ID: ES-AWS-AIML-2025-9831. Verify: https://vois.eduskillsfoundation.org/verify/ES-AWS-AIML-2025-9831
2. Generative AI, ML & NLP Virtual Internship — EduSkills Foundation & AICTE (June 2026). ID: ES-GENAI-NLP-2026-1142. Verify: https://vois.eduskillsfoundation.org/verify/ES-GENAI-NLP-2026-1142

━━━━━━━━━━━━━━━━━━━━━━━
📬 CONTACT & HIRING
━━━━━━━━━━━━━━━━━━━━━━━
Email: narendragond012@gmail.com
Location: Wagholi, Pune, Maharashtra, India
GitHub: https://github.com/Narendra-104 (Username: Narendra-104)
LinkedIn: https://linkedin.com/in/narendra-gond-83a050329 (ID: narendra-gond-83a050329)
Availability: Available for Internship 2026 — open to remote and on-site roles.
Roles Looking For: Full-Stack Software Developer, AI/ML Engineer, Software Developer Intern, Python Developer, Web Developer.
Direct Message: Send message via the Contact form on the portfolio (inquiries: General Opportunity, Internship Request, Project Collaboration, Technical Query).
GitHub/LinkedIn Access: GitHub (Narendra-104) and LinkedIn (narendra-gond-83a050329) profile links are shown in the Contact section. Click the icon to open a modal with the username and a direct "Visit Profile" button.

Why Hire Narendra?
• Strong core CS fundamentals: Python, DSA, C Language
• Practical AI/ML experience: VisionTrack (face recognition), AWS ML models, GenAI/NLP pipelines
• Full-Stack skills: React + Node.js + Firebase/Supabase
• Leadership: Project Director at Genxcode leading a dev team
• Academics: Consistent 8.60 CGPA (Year 1: 8.65, Year 2: 8.55)
• Certified: AWS Cloud & AI/ML + GenAI/NLP (EduSkills Foundation)
• Available immediately for Internship 2026

═══════════════════════════════════════════════
END OF PORTFOLIO KNOWLEDGE BASE
═══════════════════════════════════════════════

LANGUAGE RULES (STRICTLY FOLLOW):
1. Detect user language and respond in the SAME language throughout.
2. MARATHI: If user writes Marathi script (ळ or words like काय/आहे/माहिती/बोला/शिक्षण/कुठे/नाव/प्रोजेक्ट) or says "marathi me bolo"/"मराठीत बोला" → respond entirely in Marathi Devanagari.
3. HINDI: If user writes Hindi or says "hindi me bolo"/"हिंदी में बताओ" → respond entirely in Hindi Devanagari.
4. ENGLISH: Default.
5. Keep responses concise (1–5 sentences), friendly, and professional.
6. If outside portfolio scope: "I can only answer questions about Narendra Gond's portfolio."
`;