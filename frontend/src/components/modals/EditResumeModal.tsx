import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, AlertCircle, Sparkles, BookOpen, Layers, Briefcase, Plus, Trash2 } from 'lucide-react';
import { EXPERIENCE_DATA, ABOUT_DATA, RESUME_SKILLS } from "../../data";
import { Experience, Education } from '../../types';
import { fetchPortfolioSetting, upsertPortfolioSetting } from '../../lib/db';

interface EditResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  experiences?: Experience[];
  setExperiences?: any;
}

export default function EditResumeModal({ isOpen, onClose, onSave, experiences: propExperiences, setExperiences: propSetExperiences }: EditResumeModalProps) {
  // 1. Education State
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduCgpa, setEduCgpa] = useState('');
  const [eduPeriod, setEduPeriod] = useState('');
  const [eduDetails, setEduDetails] = useState('');

  // 2. Skills Columns State
  const [skillsCol1, setSkillsCol1] = useState('');
  const [skillsCol2, setSkillsCol2] = useState('');

  // 3. Experience State
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Initialize/load state on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load Education
      const savedEdu = localStorage.getItem('portfolio_custom_about');
      if (savedEdu) {
        try {
          const parsed = JSON.parse(savedEdu);
          if (parsed && parsed.education) {
            setEduInstitution(parsed.education.institution || '');
            setEduDegree(parsed.education.degree || '');
            setEduCgpa(parsed.education.cgpa || '');
            setEduPeriod(parsed.education.period || '');
            setEduDetails(parsed.education.details || '');
          }
        } catch (e) {
          // ignore
        }
      } else {
        setEduInstitution(ABOUT_DATA.education.institution);
        setEduDegree(ABOUT_DATA.education.degree);
        setEduCgpa(ABOUT_DATA.education.cgpa);
        setEduPeriod(ABOUT_DATA.education.period);
        setEduDetails(ABOUT_DATA.education.details);
      }

      // Load Skills
      const savedSkills = localStorage.getItem('portfolio_custom_skills');
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (parsed) {
            setSkillsCol1(parsed.column1 ? parsed.column1.join(', ') : '');
            setSkillsCol2(parsed.column2 ? parsed.column2.join(', ') : '');
          }
        } catch (e) {
          // ignore
        }
      } else {
        setSkillsCol1(RESUME_SKILLS.column1.join(', '));
        setSkillsCol2(RESUME_SKILLS.column2.join(', '));
      }

      // Load Experiences from LocalStorage or default
      const savedExp = localStorage.getItem('portfolio_custom_experience');
      if (savedExp) {
        try {
          const parsed = JSON.parse(savedExp);
          if (Array.isArray(parsed)) {
            setExperiences(parsed);
          } else {
            setExperiences(JSON.parse(JSON.stringify(EXPERIENCE_DATA)));
          }
        } catch (e) {
          setExperiences(JSON.parse(JSON.stringify(EXPERIENCE_DATA)));
        }
      } else {
        setExperiences(JSON.parse(JSON.stringify(EXPERIENCE_DATA)));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manage dynamic experience item updates
  const updateExperienceField = (id: string, field: keyof Experience, value: any) => {
    setExperiences(prev =>
      prev.map(exp => {
        if (exp.id === id) {
          return { ...exp, [field]: value };
        }
        return exp;
      })
    );
  };

  const handleAddField = () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      role: 'New Professional Role',
      company: 'Corporate Business or Project Company',
      location: 'City, Country or Online',
      period: 'Year Start — Year End',
      description: 'Brief overview outline of main execution and team leadership tasks.',
      bullets: [
        'Completed structural project deliverables on target',
        'Refined code components to maximize resource efficiency'
      ],
      skills: ['Python', 'Problem Solving']
    };
    setExperiences(prev => [...prev, newExp]);
  };

  const handleDeleteField = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const handleResetDefaults = () => {
    setSaving(true);
    setErrorStatus(null);
    try {
      // Clear custom values in LocalStorage
      localStorage.removeItem('portfolio_custom_about');
      localStorage.removeItem('portfolio_custom_skills');
      localStorage.removeItem('portfolio_custom_experience');

      window.dispatchEvent(new CustomEvent('portfolio_experiences_updated', { detail: EXPERIENCE_DATA }));

      setSaving(false);
      onSave?.();
      onClose();
    } catch (err: any) {
      setSaving(false);
      setErrorStatus(err.message || 'An error occurred while resetting defaults.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorStatus(null);

    try {
      // 1. Pack Education/About Data
      const curEdu: Education = {
        institution: eduInstitution.trim() || ABOUT_DATA.education.institution,
        degree: eduDegree.trim() || ABOUT_DATA.education.degree,
        cgpa: eduCgpa.trim() || ABOUT_DATA.education.cgpa,
        period: eduPeriod.trim() || ABOUT_DATA.education.period,
        details: eduDetails.trim() || ABOUT_DATA.education.details,
        honors: ABOUT_DATA.education.honors
      };
      
      const customAbout = {
        ...ABOUT_DATA,
        education: curEdu
      };

      // 2. Pack Skills
      const finalSkills = {
        column1: skillsCol1.split(',').map(s => s.trim()).filter(Boolean),
        column2: skillsCol2.split(',').map(s => s.trim()).filter(Boolean)
      };

      // 3. Save ALL to Supabase DB!
      await Promise.all([
        upsertPortfolioSetting('portfolio_custom_about', customAbout),
        upsertPortfolioSetting('portfolio_custom_skills', finalSkills),
        upsertPortfolioSetting('portfolio_custom_experience', experiences)
      ]);

      // 4. Update LocalStorage cache
      localStorage.setItem('portfolio_custom_about', JSON.stringify(customAbout));
      localStorage.setItem('portfolio_custom_skills', JSON.stringify(finalSkills));
      localStorage.setItem('portfolio_custom_experience', JSON.stringify(experiences));
      
      // Dispatch live update event
      window.dispatchEvent(new CustomEvent('portfolio_experiences_updated', { detail: experiences }));

      setSaving(false);
      onSave?.();
      onClose();

    } catch (err: any) {
      setSaving(false);
      setErrorStatus(err.message || 'An error occurred while saving resume configurations.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-surface-container-lowest border border-outline/20 rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[92vh] z-10 text-left transition-all"
        id="resume-edit-modal-container"
      >
        {/* Closed Button Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          title="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header Title */}
        <div className="mb-6">
          <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" size={24} />
            Edit Interactive Resume Contents
          </h2>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Customize educational backgrounds, chronological work accomplishments, and core programming skills displayed inside your professional CV. Updates sync instantly across corresponding experience and about sections.
          </p>
        </div>

        {saving ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check size={28} />
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Saving Custom Resume...</h3>
            <p className="text-xs text-on-surface-variant mt-1">Re-compiling and syncing all client-side layout trees.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorStatus && (
              <div className="p-3.5 bg-error/10 border border-error/20 text-error text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}

            {/* Section 1: Education Metadata fields */}
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
                <BookOpen size={16} className="text-primary" />
                <h3 className="font-headline text-sm font-extrabold text-on-surface uppercase tracking-wider">
                  Academic & Education Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="edu-institution-input">
                    University / College Institution
                  </label>
                  <input
                    type="text"
                    id="edu-institution-input"
                    value={eduInstitution}
                    onChange={(e) => setEduInstitution(e.target.value)}
                    placeholder="e.g. JSPM University Pune"
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="edu-degree-input">
                    Degree / Study Field
                  </label>
                  <input
                    type="text"
                    id="edu-degree-input"
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    placeholder="e.g. B-Tech in Computer Science"
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="edu-cgpa-input">
                    CGPA / Grade Marks
                  </label>
                  <input
                    type="text"
                    id="edu-cgpa-input"
                    value={eduCgpa}
                    onChange={(e) => setEduCgpa(e.target.value)}
                    placeholder="e.g. 8.60 / 10"
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="edu-period-input">
                    Active Study Period Years
                  </label>
                  <input
                    type="text"
                    id="edu-period-input"
                    value={eduPeriod}
                    onChange={(e) => setEduPeriod(e.target.value)}
                    placeholder="e.g. 2024 — 2028"
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="edu-details-input">
                  Academics Summary / Major Focal courses
                </label>
                <textarea
                  id="edu-details-input"
                  value={eduDetails}
                  onChange={(e) => setEduDetails(e.target.value)}
                  placeholder="Focus on Data Structures, Analysis & Design of Algorithms, etc."
                  className="w-full h-16 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                />
              </div>
            </div>

            {/* Section 2: Technical Skills Columns fields */}
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
                <Layers size={16} className="text-primary" />
                <h3 className="font-headline text-sm font-extrabold text-on-surface uppercase tracking-wider">
                  Technical Core Skills List
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5" htmlFor="skills-col1-input">
                    Skills Column 1 (Separate with commas)
                  </label>
                  <textarea
                    id="skills-col1-input"
                    value={skillsCol1}
                    onChange={(e) => setSkillsCol1(e.target.value)}
                    placeholder="Python Programming, DSA Coding, Core C language"
                    className="w-full h-20 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5" htmlFor="skills-col2-input">
                    Skills Column 2 (Separate with commas)
                  </label>
                  <textarea
                    id="skills-col2-input"
                    value={skillsCol2}
                    onChange={(e) => setSkillsCol2(e.target.value)}
                    placeholder="AWS, GCP Cloud, Git Controls, Web React"
                    className="w-full h-20 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Professional Chronological Experiences list */}
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-secondary" />
                  <h3 className="font-headline text-sm font-extrabold text-on-surface uppercase tracking-wider">
                    Relevant Work & Internship Experience
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleAddField}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white hover:bg-secondary-hover rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm cursor-pointer transition-all"
                >
                  <Plus size={12} /> Add Role Section
                </button>
              </div>

              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 divide-y divide-outline/10">
                {experiences.map((exp, idx) => (
                  <div key={exp.id} className={`pt-4 first:pt-0 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                        Position #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(exp.id)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors cursor-pointer"
                        title="Remove Position"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperienceField(exp.id, 'company', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                          Professional Role / Title
                        </label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperienceField(exp.id, 'role', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                          Period Years (e.g. June 2026)
                        </label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => updateExperienceField(exp.id, 'period', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                          Location (e.g. Pune, India)
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperienceField(exp.id, 'location', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                        Overview description paragraph
                      </label>
                      <input
                        type="text"
                        value={exp.description}
                        onChange={(e) => updateExperienceField(exp.id, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                          Role bullets list (separate with semicolons ';')
                        </label>
                        <textarea
                          value={exp.bullets.join('; ')}
                          onChange={(e) => updateExperienceField(exp.id, 'bullets', e.target.value.split(';').map(x => x.trim()).filter(Boolean))}
                          className="w-full h-14 px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                          Specialization Skill tags (separate with commas)
                        </label>
                        <textarea
                          value={exp.skills.join(', ')}
                          onChange={(e) => updateExperienceField(exp.id, 'skills', e.target.value.split(',').map(x => x.trim()).filter(Boolean))}
                          className="w-full h-14 px-3 py-1.5 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-md text-on-surface transitions-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form actions footer buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline/10">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline/30 text-on-surface-variant hover:text-primary hover:border-primary/50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                Restore Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white hover:bg-primary/95 font-semibold text-xs rounded-lg shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  <Check size={14} />
                  Validate &amp; Save CV
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}