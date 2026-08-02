import { ai } from '../config/gemini.js';
import { SYSTEM_INSTRUCTION, PORTFOLIO_DATA } from '../data/portfolioData.js';

// Auto-try models in order if one fails or hits rate limits
const MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

// ─── Language Detection ──────────────────────────────────────
const detectLanguage = (text) => {
  const lower = text.toLowerCase();

  if (lower.includes('marathi') || lower.includes('मराठी') || lower.includes('मराठीत')) return 'mr';
  if (lower.includes('hindi') || lower.includes('हिंदी') || lower.includes('hindi me')) return 'hi';

  const marathiKeywords = ['काय', 'आहे', 'आहेत', 'माहिती', 'बोला', 'सांगा', 'कसे', 'कसा',
    'कशी', 'कसं', 'मी', 'माझे', 'माझं', 'नमस्कार', 'मध्ये', 'मला', 'तुमचे',
    'कुठे', 'झाले', 'शिक्षण', 'नाव', 'प्रोजेक्ट', 'सुरु', 'बद्दल', 'कोठे', 'हाजेरी', 'चेहरा'];

  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const isMarathi = hasDevanagari && (text.includes('ळ') || marathiKeywords.some(w => text.includes(w)));
  if (isMarathi) return 'mr';
  if (hasDevanagari) return 'hi';

  const romanMarathi = ['kasa', 'kashi', 'kase', 'kasan', 'kuthe', 'kuta', 'shikshan', 'majha', 'sang', 'sanga', 'namaskar', 'aahe'];
  if (romanMarathi.some(w => lower.includes(w))) return 'mr';

  const romanHindi = ['kaise', 'kaisa', 'kaisi', 'kya', 'hai', 'hain', 'bataye', 'batao', 'baat', 'aap', 'mujhe'];
  if (romanHindi.some(w => lower.includes(w))) return 'hi';

  return 'en';
};

