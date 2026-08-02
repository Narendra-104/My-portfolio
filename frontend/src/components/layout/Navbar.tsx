import { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Lock, Unlock, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavSection } from '../../types';

interface NavbarProps {
  activeSection: NavSection;
  onSectionClick: (section: NavSection) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOwner?: boolean;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenAnalytics?: () => void;
  onOpenChat: () => void; // 👈 Added the prop to handle opening the AI modal drawer
}

export default function Navbar({
  activeSection,
  onSectionClick,
  isDarkMode,
  onToggleDarkMode,
  isOwner = false,
  onOpenLogin,
  onLogout,
  onOpenAnalytics,
  onOpenChat // 👈 Destructured the click event handler function
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewsCount, setViewsCount] = useState<number | null>(() => {
    const saved = localStorage.getItem('portfolio_backup_total_views');
    return saved ? parseInt(saved, 10) : null;
  });

  const navItems: { id: NavSection; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'resume', label: 'Resume' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    const checkViews = () => {
      const saved = localStorage.getItem('portfolio_backup_total_views');
      if (saved) {
        setViewsCount(parseInt(saved, 10));
      }
    };
    const interval = setInterval(checkViews, 2000);
    return () => clearInterval(interval);
  }, [isOwner]);

  const handleNavClick = (sectionId: NavSection) => {
    onSectionClick(sectionId);
    setIsOpen(false);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <nav
      id="top-navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/90 dark:bg-surface/90 shadow-md h-16 backdrop-blur-md border-b border-outline-variant/10'
          : 'bg-transparent h-20'
      }`}
    >
      <div className="flex justify-between items-center px-4 md:px-16 max-w-7xl mx-auto h-full">
        {/* Brand Name */}
        <div
          id="navbar-brand"
          className="font-headline font-bold text-lg md:text-xl tracking-tight text-on-surface cursor-pointer"
          onClick={() => handleNavClick('home')}
        >
          My Portfolio
        </div>

        {/* Desktop Links */}
        <div id="desktop-menu" className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`font-sans text-sm font-medium transition-colors hover:text-primary py-1 relative ${
                activeSection === item.id
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeNavLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div id="navbar-actions" className="flex items-center gap-2 md:gap-4">
          
          {/* Desktop AI Assistant Trigger Button 💻 */}
          <button
            id="desktop-ai-chat-btn"
            onClick={onOpenChat}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Ask my AI Assistant a question"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Ask AI</span>
          </button>

          {isOwner ? (
            <div className="flex items-center gap-2">
              <button
                id="owner-analytics-btn"
                onClick={onOpenAnalytics}
                className="p-2 md:px-3.5 md:py-2.5 rounded-full md:rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer flex items-center gap-1.5 border border-primary/20 bg-primary/5"
                title="View Website Analytics"
              >
                <BarChart3 size={16} className="animate-pulse" />
                <span className="hidden sm:inline text-[9px] font-extrabold uppercase tracking-widest">
                  {viewsCount !== null ? `${viewsCount} Views` : 'Views'}
                </span>
              </button>
              <button
                id="owner-logout-btn"
                onClick={onLogout}
                className="p-2.5 rounded-full hover:bg-emerald-500/10 text-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Owner Mode Active. Click to lock/exit."
              >
                <Unlock size={18} className="animate-pulse" />
                <span className="hidden lg:inline text-[9px] font-extrabold uppercase tracking-widest">Owner active</span>
              </button>
            </div>
          ) : (
            <button
              id="owner-login-btn"
              onClick={onOpenLogin}
              className="p-2.5 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Authenticate as Owner"
            >
              <Lock size={18} />
            </button>
          )}

          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant cursor-pointer"
            aria-label="Toggle dark/light mode"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>

          {/* Hamburger Menu button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden w-full bg-surface-container-lowest border-b border-outline-variant/20 shadow-lg overflow-hidden absolute top-full left-0 z-40"
          >
            <div className="flex flex-col py-4 px-6 gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left font-sans text-base font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile AI Assistant Menu Row 📱 */}
              <button
                onClick={() => {
                  onOpenChat();
                  setIsOpen(false);
                }}
                className="sm:hidden flex items-center gap-2.5 text-left font-sans text-base font-bold py-2.5 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/25 transition-colors w-full cursor-pointer"
              >
                <Sparkles size={16} className="animate-pulse" />
                <span>Ask AI Assistant</span>
              </button>

              {/* Owner mode link in mobile menu */}
              <div className="border-t border-outline-variant/10 pt-3 mt-1 flex flex-col gap-1">
                {isOwner ? (
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2.5 text-left font-sans text-sm font-bold py-2.5 px-3 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors w-full cursor-pointer"
                  >
                    <Unlock size={16} />
                    <span>Owner Mode Active (Logout)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenLogin?.();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2.5 text-left font-sans text-sm font-semibold py-2.5 px-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors w-full cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>Authenticate Owner Controls</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}   