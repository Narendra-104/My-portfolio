import React from 'react';
import { NavSection } from '../../types';
import { Lock, Unlock } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
  isOwner?: boolean;
  onOpenLogin?: () => void;
  onShowGithubId?: () => void;
  onShowLinkedinId?: () => void;
}

export default function Footer({
  onNavigate,
  isOwner = false,
  onOpenLogin,
  onShowGithubId,
  onShowLinkedinId
}: FooterProps) {
  const links = [
    { label: 'Privacy Policy', action: () => alert('Privacy Policy: Information transmitted through contact forms remains completely local.') },
    { label: 'Terms of Service', action: () => alert('Terms of Service: Authorized for evaluation, career applications, and portfolio review.') },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/narendra-gond-83a050329', isLinkedin: true },
    { label: 'GitHub', url: 'https://github.com/Narendra-104', isGithub: true }
  ];

  // Allow ALL visitors to open LinkedIn & GitHub, but only owner sees the ID modal
  const handleSocialClick = (e: React.MouseEvent, link: typeof links[number]) => {
    if (link.isLinkedin || link.isGithub) {
      // If owner is logged in, show the special ID modal instead of navigating
      if (isOwner) {
        if (link.isLinkedin && onShowLinkedinId) {
          e.preventDefault();
          onShowLinkedinId();
        } else if (link.isGithub && onShowGithubId) {
          e.preventDefault();
          onShowGithubId();
        }
      }
      // Non-owner visitors: just let the anchor navigate normally (target="_blank")
    }
  };

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/15 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-16 max-w-7xl mx-auto gap-8">
        {/* Left trademark info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <span
            onClick={() => onNavigate('home')}
            className="font-headline text-base font-extrabold text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            My Portfolio
          </span>
          <p className="font-sans text-[11px] text-on-surface-variant font-medium mt-0.5">
            © 2026 My Portfolio. All rights reserved.
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-on-surface-variant/70">
            {isOwner ? (
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <Unlock size={10} /> Active: Narendra Gond (Owner Control Mode)
              </span>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 hover:text-primary transition-colors font-bold cursor-pointer"
              >
                <Lock size={10} /> Owner Area Access
              </button>
            )}
          </div>
        </div>

        {/* Right navigation / social endpoints */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {links.map((link) => {
            const isSocial = link.isLinkedin || link.isGithub;

            if (link.url) {
              return (
                <a
                  key={link.label}
                  href={link.url}
                  onClick={(e) => handleSocialClick(e, link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-sans text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 text-on-surface-variant hover:text-primary`}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <button
                key={link.label}
                onClick={link.action}
                className="font-sans text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}