import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, ArrowDown, Edit, Sparkles } from 'lucide-react';
import { HERO_DATA } from "../../data";
import { NavSection } from '../../types';
import EditProfileModal from "../modals/EditProfileModal";

interface HeroProps {
  onNavigate: (section: NavSection) => void;
  isOwner?: boolean;
}

export default function Hero({ onNavigate, isOwner = false }: HeroProps) {
  // Initialize state from localStorage if available, otherwise use defaults
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('portfolio_custom_profile');
    return saved ? JSON.parse(saved) : {
      name: HERO_DATA.name,
      role: HERO_DATA.role,
      tagline: HERO_DATA.tagline,
      statusTag: HERO_DATA.statusTag,
      avatarImage: HERO_DATA.avatarImage,
      fallbackImage: HERO_DATA.fallbackImage
    };
  });

  const [imgSrc, setImgSrc] = useState(profile.avatarImage);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync image source if profile updates
  useEffect(() => {
    setImgSrc(profile.avatarImage);
  }, [profile.avatarImage]);

  // Listen to profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };
    window.addEventListener('portfolio_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('portfolio_profile_updated', handleProfileUpdate);
    };
  }, []);

  const handleSaveProfile = (updated: typeof profile) => {
    setProfile(updated);
    localStorage.setItem('portfolio_custom_profile', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('portfolio_profile_updated', { detail: updated }));
  };

  const handleResetProfile = () => {
    const defaults = {
      name: HERO_DATA.name,
      role: HERO_DATA.role,
      tagline: HERO_DATA.tagline,
      statusTag: HERO_DATA.statusTag,
      avatarImage: HERO_DATA.avatarImage,
      fallbackImage: HERO_DATA.fallbackImage
    };
    setProfile(defaults);
    localStorage.removeItem('portfolio_custom_profile');
    window.dispatchEvent(new CustomEvent('portfolio_profile_updated', { detail: defaults }));
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-background"
    >
      {/* Decorative gradient spot */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-16 w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left column info */}
        <motion.div
          id="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 1, 0.3, 1] }}
          className="flex flex-col items-start text-left"
        >
          {/* Badge */}
          <span
            id="hero-badge"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-headline text-xs font-bold mb-6 uppercase tracking-wider"
          >
            <Briefcase size={14} />
            {profile.statusTag}
          </span>

          {/* Headline */}
          <h1
            id="hero-title"
            className="font-headline text-4xl md:text-6xl font-extrabold mb-4 text-on-surface leading-tight tracking-tight flex flex-wrap items-center gap-x-4"
          >
            {profile.name}
          </h1>

          <h3 className="font-headline text-lg md:text-xl font-bold text-primary mb-3">
            {profile.role}
          </h3>

          {/* Subtitle */}
          <p
            id="hero-tagline"
            className="font-headline text-sm md:text-base text-on-surface-variant font-medium mb-8 max-w-lg leading-relaxed text-left"
          >
            {profile.tagline}
          </p>

          {/* Actions */}
          <div id="hero-actions" className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => onNavigate('projects')}
              className="px-8 py-4 bg-primary text-white rounded-lg font-headline text-sm font-semibold tracking-wide hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer"
            >
              View My Work
            </button>
            {isOwner && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-4 border border-primary/20 text-primary hover:text-white bg-primary/5 hover:bg-primary rounded-lg font-headline text-sm font-semibold tracking-wide hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>
 
        {/* Right column image representation */}
        <motion.div
          id="hero-visual"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 1, 0.3, 1] }}
          className="relative flex justify-center items-center"
        >
          <div className="relative w-full aspect-square max-w-[420px]">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-secondary/25 opacity-40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/20 opacity-35 rounded-full blur-3xl pointer-events-none" />

            <div
              id="portrait-frame"
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-outline-variant/25 transition-transform duration-500 hover:scale-[1.01] group/frame"
            >
              <img
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
                src={imgSrc}
                onError={() => {
                  if (imgSrc !== profile.fallbackImage) {
                    setImgSrc(profile.fallbackImage);
                  }
                }}
                alt={`${profile.name} Portrait`}
              />

              {isOwner && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute top-4 right-4 p-3 bg-surface-container-lowest/90 hover:bg-primary hover:text-white text-primary rounded-full shadow-lg backdrop-blur-md border border-outline-variant/40 transition-all duration-300 transform scale-90 hover:scale-100 group cursor-pointer z-10"
                  title="Edit profile photo and details"
                >
                  <Edit size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                </button>
              )}

              {isOwner && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-12 pb-4 text-center opacity-0 group-hover/frame:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-1">
                    <Sparkles size={12} className="text-yellow-400" />
                    Click gear or button to customize profile
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <motion.button
          onClick={() => onNavigate('about')}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="p-2 rounded-full border border-outline-variant/30 bg-surface/50 backdrop-blur-md text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer"
          aria-label="Scroll to next section"
        >
          <ArrowDown size={18} />
        </motion.button>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
      />
    </section>
  );
}