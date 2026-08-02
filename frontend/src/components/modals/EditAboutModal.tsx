import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, AlertCircle, Sparkles, BookOpen, Award, Plus, Trash2, User } from 'lucide-react';
import { ABOUT_DATA } from "../../data";
import { Education } from '../../types';
import { upsertPortfolioSetting, fetchPortfolioSetting } from '../../lib/db';

interface EditAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function EditAboutModal({ isOpen, onClose, onSave }: EditAboutModalProps) {
  // 1. Bio States
  const [byline, setByline] = useState('');
  const [journey, setJourney] = useState('');
  const [careerObjective, setCareerObjective] = useState('');

  // 2. Education States
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduCgpa, setEduCgpa] = useState('');
  const [eduPeriod, setEduPeriod] = useState('');
  const [eduDetails, setEduDetails] = useState('');
  const [eduHonors, setEduHonors] = useState<string[]>([]);

  // 3. Specialization States
  const [specTitle, setSpecTitle] = useState('');
  const [specBullets, setSpecBullets] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Initialize/load state on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      async function loadAbout() {
        const dbAbout = await fetchPortfolioSetting<any>('portfolio_custom_about');
        let parsed = dbAbout;
        if (!parsed) {
          const savedAbout = localStorage.getItem('portfolio_custom_about');
          if (savedAbout) {
            try { parsed = JSON.parse(savedAbout); } catch (e) {}
          }
        }
        if (parsed) {
          setByline(parsed.byline || ABOUT_DATA.byline);
          setJourney(parsed.journey || ABOUT_DATA.journey);
          setCareerObjective(parsed.careerObjective || ABOUT_DATA.careerObjective);
          
          if (parsed.education) {
            setEduInstitution(parsed.education.institution || ABOUT_DATA.education.institution);
            setEduDegree(parsed.education.degree || ABOUT_DATA.education.degree);
            setEduCgpa(parsed.education.cgpa || ABOUT_DATA.education.cgpa);
            setEduPeriod(parsed.education.period || ABOUT_DATA.education.period);
            setEduDetails(parsed.education.details || ABOUT_DATA.education.details);
            setEduHonors(parsed.education.honors || ABOUT_DATA.education.honors || []);
          } else {
            setEduInstitution(ABOUT_DATA.education.institution);
            setEduDegree(ABOUT_DATA.education.degree);
            setEduCgpa(ABOUT_DATA.education.cgpa);
            setEduPeriod(ABOUT_DATA.education.period);
            setEduDetails(ABOUT_DATA.education.details);
            setEduHonors(ABOUT_DATA.education.honors || []);
          }

          if (parsed.specialization) {
            setSpecTitle(parsed.specialization.title || ABOUT_DATA.specialization.title);
            setSpecBullets(parsed.specialization.bullets || ABOUT_DATA.specialization.bullets || []);
          } else {
            setSpecTitle(ABOUT_DATA.specialization.title);
            setSpecBullets(ABOUT_DATA.specialization.bullets || []);
          }
        } else {
          setByline(ABOUT_DATA.byline);
          setJourney(ABOUT_DATA.journey);
          setCareerObjective(ABOUT_DATA.careerObjective);
          setEduInstitution(ABOUT_DATA.education.institution);
          setEduDegree(ABOUT_DATA.education.degree);
          setEduCgpa(ABOUT_DATA.education.cgpa);
          setEduPeriod(ABOUT_DATA.education.period);
          setEduDetails(ABOUT_DATA.education.details);
          setEduHonors(ABOUT_DATA.education.honors || []);
          setSpecTitle(ABOUT_DATA.specialization.title);
          setSpecBullets(ABOUT_DATA.specialization.bullets || []);
        }
      }
      loadAbout();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manage Honor additions & removals
  const handleAddHonor = () => {
    setEduHonors(prev => [...prev, 'New Academic Honor']);
  };

  const handleUpdateHonor = (index: number, val: string) => {
    setEduHonors(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveHonor = (index: number) => {
    setEduHonors(prev => prev.filter((_, i) => i !== index));
  };

  // Manage Specialization bullet additions & removals
  const handleAddSpecBullet = () => {
    setSpecBullets(prev => [...prev, 'New Specialization Bullet']);
  };

  const handleUpdateSpecBullet = (index: number, val: string) => {
    setSpecBullets(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveSpecBullet = (index: number) => {
    setSpecBullets(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetDefaults = () => {
    if (confirm('Reset About Me sections to defaults?')) {
      localStorage.removeItem('portfolio_custom_about');
      onSave?.();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorStatus(null);

    try {
      const curEdu: Education = {
        institution: eduInstitution.trim() || ABOUT_DATA.education.institution,
        degree: eduDegree.trim() || ABOUT_DATA.education.degree,
        cgpa: eduCgpa.trim() || ABOUT_DATA.education.cgpa,
        period: eduPeriod.trim() || ABOUT_DATA.education.period,
        details: eduDetails.trim() || ABOUT_DATA.education.details,
        honors: eduHonors.map(h => h.trim()).filter(Boolean)
      };

      const customAbout = {
        byline: byline.trim() || ABOUT_DATA.byline,
        journey: journey.trim() || ABOUT_DATA.journey,
        careerObjective: careerObjective.trim() || ABOUT_DATA.careerObjective,
        education: curEdu,
        specialization: {
          title: specTitle.trim() || ABOUT_DATA.specialization.title,
          bullets: specBullets.map(b => b.trim()).filter(Boolean)
        }
      };

      // 1. Save to Supabase DB
      await upsertPortfolioSetting('portfolio_custom_about', customAbout);

      // 2. Save to LocalStorage cache
      localStorage.setItem('portfolio_custom_about', JSON.stringify(customAbout));

      setSaving(false);
      onSave?.();
      onClose();
    } catch (err: any) {
      setSaving(false);
      setErrorStatus(err.message || 'An error occurred while saving about configurations.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-surface-container-lowest border border-outline/20 rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[92vh] z-10 text-left transition-all"
        id="about-edit-modal-container"
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
            Edit About Me Details
          </h2>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Configure the central narrative of your portfolio. Modify your professional byline summary, detailed bio story, career target, education records, and training specialization milestones instantly on-disk.
          </p>
        </div>

        {saving ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 animate-bounce animate-pulse">
              <Check size={28} />
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Saving Custom Profile...</h3>
            <p className="text-xs text-on-surface-variant mt-1">Re-compiling and syncing all client-side layout trees.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorStatus && (
              <div className="p-3.5 bg-error/10 border border-error/20 text-error text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}

            {/* Section 1: Narratives & Bio */}
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
                <User size={16} className="text-primary" />
                <h3 className="font-headline text-sm font-extrabold text-on-surface uppercase tracking-wider">
                  Narrative & Biography
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-byline-input">
                    Headline Byline (Brief Summary text)
                  </label>
                  <textarea
                    id="about-byline-input"
                    value={byline}
                    onChange={(e) => setByline(e.target.value)}
                    placeholder="Short introduction headline displayed below About title"
                    className="w-full h-18 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-journey-input">
                      The Journey story
                    </label>
                    <textarea
                      id="about-journey-input"
                      value={journey}
                      onChange={(e) => setJourney(e.target.value)}
                      placeholder="Narrate your computer engineering history and background details..."
                      className="w-full h-36 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-objective-input">
                      Career Objective
                    </label>
                    <textarea
                      id="about-objective-input"
                      value={careerObjective}
                      onChange={(e) => setCareerObjective(e.target.value)}
                      placeholder="Specify your targeted professional role, key pursuits, and aspirations..."
                      className="w-full h-36 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Education Details */}
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
                <BookOpen size={16} className="text-primary" />
                <h3 className="font-headline text-sm font-extrabold text-on-surface uppercase tracking-wider">
                  Education Record (Bento Card)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-edu-inst">
                    University / Institution
                  </label>
                  <input
                    type="text"
                    id="about-edu-inst"
                    value={eduInstitution}
                    onChange={(e) => setEduInstitution(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-edu-deg">
                    Degree / Branch
                  </label>
                  <input
                    type="text"
                    id="about-edu-deg"
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-edu-cgpa">
                    CGPA / Marks
                  </label>
                  <input
                    type="text"
                    id="about-edu-cgpa"
                    value={eduCgpa}
                    onChange={(e) => setEduCgpa(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-edu-per">
                    Study Years Period
                  </label>
                  <input
                    type="text"
                    id="about-edu-per"
                    value={eduPeriod}
                    onChange={(e) => setEduPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-edu-details">
                  Education Details / Curriculum description
                </label>
                <textarea
                  id="about-edu-details"
                  value={eduDetails}
                  onChange={(e) => setEduDetails(e.target.value)}
                  className="w-full h-16 px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-on-surface">
                    Academic Honors / GPA Achievements
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHonor}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add Honor
                  </button>
                </div>
                <div className="space-y-2">
                  {eduHonors.map((honor, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={honor}
                        onChange={(e) => handleUpdateHonor(index, e.target.value)}
                        className="flex-grow px-3 py-1.5 text-xs bg-surface-container border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary"
                        placeholder="e.g. Second Year CGPA: 8.55 / 10"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHonor(index)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {eduHonors.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant/50 italic">No Honors added. Click button to add.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Specialization Details */}
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
                <Award size={16} className="text-primary" />
                <h3 className="font-headline text-sm font-extrabold text-on-surface uppercase tracking-wider">
                  Specialization Milestone (Bento Card)
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1" htmlFor="about-spec-title">
                  Specialization Card Title
                </label>
                <input
                  type="text"
                  id="about-spec-title"
                  value={specTitle}
                  onChange={(e) => setSpecTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-surface-container border border-outline-variant hover:border-outline focus:border-primary focus:outline-none rounded-lg text-on-surface transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-on-surface">
                    Specialized Competencies (Bullets)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecBullet}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add Competency
                  </button>
                </div>
                <div className="space-y-2">
                  {specBullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleUpdateSpecBullet(index, e.target.value)}
                        className="flex-grow px-3 py-1.5 text-xs bg-surface-container border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary"
                        placeholder="e.g. Data Structures & Algorithm Design"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecBullet(index)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {specBullets.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant/50 italic">No competencies added. Click button to add.</p>
                  )}
                </div>
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
                  Validate &amp; Save About
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
