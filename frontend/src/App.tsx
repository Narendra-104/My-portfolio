import { useState, useEffect } from 'react';
import { NavSection } from './types';
import { checkSupabaseHealth } from './lib/db';
import { Cloud, CloudOff, AlertTriangle, Sparkles, X, MessageSquare, Github, Linkedin, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Layout components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Section components
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Resume from './components/sections/Resume';
import Certificates from './components/sections/Certificates';
import Contact from './components/sections/Contact';

// AI components
import PortfolioChat from './components/ai/PortfolioChat'; 

// Modal components
import OwnerLoginModal from './components/modals/OwnerLoginModal';
import OwnerAnalyticsModal from './components/modals/OwnerAnalyticsModal';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('alex_portfolio_dark_mode');
    if (saved) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isOwner, setIsOwner] = useState<boolean>(() => {
    return localStorage.getItem('is_owner') === 'true';
  });
  
  // States for Modals and AI Assistant Visibility
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isLinkedinModalOpen, setIsLinkedinModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  // Supabase sync health state
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    tables: { projects: boolean; certificates: boolean; portfolio_settings: boolean };
    storage: boolean;
    error?: string;
  } | null>(null);
  const [showDbBanner, setShowDbBanner] = useState(true);

  useEffect(() => {
    if (infoToast) {
      const timer = setTimeout(() => {
        setInfoToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [infoToast]);

  // Run Supabase health check on mount
  useEffect(() => {
    checkSupabaseHealth().then(health => {
      setDbHealth(health);
      if (!health.connected || !health.tables.projects || !health.tables.portfolio_settings) {
        console.warn('[Portfolio] Supabase health check failed:', health);
      } else {
        console.log('%c✅ Supabase connected — all tables OK', 'color: green; font-weight: bold');
      }
    });
  }, []);

  useEffect(() => {
    const isOwnerSession = localStorage.getItem('is_owner') === 'true';
    const alreadyVisited = sessionStorage.getItem('has_viewed_portfolio') === 'true';
    
    if (!isOwnerSession && !alreadyVisited) {
      const NAMESPACE = '3d3081af-1b9a-4a6d-8e90-cfe332f51c7e';
      const KEY = 'page_views';
      fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`)
        .then(res => {
          if (res.ok) {
            sessionStorage.setItem('has_viewed_portfolio', 'true');
            return res.json();
          }
        })
        .then(data => {
          if (data && typeof data.count === 'number') {
            localStorage.setItem('portfolio_backup_total_views', String(data.count));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    let lastSection = activeSection;
    let entryTime = Date.now();

    const recordDwellTime = () => {
      const duration = Math.round((Date.now() - entryTime) / 1000);
      if (duration > 0) {
        const saved = localStorage.getItem('portfolio_dwell_times');
        const dwellTimes = saved ? JSON.parse(saved) : {};
        dwellTimes[lastSection] = (dwellTimes[lastSection] || 0) + duration;
        localStorage.setItem('portfolio_dwell_times', JSON.stringify(dwellTimes));
      }
    };

    entryTime = Date.now();
    lastSection = activeSection;

    return () => {
      recordDwellTime();
    };
  }, [activeSection]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('alex_portfolio_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleSectionClick = (sectionId: NavSection) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Determine DB issues
  const tablesOk = dbHealth?.tables.projects && dbHealth?.tables.certificates && dbHealth?.tables.portfolio_settings;
  const dbOk = dbHealth?.connected && tablesOk;

  return (
    <div className="relative min-h-screen bg-background text-on-surface flex flex-col font-sans antialiased overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-5%] w-96 h-96 rounded-full bg-primary/3 blur-[120px] dark:bg-primary/5" />
        <div className="absolute bottom-[10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-secondary/3 blur-[150px] dark:bg-secondary/4" />
      </div>

      {/* Supabase DB Warning Banner — only shown to owner when DB/tables issue */}
      {isOwner && dbHealth && !dbOk && showDbBanner && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-black px-4 py-2 flex items-center justify-between text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              ⚠️ Supabase Cloud Sync Warning: {dbHealth.error || 'Tables missing.'}
              {dbHealth.error?.includes('relation') || dbHealth.error?.includes('does not exist') ? (
                <> Run <code className="bg-black/15 px-1 rounded font-mono">supabase_setup.sql</code> in your Supabase Dashboard → SQL Editor.</>
              ) : null}
            </span>
          </div>
          <button onClick={() => setShowDbBanner(false)} className="ml-3 p-0.5 rounded hover:bg-black/10 cursor-pointer shrink-0">✕</button>
        </div>
      )}

      {/* Cloud sync status badge — always visible to owner */}
      {isOwner && dbHealth && (
        <div className={`fixed bottom-20 left-4 z-[130] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg border ${
          dbOk
            ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          {dbOk ? <Cloud size={12} /> : <CloudOff size={12} />}
          {dbOk ? 'Cloud Synced' : 'Local Only'}
        </div>
      )}

      <AnimatePresence>
        {infoToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-black/90 dark:bg-black/95 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-white/10"
          >
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span>{infoToast}</span>
            <button
              onClick={() => setInfoToast(null)}
              className="p-1 rounded-full hover:bg-white/10 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isOwner={isOwner}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setIsOwner(false);
          setIsAnalyticsOpen(false);
          localStorage.removeItem('is_owner');
          setInfoToast('Logged out of Owner Mode.');
        }}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      <main className="flex-grow z-10 pt-20">
        {activeSection === 'home' && <Hero onNavigate={handleSectionClick} isOwner={isOwner} />}
        {activeSection === 'about' && <About isOwner={isOwner} />}
        {activeSection === 'projects' && <Projects isOwner={isOwner} />}
        {activeSection === 'experience' && <Experience isOwner={isOwner} />}
        {activeSection === 'resume' && <Resume isOwner={isOwner} />}
        {activeSection === 'certificates' && <Certificates isOwner={isOwner} />}
        {activeSection === 'contact' && (
          <Contact
            isOwner={isOwner}
            onShowGithubId={() => setIsGithubModalOpen(true)}
            onShowLinkedinId={() => setIsLinkedinModalOpen(true)}
          />
        )}
      </main>

      {/* Floating AI Toggle Button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 z-[140] flex items-center gap-2 bg-primary text-on-primary hover:opacity-95 shadow-xl px-4 py-3 rounded-full transition-transform transform hover:scale-105 active:scale-95 cursor-pointer border border-outline/10"
          >
            <MessageSquare size={18} />
            <span className="text-xs font-bold tracking-wide">Ask My AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant Panel Overlays */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] cursor-pointer"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-background border-l border-outline/20 shadow-2xl z-[160] flex flex-col p-4 pt-6"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="font-headline font-bold text-sm">Portfolio Assistant</span>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-grow h-full overflow-hidden">
                <PortfolioChat />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* GitHub ID Modal */}
      <AnimatePresence>
        {isGithubModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGithubModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[170] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[180] w-[90%] max-w-sm bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                <div className="flex items-center gap-2">
                  <Github size={20} className="text-primary" />
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    GitHub Profile
                  </h3>
                </div>
                <button
                  onClick={() => setIsGithubModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/15 text-center space-y-1">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Username / Handle
                </span>
                <p className="font-mono text-sm font-bold text-primary select-all">
                  Narendra-104
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href="https://github.com/Narendra-104"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary text-white font-headline text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText("Narendra-104");
                    alert("GitHub handle copied to clipboard!");
                  }}
                  className="px-3 py-2.5 text-xs font-headline font-bold bg-surface-container-high text-on-surface rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  Copy Handle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LinkedIn ID Modal */}
      <AnimatePresence>
        {isLinkedinModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLinkedinModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[170] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[180] w-[90%] max-w-sm bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                <div className="flex items-center gap-2">
                  <Linkedin size={20} className="text-primary" />
                  <h3 className="font-headline font-bold text-base text-on-surface">LinkedIn Profile</h3>
                </div>
                <button
                  onClick={() => setIsLinkedinModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/15 text-center space-y-1">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Public Profile ID</span>
                <p className="font-mono text-sm font-bold text-primary select-all">narendra-gond-83a050329</p>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href="https://linkedin.com/in/narendra-gond-83a050329"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary text-white font-headline text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  Visit Profile <ExternalLink size={12} />
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText("narendra-gond-83a050329");
                    alert("LinkedIn ID copied to clipboard!");
                  }}
                  className="px-3 py-2.5 text-xs font-headline font-bold bg-surface-container-high text-on-surface rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  Copy Handle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer
        onNavigate={handleSectionClick}
        isOwner={isOwner}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onShowGithubId={() => setIsGithubModalOpen(true)}
        onShowLinkedinId={() => setIsLinkedinModalOpen(true)}
      />

      <OwnerLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={() => { setIsOwner(true); setInfoToast('Welcome back, Owner!'); }} 
      />
      
      <OwnerAnalyticsModal 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
      />
    </div>
  );
}
