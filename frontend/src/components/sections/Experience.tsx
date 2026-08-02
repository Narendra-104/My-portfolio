import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Briefcase, Edit3, Plus } from 'lucide-react';
import { EXPERIENCE_DATA } from "../../data";
import EditResumeModal from "../modals/EditResumeModal";
import { fetchPortfolioSetting } from '../../lib/db';

interface ExperienceProps {
  isOwner?: boolean;
}

export default function Experience({ isOwner = false }: ExperienceProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [experienceList, setExperienceList] = useState<any[]>(() => {
    const saved = localStorage.getItem('portfolio_custom_experience');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return EXPERIENCE_DATA;
  });

  useEffect(() => {
    async function syncDbExperience() {
      const dbExp = await fetchPortfolioSetting<any[]>('portfolio_custom_experience');
      if (dbExp && Array.isArray(dbExp) && dbExp.length > 0) {
        setExperienceList(dbExp);
        localStorage.setItem('portfolio_custom_experience', JSON.stringify(dbExp));
      }
    }
    syncDbExperience();

    const checkUpdates = () => {
      const saved = localStorage.getItem('portfolio_custom_experience');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setExperienceList(parsed);
            return;
          }
        } catch (e) {}
      }
      setExperienceList(EXPERIENCE_DATA);
    };
    checkUpdates();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setExperienceList(customEvent.detail);
      }
    };
    window.addEventListener('portfolio_experiences_updated', handleUpdate);

    return () => {
      window.removeEventListener('portfolio_experiences_updated', handleUpdate);
    };
  }, []);

 const handleAddExperience = () => {
  const newExp = {
    id: `exp_${Date.now()}`, // Unique ID based on timestamp
    role: 'New Professional Role',
    company: 'New Company / Project',
    location: 'City, Country',
    period: 'Year Start — Year End',
    description: 'Add a brief overview of your responsibilities here.',
    bullets: ['New achievement 1', 'New achievement 2'],
    skills: ['Skill 1', 'Skill 2']
  };
    const updatedList = [...experienceList, newExp];
  setExperienceList(updatedList);
  localStorage.setItem('portfolio_custom_experience', JSON.stringify(updatedList));

  // Optional: Trigger a custom event if your app listens for it
  window.dispatchEvent(new CustomEvent('portfolio_experiences_updated', { detail: updatedList }));
  
  // Open modal to let user edit immediately
  setIsEditModalOpen(true);
  };

 return (
    <section id="experience" className="py-24 bg-surface-container-low scroll-mt-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        {/* Title & Buttons Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-secondary font-headline text-xs font-bold uppercase tracking-widest mb-3 block">
              Vocational History
            </span>
            <h2 className="font-headline text-3xl font-bold text-on-surface">
              Relevant Experience
            </h2>
            <div className="w-12 h-1 bg-secondary rounded-full mt-4" />
          </div>

          {/* Corrected Button Container */}
          {isOwner && (
  <div className="flex flex-wrap items-center gap-3 relative z-20">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
      }}
      className="inline-flex items-center gap-2 border border-outline hover:bg-surface-container text-on-surface px-4 py-2.5 rounded-lg font-headline text-xs font-bold transition-all cursor-pointer"
    >
      <Edit3 size={14} />
      Edit Experience
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleAddExperience();
      }}
      className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2.5 rounded-lg font-headline text-xs font-bold transition-all cursor-pointer"
    >
      <Plus size={14} />
      Add Experience
    </button>
  </div>
)}
        </div>

        {/* Timeline structure */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-[16px] md:left-1/2 top-0 bottom-0 w-0.5 bg-outline-variant/30 -translate-x-1/2" />
          
          <div className="space-y-12">
            {experienceList.map((exp, idx) => {
              const even = idx % 2 === 0;
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col md:flex-row items-stretch ${even ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="absolute left-[16px] md:left-1/2 top-6 w-8 h-8 rounded-full border-4 border-surface-container-low bg-secondary flex items-center justify-center text-white shadow-md z-10 -translate-x-1/2">
                    <Briefcase size={12} />
                  </div>
                  <div className="hidden md:block w-1/2" />
                  <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-secondary/20 hover:scale-[1.01]">
                      <span className="font-sans text-[10px] font-extrabold text-secondary uppercase tracking-widest block">{exp.company}</span>
                      <h3 className="font-headline text-lg font-bold text-on-surface">{exp.role}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-on-surface-variant/80 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={13} className="text-secondary/70" />{exp.period}</span>
                        <span className="flex items-center gap-1"><MapPin size={13} className="text-secondary/70" />{exp.location}</span>
                      </div>
                      <p className="font-sans text-xs text-on-surface-variant font-medium mb-4 leading-relaxed">{exp.description}</p>
                      <ul className="space-y-2.5 mb-6 text-left">
                        {exp.bullets.map((bullet: string, bIdx: number) => (
                          <li key={bIdx} className="flex gap-2 text-on-surface-variant">
                            <span className="text-secondary font-bold text-xs mt-[3px] select-none">•</span>
                            <span className="font-sans text-xs leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-outline-variant/10">
                        {exp.skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 bg-surface-container-low text-secondary rounded-md text-[9px] font-bold tracking-wider">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div> {/* Closes space-y-12 */}
        </div> {/* Closes max-w-3xl */}
      </div> {/* Closes max-w-7xl */}

      {isOwner && (
        <EditResumeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          experiences={experienceList}
          setExperiences={setExperienceList}
        />
      )}
    </section>
  );
}