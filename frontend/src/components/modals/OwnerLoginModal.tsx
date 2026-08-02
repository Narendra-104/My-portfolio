import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, Mail, KeyRound, ShieldAlert } from 'lucide-react';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function OwnerLoginModal({ isOpen, onClose, onLoginSuccess }: OwnerLoginModalProps) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your owner email address.');
      return;
    }
    if (!passcode) {
      setError('Please enter your access passcode.');
      return;
    }

    setIsLoading(true);

    // Artificial tiny delay for premium responsive feel
    setTimeout(() => {
      const sanitizedEmail = email.trim().toLowerCase();
      const storedPasscode = localStorage.getItem('owner_custom_passcode') || 'Narendra@2836';
      
      if (sanitizedEmail === 'narendragond012@gmail.com' && passcode === storedPasscode) {
        localStorage.setItem('is_owner', 'true');
        onLoginSuccess();
        setEmail('');
        setPasscode('');
        onClose();
      } else {
        setError('Invalid owner credentials. Access Denied.');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with elegant blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-md bg-surface-container-lowest border border-outline/20 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden z-10 text-left"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl mb-3">
            <Lock size={24} />
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Authenticate Owner Access
          </h2>
          <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs">
            Only authorized administrator can edit details, restructure case studies, and update the professional profile.
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <div>{error}</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-on-surface-variant ml-1 uppercase tracking-wider block">
              Registered Owner Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-variant/60">
                <Mail size={14} />
              </span>
              <input
                type="email"
                placeholder="e.g. narendragond012@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-container-low pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-outline-variant/30 outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 transition-colors"
                id="owner-login-email-input"
              />
            </div>
          </div>

          {/* Passcode input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-on-surface-variant ml-1 uppercase tracking-wider block">
              Access Passcode
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-variant/60">
                <KeyRound size={14} />
              </span>
              <input
                type="password"
                placeholder="Enter owner passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-container-low pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-outline-variant/30 outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 transition-colors"
                id="owner-login-password-input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            id="btn-owner-login-submit"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Unlock size={14} />
                Unlock Portfolio Controls
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
