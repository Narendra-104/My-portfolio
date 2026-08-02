import { Project, Experience, Education, Certificate } from './types';

export const HERO_DATA = {
  name: 'Narendra Gond',
  role: 'Aspiring Software Developer',
  tagline: 'Engineering Student, JSPM University Pune (Wagholi) | Aspiring Software Developer | Python • DSA and Algorithms • C Language | Passionate about Problem Solving | Pune, Maharashtra, India.',
  statusTag: 'Available for Internship 2026',
  avatarImage: '/src/assets/ng(1).jpeg', // Changed this line to use the clean asset path
  fallbackImage: '/src/assets/ng(1).jpeg'
};

export const ABOUT_DATA = {
  byline: 'Attended JSPM University Pune (Wagholi) | Aspiring Software Developer | Python • DSA and Algorithms • C Language | Passionate about Problem Solving | Pune Division, Maharashtra, India.',
  journey: 'I am currently pursuing my B-Tech in Computer Science Engineering at JSPM University, Pune. My technical journey began with deep-diving into C language syntax, which evolved into a passionate pursuit of structural clean layouts, Data Structures, and Algorithms (DSA). Along the way, I expanded my skills to full-stack web development and AI/Computer Vision integrations, such as face recognition systems.',
  careerObjective: 'Seeking to leverage my background in Python programming, C systems execution, full-stack web applications, and competitive algorithmic problem solving to secure a challenging Software Developer role or Internship.',
  education: {
    institution: 'JSPM University',
    degree: 'B-Tech in Computer Science Engineering',
    cgpa: '8.60 / 10 (Average)',
    period: '2024 — 2028',
    honors: ['First Year CGPA: 8.65 / 10', 'Second Year CGPA: 8.55 / 10'],
    details: 'Focus on Data Structures, Analysis & Design of Algorithms, Object-Oriented Software, Web Engineering, and AI/ML foundations.'
  } as Education,
  specialization: {
    title: 'Algorithms, Web & AI/ML Development',
    bullets: [
      'Data Structures & Algorithm  (Lists, Trees, Graphs, Big-O)',
      'Web Development (using AI)',
      'C langauge'
    ]
  }
};

export const RESUME_SKILLS = {
  column1: [
    'Python Programming & OOP',
    'DSA & Algorithms Design',
    'Core C Language',
    'Computer Vision & Face Recognition'
  ],
  column2: [
    'Problem Solving & Logic',
    'Web Development (React)',
    'Firebase & Cloud Storage',
    'Git '
  ]
};

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: 'exp1',
    role: 'Project Director',
    company: 'Genxcode',
    location: 'Pune, Maharashtra, India',
    period: 'January 2026 — April 2026',
    description: 'Directed end-to-end development and structured system logic flows for complex software programs.',
    bullets: [
      'Led a team of student developers in building high-performance Python utilities and interactive algorithm runtimes.',
      'Designed technical project roadmaps, ensuring optimized modular architecture and thorough peer reviews for C and Python code.',
    ],
    skills: ['Python', 'C Language', 'Data Structures', 'Algorithms']
  },
  {
    id: 'exp2',
    role: 'AIML & AWS Cloud Intern',
    company: 'EduSkill Virtual Internship on- AIML, AWS',
    location: 'Online',
    period: 'June 2025',
    description: 'Completed structured learning path and practical cloud project sprints focusing on artificial intelligence, machine learning pipelines, and AWS core services.',
    bullets: [
      'Built and trained standard supervised learning models using Scikit-Learn and Python, achieving high prediction accuracy on structured datasets.',
      'Configured cloud infrastructure patterns using Amazon S3 storage buckets and EC2 virtual machines for deploying prototype data models.',
      'Implemented scalable file management automation scripts using Python SDK (Boto3) to synchronize local logs to cloud repositories.',
    ],
    skills: ['AWS', 'Python', 'Machine Learning', 'AI Models', 'Cloud Computing', 'Data Analysis']
  },
  {
    id: 'exp3',
    role: 'GenAI, ML & NLP Intern',
    company: 'EduSkill Virtual Internship on Gen AI, ML, NLP',
    location: 'Online',
    period: 'June 2026',
    description: 'Completed a specialized learning curriculum and built practical hands-on projects around transformer models, semantic tokenization, and dynamic prompt interfaces.',
    bullets: [
      'Developed tokenization and textual preprocessing pipelines using Python libraries like NLTK and SpaCy for processing natural language datasets.',
      'Explored training parameters of pre-trained LLMs to understand text-to-text generation, semantic similarities, and classification models.',
      'Designed Retrieval-Augmented Generation (RAG) conceptual workflows and evaluated generative outputs leveraging custom context prompts.'
    ],
    skills: ['Generative AI', 'NLP', 'Python', 'Prompt Engineering', 'Machine Learning']
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    "id": "proj_1782484487398",
    "title": "AI Attendance & Face Recognition Management System",
    "category": "Web Application",
    "description": "Using AI tools I build an AI-powered attendance management system that uses face recognition technology to automate attendance, improve accuracy, and eliminate manual record keeping.",
    "longDescription": "VisionTrack is an AI-powered attendance management web application that automatically recognizes faces and records attendance in real time. It provides secure authentication, cloud-based data storage, and an intuitive dashboard for students and administrators.",
    "image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800",
    "tags": [
      "React",
      "Vite",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "AI",
      "Computer Vision",
      "Face Recognition",
      "Firebase",
      "Cloud Storage",
      "Authentication",
      "Netlify",
      "GitHub"
    ],
    "link": "https://6a2c25951868ad16ea8ba5fe--visontrack.netlify.app/",
    "metrics": [
      {
        "label": "Performance",
        "value": "60%"
      },
      {
        "label": "Progree",
        "value": "There is still some work remaining."
      }
    ]
  }
];