// ─── Comprehensive Fallback Engine ───────────────────────────
const getFallbackReply = (q, lang) => {
  const has = (...words) => words.some(w => q.includes(w));
  const t = (en, hi, mr) => lang === 'hi' ? hi : lang === 'mr' ? mr : en;

  const P = PORTFOLIO_DATA;
  const H = P.hero;
  const A = P.about;
  const E = P.education;
  const S = P.skills;
  const PR = P.projects;
  const EX = P.experience;
  const CE = P.certificates;
  const CO = P.contact;

  // 1. ABOUT & BIO
  if (has('who is narendra', 'background', 'summary', 'about narendra', 'tell me about', 'introduce', 'नरेंद्र कौन', 'नरेंद्र बद्दल', 'नरेंद्रजी बद्दल', 'कोण आहे')) {
    return t(
      A.summary,
      `नरेन्द्र गोंड JSPM यूनिवर्सिटी, पुणे से B-Tech CSE के छात्र हैं। वे Python, DSA, C भाषा, Full-Stack Web Dev, और AI/ML में विशेषज्ञता रखते हैं और 2026 की इंटर्नशिप के लिए उपलब्ध हैं।`,
      `नरेंद्र गोंड हे JSPM युनिव्हर्सिटी, पुणे येथून B-Tech CSE चे विद्यार्थी आहेत. ते Python, DSA, C भाषा, Full-Stack Web Dev, आणि AI/ML मध्ये तज्ज्ञ आहेत आणि 2026 च्या इंटर्नशिपसाठी उपलब्ध आहेत.`
    );
  }
  if (has('located', 'location', 'where live', 'where is narendra', 'city', 'address', 'कुठे राहतात', 'कहां रहते')) {
    return t(
      `Narendra is located in ${A.location}.`,
      `नरेन्द्र ${A.location} में रहते हैं।`,
      `नरेंद्र ${A.location} येथे राहतात.`
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
      `Narendra is pursuing ${E.degree} (${E.branch}) at ${E.institution}, ${E.campus} (${E.period}). Expected graduation: 2028.`,
      `नरेन्द्र ${E.institution}, ${E.campus} से ${E.degree} (${E.period}) कर रहे हैं। अपेक्षित ग्रैजुएशन: 2028।`,
      `नरेंद्र ${E.institution}, ${E.campus} येथून ${E.degree} (${E.period}) करत आहेत. अपेक्षित पदवी: 2028.`
    );
  }
  if (has('cgpa', 'marks', 'grade', 'score', 'percentage', '1st year', '2nd year', 'first year', 'second year', 'गुण', 'अंक')) {
    return t(
      `Narendra's Average CGPA is ${E.cgpaAverage} (First Year: ${E.cgpaYear1}, Second Year: ${E.cgpaYear2}).`,
      `नरेन्द्र का औसतन CGPA ${E.cgpaAverage} है (पहला साल: ${E.cgpaYear1}, दूसरा साल: ${E.cgpaYear2})।`,
      `नरेंद्रचा सरासरी CGPA ${E.cgpaAverage} आहे (पहिले वर्ष: ${E.cgpaYear1}, दुसरे वर्ष: ${E.cgpaYear2}).`
    );
  }
  if (has('subjects', 'course', 'curriculum', 'study', 'विषय', 'अभ्यास')) {
    return t(
      `Narendra's core academic subjects: ${E.subjects}`,
      `नरेन्द्र के मुख्य अकादमिक विषय: ${E.subjects}`,
      `नरेंद्रचे मुख्य शैक्षणिक विषय: ${E.subjects}`
    );
  }
  if (has('how started', 'start learning', 'first programming', 'begin', 'सुरुवात')) {
    return t(
      E.howStarted,
      `नरेन्द्र ने अपने पहले वर्ष में C भाषा के साथ प्रोग्रामिंग सीखना शुरू किया। इसके बाद वे DSA, Python, Full-Stack Web Dev और AI/ML की ओर बढ़े।`,
      `नरेंद्र यांनी त्यांच्या पहिल्या वर्षात C भाषेसह प्रोग्रामिंग शिकण्यास सुरुवात केली. त्यानंतर ते DSA, Python, Full-Stack Web Dev आणि AI/ML कडे वळले.`
    );
  }

  // 3. TECHNICAL SKILLS
  if (has('python')) {
    return t(
      `Yes! Python is Narendra's primary programming language. He uses it for OOP, machine learning models (Scikit-Learn), NLP pipelines (NLTK, SpaCy), and AWS cloud automation (Boto3).`,
      `हाँ! Python नरेन्द्र की प्राथमिक प्रोग्रामिंग भाषा है। वे OOP, ML (Scikit-Learn), NLP (NLTK, SpaCy) और AWS (Boto3) के लिए Python का उपयोग करते हैं।`,
      `हो! Python ही नरेंद्रची प्राथमिक प्रोग्रामिंग भाषा आहे. ते OOP, ML (Scikit-Learn), NLP (NLTK, SpaCy) आणि AWS (Boto3) साठी Python वापरतात.`
    );
  }
  if (has('dsa', 'data structure', 'algorithm', 'big-o')) {
    return t(
      `Yes! DSA & Algorithms is a core specialization of Narendra. He has studied Lists, Trees, Graphs, and Big-O Analysis, applying them in projects and at Genxcode.`,
      `हाँ! DSA & Algorithms नरेन्द्र की मुख्य विशेषज्ञता है। उन्होंने Lists, Trees, Graphs और Big-O Analysis का अध्ययन किया है।`,
      `हो! DSA & Algorithms हे नरेंद्रचे मुख्य स्पेशलायझेशन आहे. त्यांनी Lists, Trees, Graphs आणि Big-O विश्लेषणाचा अभ्यास केला आहे.`
    );
  }
  if (has('c language', 'c lang', 'core c', 'सी भाषा')) {
    return t(
      `Yes! Core C Language is Narendra's foundation language. He deep-dived into C syntax and led peer reviews for C code at Genxcode.`,
      `हाँ! Core C Language नरेन्द्र की आधारभूत भाषा है। उन्होंने Genxcode में C कोड समीक्षाओं का नेतृत्व भी किया।`,
      `हो! Core C Language ही नरेंद्रची पायाभूत भाषा आहे. त्यांनी Genxcode मध्ये C कोड समीक्षेचे नेतृत्व देखील केले.`
    );
  }
  if (has('oop', 'object oriented')) {
    return t(
      `Yes, Narendra is proficient in Object-Oriented Programming (OOP) principles in Python and C++, using modular and reusable software designs.`,
      `हाँ, नरेन्द्र Python में Object-Oriented Programming (OOP) सिद्धांतों में कुशल हैं।`,
      `हो, नरेंद्र Python मधील Object-Oriented Programming (OOP) तत्त्वांमध्ये कुशल आहेत.`
    );
  }
  if (has('problem solving', 'logic building', 'logic')) {
    return t(
      `Yes! Problem-solving and logic building are Narendra's core strengths, applied through DSA and algorithmic competition exercises.`,
      `हाँ! समस्या समाधान (Problem-solving) और लॉजिक बिल्डिंग नरेन्द्र की मुख्य ताकत हैं।`,
      `हो! समस्या निवारण (Problem-solving) आणि लॉजिक बिल्डिंग ही नरेंद्रची मुख्य ताकद आहे.`
    );
  }
  if (has('full stack', 'full-stack', 'fullstack')) {
    return t(
      `Yes! Narendra is a Full-Stack Web Developer. Frontend: React, Vite, Tailwind CSS, TypeScript. Backend: Node.js, Express.js. Databases: Firebase, Supabase, MongoDB.`,
      `हाँ! नरेन्द्र एक Full-Stack Web Developer हैं। Frontend: React, Vite, Tailwind. Backend: Node.js, Express.js. Databases: Firebase, Supabase, MongoDB.`,
      `हो! नरेंद्र एक Full-Stack Web Developer आहेत. Frontend: React, Vite, Tailwind. Backend: Node.js, Express.js. Databases: Firebase, Supabase, MongoDB.`
    );
  }
  if (has('frontend', 'react', 'vite', 'tailwind', 'html', 'css')) {
    return t(
      `Narendra's frontend stack includes React, Vite, TypeScript, JavaScript, HTML5, CSS3, and Tailwind CSS with Framer Motion animations.`,
      `नरेन्द्र का frontend stack: React, Vite, TypeScript, JavaScript, HTML5, CSS3, और Tailwind CSS।`,
      `नरेंद्रचा frontend stack: React, Vite, TypeScript, JavaScript, HTML5, CSS3, आणि Tailwind CSS.`
    );
  }
  if (has('backend', 'node', 'express')) {
    return t(
      `Narendra's backend stack includes Node.js and Express.js for building scalable REST APIs and server routes.`,
      `नरेन्द्र का backend stack: Node.js और Express.js REST APIs बनाने के लिए।`,
      `नरेंद्रचा backend stack: Node.js आणि Express.js REST APIs बनवण्यासाठी.`
    );
  }
  if (has('database', 'supabase', 'mongodb', 'firebase')) {
    return t(
      `Narendra has worked with Firebase (Cloud Storage & Auth), Supabase (PostgreSQL), and MongoDB databases.`,
      `नरेन्द्र ने Firebase, Supabase, और MongoDB डेटाबेस के साथ काम किया है।`,
      `नरेंद्रने Firebase, Supabase, आणि MongoDB डेटाबेससह काम केले आहे.`
    );
  }
  if (has('gemini', 'openai', 'ai api')) {
    return t(
      `Narendra uses Google Gemini API (powering this portfolio's assistant) and OpenAI API for AI integration in web applications.`,
      `नरेन्द्र Google Gemini API और OpenAI API का उपयोग वेब एप्लिकेशन्स में AI इंटीग्रेशन के लिए करते हैं।`,
      `नरेंद्र वेब ॲप्लिकेशन्समध्ये AI एकात्मतेसाठी Google Gemini API आणि OpenAI API चा वापर करतात.`
    );
  }
  if (has('aws', 'cloud', 's3', 'ec2', 'boto3')) {
    return t(
      `Narendra has hands-on AWS Cloud experience from EduSkill: Amazon S3 buckets, EC2 virtual machines, and Boto3 Python SDK automation scripts.`,
      `नरेन्द्र को AWS का व्यावहारिक अनुभव है: Amazon S3, EC2, और Boto3 Python SDK ऑटोमेशन।`,
      `नरेंद्रला AWS चा व्यावहारिक अनुभव आहे: Amazon S3, EC2, आणि Boto3 Python SDK ऑटोमेशन.`
    );
  }
  if (has('srs', 'system design', 'requirement specification')) {
    return t(
      `Yes! Narendra has experience drafting Software Requirement Specifications (SRS), designing modular system architecture, and planning technical roadmaps at Genxcode.`,
      `हाँ! नरेन्द्र को SRS ड्राफ्टिंग, सिस्टम डिज़ाइन और तकनीकी रोडमैप प्लानिंग का अनुभव है।`,
      `हो! नरेंद्रला SRS ड्राफ्टिंग, सिस्टम डिझाइन आणि तांत्रिक रोडमॅप प्लॅनिंगचा अनुभव आहे.`
    );
  }
  if (has('skill', 'technology', 'tech stack', 'कौशल्य', 'स्किल्स')) {
    return t(
      `Narendra's skills: ${S.coreSkills.join(', ')}. Full-Stack: React, Node.js, Express, Firebase, Supabase, Tailwind CSS. Cloud/AI: AWS, Gemini API, Scikit-Learn, NLTK, SpaCy.`,
      `नरेन्द्र की स्किल्स: Python, DSA, C Language, React, Node.js, Firebase, Supabase, AWS Cloud, Scikit-Learn, NLTK, SpaCy, Gemini API।`,
      `नरेंद्रची कौशल्ये: Python, DSA, C Language, React, Node.js, Firebase, Supabase, AWS Cloud, Scikit-Learn, NLTK, SpaCy, Gemini API.`
    );
  }

  // 4. PROJECTS
  // A. VisionTrack
  if (has('visiontrack', 'vision track', 'face recognition', 'attendance')) {
    const v = PR[0];
    return t(
      `${v.title} (${v.shortName}): An AI-powered attendance web app that scans faces via camera feed using Computer Vision AI and automatically logs attendance with timestamps into Firebase. Built with React, Vite, Firebase, Tailwind CSS. Live: ${v.liveUrl}`,
      `VisionTrack एक AI-संचालित फेस रिकग्निशन उपस्थिति प्रणाली है जो कैमरे से चेहरे पहचानकर Firebase में उपस्थिति दर्ज करती है। Live: ${v.liveUrl}`,
      `VisionTrack ही एक AI-संचालित फेस रिकग्निशन उपस्थिती प्रणाली आहे जी कॅमेऱ्याद्वारे चेहरे ओळखून Firebase मध्ये उपस्थिती नोंदवते. Live: ${v.liveUrl}`
    );
  }
  // B. Skill Exchange
  if (has('skill exchange', 'local skill', 'escrow', 'credit-based')) {
    const s = PR[1];
    return t(
      `${s.title}: A peer-to-peer skill-sharing platform where users learn/teach skills using credits. Features a credit-based escrow system (credits locked during sessions and released upon completion) and AI skill matching algorithms. Tech: React, Node.js, Supabase.`,
      `Local Skill Exchange Platform एक P2P स्किल-शेयरिंग प्लेटफॉर्म है जो क्रेडिट-आधारित एस्क्रो सिस्टम और AI स्किल मैचिंग एल्गोरिदम का उपयोग करता है।`,
      `Local Skill Exchange Platform हा एक P2P स्किल-शेअरिंग प्लॅटफॉर्म आहे जो क्रेडिट-आधारित एस्क्रो सिस्टम आणि AI स्किल मॅचिंग अल्गोरिदम वापरतो.`
    );
  }
  // C. Placement Portal
  if (has('placement portal', 'scraper', 'resume scraping', 'resource cost')) {
    const p = PR[2];
    return t(
      `${p.title}: An enterprise recruitment pipeline. Resume Scraping: Uses Scraper API to automatically parse and structure candidate resume data into database records. Cost Calculation: Calculates ongoing cloud compute/storage costs based on scale. Tech: React, Scraper API, Supabase.`,
      `Placement Portal System एक एंटरप्राइज भर्ती प्रणाली है। यह Scraper API से रिज़्यूमे स्क्रैपिंग और क्लाउड इन्फ्रास्ट्रक्चर लागत अनुमान प्रदान करता है।`,
      `Placement Portal System ही एक एंटरप्राइज भरती प्रणाली आहे. हे Scraper API सह रिझ्युमे स्क्रॅपिंग आणि क्लाउड इन्फ्रास्ट्रक्चर खर्च अंदाज प्रदान करते.`
    );
  }
  // D. AI Portfolio
  if (has('how is this portfolio', 'ai portfolio', 'this website', 'built this site')) {
    const a = PR[3];
    return t(
      `${a.title}: Full-stack app with React + Vite + TypeScript frontend, Node.js + Express backend, and Google Gemini API providing this context-aware AI chatbot. Includes dark mode, owner analytics, and multilingual support.`,
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
      `At ${e.company} (${e.period}), Narendra was ${e.role}. Responsibilities: Led a team of student developers, built Python utilities & algorithm runtimes, designed project roadmaps, drafted SRS documents, and conducted peer code reviews for C and Python.`,
      `${e.company} (${e.period}) में नरेन्द्र ${e.role} थे। उन्होंने Python और C प्रोजेक्ट्स के लिए डेवलपर टीम का नेतृत्व किया और SRS दस्तावेज़ तैयार किए।`,
      `${e.company} (${e.period}) मध्ये नरेंद्र ${e.role} होते. त्यांनी Python आणि C प्रोजेक्ट्ससाठी डेव्हलपर टीमचे नेतृत्व केले आणि SRS दस्तऐवज तयार केले.`
    );
  }
  if (has('eduskill', 'edu skill', 'nlp', 'natural language', 'aws intern', 'genai intern')) {
    return t(
      `Narendra completed 2 EduSkill virtual internships:\n1. GenAI, ML & NLP Intern (June 2026): Built NLP pipelines using NLTK and SpaCy, explored LLMs, designed RAG workflows.\n2. AIML & AWS Cloud Intern (June 2025): Trained ML models (Scikit-Learn), configured AWS S3/EC2, wrote Boto3 scripts.`,
      `नरेन्द्र ने EduSkill में 2 इंटर्नशिप पूरी कीं:\n1. GenAI, ML & NLP Intern (June 2026): NLTK, SpaCy से NLP पाइपलाइन और RAG वर्कफ़्लो बनाए।\n2. AWS Cloud Intern (June 2025): Scikit-Learn से ML मॉडल और AWS S3/EC2/Boto3 कन्फ़िगर किया।`,
      `नरेंद्र यांनी EduSkill मध्ये 2 इंटर्नशिप पूर्ण केल्या:\n1. GenAI, ML & NLP Intern (June 2026): NLTK, SpaCy सह NLP पाइपलाइन आणि RAG वर्कफ्लो बनवले.\n2. AWS Cloud Intern (June 2025): Scikit-Learn सह ML मॉडेल आणि AWS S3/EC2/Boto3 कॉन्फिगर केले.`
    );
  }
  if (has('experience', 'internship', 'work', 'job', 'अनुभव', 'इंटर्नशिप')) {
    return t(
      `Narendra's Experience:\n1. Project Director @ Genxcode (Jan–Apr 2026)\n2. AIML & AWS Cloud Intern @ EduSkill (June 2025)\n3. GenAI, ML & NLP Intern @ EduSkill (June 2026)`,
      `नरेन्द्र का अनुभव:\n1. Project Director @ Genxcode (Jan–Apr 2026)\n2. AIML & AWS Cloud Intern @ EduSkill (June 2025)\n3. GenAI, ML & NLP Intern @ EduSkill (June 2026)`,
      `नरेंद्रचा अनुभव:\n1. Project Director @ Genxcode (Jan–Apr 2026)\n2. AIML & AWS Cloud Intern @ EduSkill (June 2025)\n3. GenAI, ML & NLP Intern @ EduSkill (June 2026)`
    );
  }

  // 6. CONTACT, HIRING & AVAILABILITY
  if (has('email', 'mail', 'ईमेल', 'इमेल')) {
    return t(
      `Narendra's official email is ${CO.email}.`,
      `नरेन्द्र का ईमेल ${CO.email} है।`,
      `नरेंद्रचा अधिकृत ईमेल ${CO.email} आहे.`
    );
  }
  if (has('contact', 'reach', 'message', 'send message', 'संपर्क')) {
    return t(
      `Contact Narendra via email (${CO.email}) or send a direct message using the Contact Form on this site. You can select inquiry types: ${CO.inquiryTypes.join(', ')}.`,
      `नरेन्द्र से ${CO.email} पर संपर्क करें या इस वेबसाइट के Contact Form से मैसेज भेजें।`,
      `नरेंद्रशी ${CO.email} वर संपर्क करा किंवा या वेबसाइटवरील Contact Form द्वारे संदेश पाठवा.`
    );
  }
  if (has('hiring', 'hire', 'available', 'internship 2026', 'roles looking for', 'why hire')) {
    return t(
      `Status: ${CO.availability}. Roles: ${CO.rolesLookingFor.join(', ')}.\nWhy Hire Narendra: Strong CS fundamentals (Python, DSA, C), 8.60 CGPA, leadership experience at Genxcode, practical AI/ML & cloud projects (VisionTrack, AWS, GenAI), and high problem-solving drive.`,
      `स्थिति: ${CO.availability}। भूमिकाएँ: Full-Stack Developer, AI Engineer, Software Developer Intern।\nनरेन्द्र को क्यों चुनें: मजबूत फंडामेंटल्स (Python, DSA, C), 8.60 CGPA, Genxcode में नेतृत्व, और प्रयोगात्मक AI/Cloud अनुभव।`,
      `स्थिती: ${CO.availability}. भूमिका: Full-Stack Developer, AI Engineer, Software Developer Intern.\nनरेंद्रला का निवडावे: मजबूत पायाभूत कौशल्ये (Python, DSA, C), 8.60 CGPA, Genxcode मध्ये नेतृत्व आणि व्यावहारिक AI/Cloud अनुभव.`
    );
  }
  if (has('github', 'linkedin', 'social', 'profile link')) {
    return t(
      `GitHub: ${CO.github} (Username: ${CO.githubUsername})\nLinkedIn: ${CO.linkedin} (ID: ${CO.linkedinId})\nYou can click the GitHub or LinkedIn icons in the Contact section to view details and visit directly.`,
      `GitHub: ${CO.github} (Username: ${CO.githubUsername})\nLinkedIn: ${CO.linkedin} (ID: ${CO.linkedinId})\nआप Contact सेक्शन से सीधे प्रोफाइल विजिट कर सकते हैं।`,
      `GitHub: ${CO.github} (Username: ${CO.githubUsername})\nLinkedIn: ${CO.linkedin} (ID: ${CO.linkedinId})\nतुम्ही Contact विभागातून थेट प्रोफाईलला भेट देऊ शकता.`
    );
  }

  // DEFAULT
  return t(
    `Hello! I am Narendra Gond's Portfolio AI Assistant. You can ask me anything about his About & Bio, Education & CGPA, Technical Skills, Projects (VisionTrack, Skill Exchange, Placement Portal), Experience, Certificates, or Contact/Hiring details!`,
    `नमस्ते! मैं नरेन्द्र गोंड का Portfolio AI असिस्टेंट हूँ। आप मुझसे उनकी बायो, शिक्षा, CGPA, स्किल्स, प्रोजेक्ट्स (VisionTrack, Skill Exchange), अनुभव या संपर्क के बारे में कुछ भी पूछ सकते हैं!`,
    `नमस्कार! मी नरेंद्र गोंडचा Portfolio AI असिस्टंट आहे. तुम्ही मला त्यांचे बायो, शिक्षण, CGPA, कौशल्ये, प्रोजेक्ट्स (VisionTrack, Skill Exchange), अनुभव किंवा संपर्काबद्दल काहीही विचारू शकता!`
  );
};

// ─── Main Controller ─────────────────────────────────────────
export const handleChat = async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message is required' });

  let aiReplyText = null;
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: message,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3,
        },
      });
      if (response && response.text) {
        aiReplyText = response.text;
        console.log(`✅ Model "${modelName}" succeeded.`);
        break;
      }
    } catch (err) {
      console.warn(`⚠️ Model "${modelName}" failed:`, err?.message || err);
      lastError = err;
    }
  }

  if (aiReplyText) return res.status(200).json({ reply: aiReplyText });

  // Local fallback when Gemini quota is exceeded
  console.warn('⚠️ All Gemini models failed. Using local fallback.', lastError?.message || '');
  const lang = detectLanguage(message);
  const query = message.toLowerCase();
  const reply = getFallbackReply(query, lang);
  return res.status(200).json({ reply });
};