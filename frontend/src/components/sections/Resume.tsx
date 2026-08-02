import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Printer, Eye, X, Award, Briefcase, GraduationCap, Edit3 } from 'lucide-react';
import { HERO_DATA, ABOUT_DATA, EXPERIENCE_DATA, RESUME_SKILLS } from "../../data";
import EditResumeModal from "../modals/EditResumeModal";
import { fetchPortfolioSetting } from '../../lib/db';

interface ResumeProps {
  isOwner?: boolean;
}

export default function Resume({ isOwner = false }: ResumeProps) {
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [profile, setProfile] = useState({
    name: HERO_DATA.name,
    role: HERO_DATA.role,
    tagline: HERO_DATA.tagline,
    statusTag: HERO_DATA.statusTag,
    avatarImage: HERO_DATA.avatarImage,
    fallbackImage: HERO_DATA.fallbackImage
  });

  const [experienceList, setExperienceList] = useState(() => {
    const saved = localStorage.getItem('portfolio_custom_experience');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return EXPERIENCE_DATA;
  });

  const [skillsData, setSkillsData] = useState(() => {
    const saved = localStorage.getItem('portfolio_custom_skills');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.column1)) return parsed;
      } catch (e) {}
    }
    return RESUME_SKILLS;
  });

  const [aboutData, setAboutData] = useState(() => {
    const saved = localStorage.getItem('portfolio_custom_about');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.education) return parsed;
      } catch (e) {}
    }
    return ABOUT_DATA;
  });

  // Fetch live settings from Supabase DB on mount
  useEffect(() => {
    async function syncDbData() {
      const [dbExp, dbSkills, dbAbout] = await Promise.all([
        fetchPortfolioSetting<any[]>('portfolio_custom_experience'),
        fetchPortfolioSetting<any>('portfolio_custom_skills'),
        fetchPortfolioSetting<any>('portfolio_custom_about')
      ]);

      if (dbExp && Array.isArray(dbExp) && dbExp.length > 0) {
        setExperienceList(dbExp);
        localStorage.setItem('portfolio_custom_experience', JSON.stringify(dbExp));
      }
      if (dbSkills && dbSkills.column1) {
        setSkillsData(dbSkills);
        localStorage.setItem('portfolio_custom_skills', JSON.stringify(dbSkills));
      }
      if (dbAbout && dbAbout.education) {
        setAboutData(dbAbout);
        localStorage.setItem('portfolio_custom_about', JSON.stringify(dbAbout));
      }
    }
    syncDbData();
  }, []);

  // Listen to profile and experience updates from other modals/components
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };

    const handleExperiencesUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setExperienceList(customEvent.detail);
      }
    };

    window.addEventListener('portfolio_profile_updated', handleProfileUpdate);
    window.addEventListener('portfolio_experiences_updated', handleExperiencesUpdate);

    return () => {
      window.removeEventListener('portfolio_profile_updated', handleProfileUpdate);
      window.removeEventListener('portfolio_experiences_updated', handleExperiencesUpdate);
    };
  }, []);

  // Keep all fields synchronized with client storage in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      // Experience Sync
      const savedExp = localStorage.getItem('portfolio_custom_experience');
      if (savedExp) {
        try {
          const parsed = JSON.parse(savedExp);
          if (Array.isArray(parsed)) {
            setExperienceList(parsed);
          }
        } catch (e) {}
      } else {
        setExperienceList(EXPERIENCE_DATA);
      }

      // Skills Sync
      const savedSkills = localStorage.getItem('portfolio_custom_skills');
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (parsed && Array.isArray(parsed.column1)) {
            setSkillsData(parsed);
          }
        } catch (e) {}
      } else {
        setSkillsData(RESUME_SKILLS);
      }

      // Education/About Sync
      const savedAbout = localStorage.getItem('portfolio_custom_about');
      if (savedAbout) {
        try {
          const parsed = JSON.parse(savedAbout);
          if (parsed && parsed.education) {
            setAboutData(parsed);
          }
        } catch (e) {}
      } else {
        setAboutData(ABOUT_DATA);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      const resumeContent = `
========================================
${profile.name.toUpperCase()} - PORTFOLIO RESUME
========================================
Role: ${profile.role}
Email: narendragond012@gmail.com
Location: Pune, Maharashtra, India

PROFESSIONAL SUMMARY
${profile.tagline}

CORE SKILLS
${skillsData.column1.map(s => `- ${s}`).join('\n')}
${skillsData.column2.map(s => `- ${s}`).join('\n')}

EXPERIENCE
${experienceList.map(exp => `- ${exp.role} @ ${exp.company} (${exp.period})
  * ${exp.description}
  ${exp.bullets.map(b => `  - ${b}`).join('\n')}`).join('\n\n')}

EDUCATION
- ${aboutData.education.degree} - ${aboutData.education.institution} (${aboutData.education.period})
  * CGPA: ${aboutData.education.cgpa}
  * ${aboutData.education.details}
========================================
Generated from Portfolio Interactive Engine © 2026.
      `;
      const blob = new Blob([resumeContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.replace(/\s+/g, '_')}_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="resume" className="py-24 bg-background scroll-mt-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-16 mb-16">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left panel instructions columns */}
          <div className="lg:w-1/3 space-y-6">
            <span className="text-primary font-headline text-xs font-bold uppercase tracking-widest block">
              Curriculum Vitae
            </span>
            <h1 className="font-headline text-3xl font-bold text-on-surface leading-tight">
              Professional Trajectory
            </h1>
            <p className="font-sans text-xs text-on-surface-variant font-medium leading-relaxed">
              A detailed overview of my technical expertise, academic background, and professional accomplishments. Optimized for both ATS systems and human readability.
            </p>

            {isOwner ? (
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="group flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg font-headline text-xs font-bold hover:scale-[1.02] transition-transform duration-300 shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50"
                >
                  <Download size={15} className={downloading ? 'animate-bounce' : ''} />
                  {downloading ? 'Compiling PDF...' : 'Download Full CV (TXT/PDF)'}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-4 py-3 rounded-lg font-headline text-xs font-bold hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <Printer size={15} />
                    Print Version
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-secondary text-white px-4 py-3 rounded-lg font-headline text-xs font-bold hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <Edit3 size={14} />
                    Edit Resume
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-medium text-on-surface-variant flex flex-col gap-2">
                <p className="font-semibold text-on-surface flex items-center gap-1.5">
                  💼 Professional CV Download Protected
                </p>
                <p className="text-[11px] leading-relaxed">
                  Direct curriculum downloads are protected. Please authenticate via the lock icon in the navigation bar to download or print this CV.
                </p>
              </div>
            )}
          </div>

          {/* Right simulated Interactive CV block */}
          <div className="lg:w-2/3 w-full">
            <div className="relative bg-surface-container-low rounded-2xl p-6 md:p-10 border border-outline-variant/30 shadow-sm overflow-hidden group">
              
              {/* Simulated Paper Sheets */}
              <div
                id="interactive-resume-sheet"
                className="bg-white dark:bg-slate-900 border border-outline-variant/10 p-8 md:p-12 shadow-xl rounded-sm resume-preview-mask select-none pointer-events-none transition-colors duration-300"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between border-b border-outline-variant/20 pb-6 mb-6">
                  <div className="text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-headline">
                      {profile.name}
                    </h2>
                    <p className="text-xs text-primary font-bold tracking-wider uppercase mt-1">
                      {profile.role}
                    </p>
                  </div>
                  <div className="text-left md:text-right text-[10px] text-on-surface-variant font-semibold mt-4 md:mt-0 space-y-0.5">
                    <p>narendragond012@gmail.com</p>
                    <p>Pune, Maharashtra, India</p>
                  </div>
                </div>

                {/* Resume contents block */}
                <div className="space-y-6 text-left">
                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-extrabold uppercase tracking-widest text-secondary font-headline">
                      Professional Summary
                    </h3>
                    <p className="text-[11px] text-on-surface-variant/90 leading-relaxed">
                      {profile.tagline}
                    </p>
                  </div>

                  {/* Core skills */}
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-extrabold uppercase tracking-widest text-secondary font-headline">
                      Core Skills
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-[11px] text-on-surface-variant/90">
                      <div className="space-y-1">
                        {skillsData.column1.map((s, i) => (
                          <p key={i}>• {s}</p>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {skillsData.column2.map((s, i) => (
                          <p key={i}>• {s}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Experience log */}
                  <div className="space-y-3">
                    <h3 className="text-[9px] font-extrabold uppercase tracking-widest text-secondary font-headline">
                      Experience
                    </h3>
                    <div className="space-y-3">
                      {experienceList.map((exp, i) => (
                        <div key={i} className="text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                            <span>{exp.role} @ {exp.company}</span>
                            <span>{exp.period}</span>
                          </div>
                          {exp.bullets.map((b, bIdx) => (
                            <p key={bIdx} className="text-[10px] text-on-surface-variant italic mt-1 pl-2">
                              • {b}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 bg-opacity-0 backdrop-blur-[0px] group-hover:bg-black/35 group-hover:backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 gap-4">
                <button
                  id="cv-full-preview-btn"
                  onClick={() => setIsFullPreview(true)}
                  className="bg-white dark:bg-slate-800 text-on-surface px-6 py-2.5 rounded-full flex items-center gap-2 shadow-xl font-headline text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Eye size={15} />
                  Full Screen Preview
                </button>
                {isOwner && (
                  <button
                    id="cv-edit-overlay-btn"
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-xl font-headline text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 size={15} />
                    Edit Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Sheet Lightbox Modal on Screen */}
      <AnimatePresence>
        {isFullPreview && (
          <div
            id="resume-full-screen-preview"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            {/* Backdrop closes */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsFullPreview(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 border border-outline-variant/30 text-slate-900 dark:text-white max-w-4xl w-full h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6 md:p-12 flex flex-col gap-6 z-10"
            >
              {/* Close and actions header */}
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/10">
                <span className="font-headline text-xs font-extrabold text-primary uppercase tracking-widest">
                  Interactive Curriculum Vitae
                </span>
                
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <button
                      onClick={handlePrint}
                      className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors cursor-pointer"
                      title="Print Document"
                    >
                      <Printer size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsFullPreview(false)}
                    className="p-2 text-on-surface-variant hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Close Screen"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Printable Body Content */}
              <div className="flex-grow space-y-8 text-left mt-4 text-xs font-sans">
                {/* Print Title Block */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-primary pb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold font-headline text-slate-900 dark:text-white">
                      {profile.name}
                    </h1>
                    <p className="text-sm font-semibold text-primary tracking-wide uppercase mt-1">
                      {profile.role}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 font-medium text-slate-600 dark:text-slate-400 space-y-1 text-xs md:text-right">
                    <p className="flex items-center gap-1 md:justify-end">
                      <span className="font-bold">Email:</span> narendragond012@gmail.com
                    </p>
                    <p className="flex items-center gap-1 md:justify-end">
                      <span className="font-bold">Location:</span> Pune, Maharashtra, India
                    </p>
                    <p className="flex items-center gap-1 md:justify-end">
                      <span className="font-bold">Portfolio:</span> narendragond.dev
                    </p>
                  </div>
                </div>

                {/* Section Summary */}
                <div className="space-y-3">
                  <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-2 border-b border-outline-variant/10 pb-1">
                    <Award size={14} /> Professional Summary
                  </h2>
                  <p className="leading-relaxed text-on-surface-variant font-medium">
                    {profile.tagline}
                  </p>
                </div>

                {/* Grid Skills & Education */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-2 border-b border-outline-variant/10 pb-1">
                      <Briefcase size={14} /> Core Technical Expertise
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-on-surface-variant font-medium">
                      <div className="space-y-1.5">
                        {skillsData.column1.map((s, i) => (
                          <p key={i} className="flex items-center gap-1.5">• {s}</p>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {skillsData.column2.map((s, i) => (
                          <p key={i} className="flex items-center gap-1.5">• {s}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-2 border-b border-outline-variant/10 pb-1">
                      <GraduationCap size={14} /> Education Background
                    </h2>
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{aboutData.education.institution}</span>
                        <span className="text-primary">{aboutData.education.period}</span>
                      </div>
                      <p className="font-semibold text-on-surface-variant">{aboutData.education.degree} (CGPA: {aboutData.education.cgpa})</p>
                      <ul className="text-on-surface-variant list-disc pl-4 space-y-0.5">
                        <li>{aboutData.education.details}</li>
                        {aboutData.education.honors?.map((hon, hIdx) => (
                          <li key={hIdx}>{hon}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Full experience detail list */}
                <div className="space-y-4">
                  <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-2 border-b border-outline-variant/10 pb-1">
                    <Briefcase size={14} /> Chronological Work Experience
                  </h2>

                  <div className="space-y-6">
                    {/* Direct Map of Experiences */}
                    {experienceList.map((exp, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-800 dark:text-slate-200 text-sm">{exp.role} @ {exp.company}</span>
                          <span className="text-primary">{exp.period}</span>
                        </div>
                        <p className="text-on-surface-variant font-medium">{exp.description}</p>
                        <ul className="list-disc pl-4 space-y-1.5 text-on-surface-variant font-medium">
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Button at bottom */}
              <div className="pt-4 border-t border-outline-variant/10 text-right">
                <button
                  onClick={() => setIsFullPreview(false)}
                  className="px-6 py-2 bg-primary text-white font-headline text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  Done Reviewing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditResumeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </section>
  );
}
