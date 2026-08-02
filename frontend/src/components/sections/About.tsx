import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Award, Check, Edit3 } from 'lucide-react';
import { ABOUT_DATA } from "../../data";
import EditAboutModal from "../modals/EditAboutModal";
import { fetchPortfolioSetting } from '../../lib/db';

interface AboutProps {
  isOwner?: boolean;
}

export default function About({ isOwner = false }: AboutProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [aboutData, setAboutData] = useState(() => {
    const saved = localStorage.getItem('portfolio_custom_about');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.education) {
          return parsed;
        }
      } catch (e) {}
    }
    return ABOUT_DATA;
  });

  const checkUpdates = async () => {
    const dbAbout = await fetchPortfolioSetting<any>('portfolio_custom_about');
    if (dbAbout && dbAbout.education) {
      setAboutData(dbAbout);
      localStorage.setItem('portfolio_custom_about', JSON.stringify(dbAbout));
      return;
    }
    const saved = localStorage.getItem('portfolio_custom_about');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.education) {
          setAboutData(parsed);
          return;
        }
      } catch (e) {}
    }
    setAboutData(ABOUT_DATA);
  };

  useEffect(() => {
    checkUpdates();

    const interval = setInterval(checkUpdates, 1000);
    window.addEventListener('storage', checkUpdates);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkUpdates);
    };
  }, []);

  return (
    <section
      id="about"
      className="py-24 bg-surface-container-low border-y border-outline-variant/10 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Section Heading Panel */}
          <motion.div
            id="about-headline-panel"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="md:col-span-4 flex flex-col items-start text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
                About Me
              </h2>
              {isOwner && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                  title="Edit About Me section"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>
            <div className="w-12 h-1.5 bg-primary rounded-full mb-8 animate-pulse" />
            <p className="font-sans text-xl font-medium text-on-surface-variant leading-relaxed">
              {aboutData.byline}
            </p>
          </motion.div>

          {/* Core Content & Bento Cards */}
          <div className="md:col-span-8 flex flex-col gap-12 text-left">
            {/* The Journey and Career objective columns */}
            <motion.div
              id="about-bio-grid"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-4">
                  The Journey
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {aboutData.journey}
                </p>
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-4">
                  Career Objective
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {aboutData.careerObjective}
                </p>
              </div>
            </motion.div>

            {/* Bento-style education cards */}
            <motion.div
              id="about-bento-grid"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* JSPM University Bento Card */}
              <div
                id="bento-education-card"
                className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-primary/25 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <span className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block">
                      University
                    </span>
                    <p className="font-headline text-base font-bold text-on-surface">
                      {aboutData.education.institution}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-sans text-sm font-bold text-on-surface">
                    {aboutData.education.degree}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="font-sans text-xs text-on-surface-variant font-medium">
                      CGPA: {aboutData.education.cgpa}
                    </p>
                  </div>
                  {aboutData.education.honors?.map((honor, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <p className="font-sans text-xs text-on-surface-variant font-medium">
                        {honor}
                      </p>
                    </div>
                  ))}
                  <p className="font-sans text-[11px] text-on-surface-variant/80 mt-1 italic block pt-2 border-t border-outline-variant/10">
                    {aboutData.education.details}
                  </p>
                </div>
              </div>

              {/* Specialization Card */}
              <div
                id="bento-specialization-card"
                className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-secondary/25 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block">
                      Specialization
                    </span>
                    <p className="font-headline text-base font-bold text-on-surface">
                      {aboutData.specialization?.title || 'Specialization'}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {aboutData.specialization?.bullets?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-on-surface-variant">
                      <span className="mt-1 flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-secondary/10 text-secondary">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span className="font-sans text-xs font-semibold">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <EditAboutModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={checkUpdates} 
      />
    </section>
  );
}