export const CERTIFICATES_DATA: Certificate[] = [
  {
    id: 'cert1',
    title: 'AWS Cloud & AI/ML Virtual Internship',
    issuer: 'EduSkills Foundation & AWS Academy',
    date: 'June 2025',
    certId: 'ES-AWS-AIML-2025-9831',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    verifyUrl: 'https://vois.eduskillsfoundation.org/verify/ES-AWS-AIML-2025-9831'
  },
  {
    id: 'cert2',
    title: 'Generative AI, ML & NLP Virtual Internship',
    issuer: 'EduSkills Foundation & AICTE',
    date: 'June 2026',
    certId: 'ES-GENAI-NLP-2026-1142',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    verifyUrl: 'https://vois.eduskillsfoundation.org/verify/ES-GENAI-NLP-2026-1142'
  },
];

export const MAP_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAauMrh-o967MYAHw4tcq8NOr5GZN5bN1psy_VjWOpgmRyCH1X4soB9V_RWEvYWQ5MD0HOZvIvD1Kvqs2ZERlVJc-nP5ysgmIM1nsABEHC50P7h0flqfFe4Do9vYa1ruwX7ifg3GpjP1xbsNoPkFlYFWEr5YTyUbvZpmj30h0Z3KEUHYDhAY1hCyQ8EZOc3UaBzb826tVrmwNpUI_LQ74ENTk5XFM0GlT1Hn-fAKzl90cE9Xzmr-FJBAvexR3AfETryXCBJoLrs8jY';

export const AI_ASSISTANT_DATA = {
  name: 'Gemini Portfolio Engine',
  version: '2.5.Live',
  status: 'online' as const,
  role: 'Context-Aware Developer Agent for Narendra Gond',
  
  // Connects the AI directly to your specific background metrics
  knowledgeBase: {
    owner: 'Narendra Gond',
    education: 'B-Tech in Computer Science Engineering (JSPM University Pune)',
    academicStanding: '8.60 average CGPA tracking (2024 — 2028)',
    primaryStack: ['Python Programming', 'Core C Language', 'DSA & Algorithmic Optimization'],
    flagshipProject: 'VisionTrack (AI Attendance & Face Recognition Management System via Firebase)'
  },

  // Maps the exact operational protocols for your portfolio
  operationalModes: [
    {
      mode: 'Visitor Inquiry Mode',
      description: 'Engages with recruiters and clients exploring Narendra\'s portfolio. Answers deep questions regarding his DSA specialization, Python OOP architecture, and deployment configurations.'
    },
    {
      mode: 'Secure Admin Dispatch',
      description: 'Integrates with Contact.tsx local state logs. Detects and authenticates secure system flags to handle real-time administrative changes or updates.'
    }
  ],

  // Full breakdown of integrated tasks I am trained to handle for your site
  capabilities: [
    'Explaining complex runtime trade-offs (Big-O analysis) for Narendra\'s algorithmic projects.',
    'Detailing the integration between Firebase Cloud Storage and Computer Vision pipelines used in VisionTrack.',
    'Validating virtual internship competencies achieved during the EduSkills AWS Cloud and GenAI/NLP tracks.',
    'Assisting visitors with instant navigation, tech-stack mapping, and scheduling setup.'
  ]
};
// --- INTEGRATED COMBINED OBJECT FOR YOUR PORTFOLIO CHAT ---
// This bundles all your exported data entities together so the Gemini prompt context updates dynamically.
// --- INTEGRATED COMBINED OBJECT FOR YOUR PORTFOLIO CHAT ---
// This bundles all your exported data entities together including your AI context loop.
// --- INTEGRATED COMBINED OBJECT FOR YOUR PORTFOLIO CHAT ---
// This bundles all your exported data entities together so the prompt context updates dynamically.
export const portfolioData = {
  hero: HERO_DATA,
  about: ABOUT_DATA,
  skills: RESUME_SKILLS,
  experience: EXPERIENCE_DATA,
  projects: PROJECTS_DATA,
  certificates: CERTIFICATES_DATA,
  aiAssistant: AI_ASSISTANT_DATA // Completely mapped structure
};