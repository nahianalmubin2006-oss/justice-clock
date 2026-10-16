import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { Menu, X, ShieldCheck, Globe, Radio } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onOpenAdmin,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = I18N[lang];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Top Forensic Status Bar */}
      <div className="bg-[#161211] text-[#E4DED7] text-[11px] font-mono py-1 px-4 border-b border-[#2d2624] overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-semibold tracking-wider text-[10px] uppercase">
              {lang === 'bn' ? 'সক্রিয় নজরদারি' : 'MONITORING ACTIVE'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[#9c938c] text-[10px] uppercase tracking-wider truncate">
            <span>{lang === 'bn' ? 'বাংলাদেশ ইনসিডেন্ট ডাটাবেস' : 'BANGLADESH INCIDENT DATABASE'}</span>
            <span>·</span>
            <span>{lang === 'bn' ? 'রিয়েল-টাইম ক্রোনোমিটার' : 'REAL-TIME CHRONOMETER'}</span>
            <span>·</span>
            <span>{lang === 'bn' ? 'আইনি কার্যধারা পর্যবেক্ষণ' : 'JUDICIAL MILESTONE TRACKING'}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[10px] text-[#C29B38]">
            <Radio size={11} className="animate-pulse" />
            <span className="font-semibold tracking-wide">UTC+06:00 BST</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        id="nav"
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E4DED7] shadow-sm'
            : 'bg-[#FAF8F5]/70 backdrop-blur-xs'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          {/* Brand Logo & Wordmark */}
          <a
            href="#home"
            className="group flex items-center gap-3 font-serif font-bold text-xl text-[#161211] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
            aria-label={t.brand}
          >
            {/* Dynamic Horological Chronometer Mark */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#8B1E2D] to-[#60121c] p-0.5 shadow-xs group-hover:scale-105 transition-transform">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 32 32"
                fill="none"
                stroke="#FAF8F5"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="w-full h-full"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="13" stroke="#FAF8F5" strokeWidth="1.8" />
                <path d="M16 8v8l5 3" stroke="#FAF8F5" strokeWidth="2" />
                <circle cx="16" cy="16" r="1.8" fill="#FAF8F5" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="tracking-tight text-lg leading-tight group-hover:text-[#8B1E2D] transition-colors">
                {t.brand}
              </span>
              <span className="text-[10px] font-sans font-semibold tracking-widest text-[#6B635E] uppercase -mt-0.5">
                Bangladesh
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[#26211F]"
            aria-label="Main"
          >
            <a className="navlink whitespace-nowrap shrink-0" href="#home">
              {t.nav_home}
            </a>
            <a className="navlink whitespace-nowrap shrink-0" href="#tracker">
              {t.nav_tracker}
            </a>
            <a className="navlink whitespace-nowrap shrink-0" href="#about">
              {t.nav_about}
            </a>
            <a className="navlink whitespace-nowrap shrink-0" href="#action">
              {t.nav_action}
            </a>
          </nav>

          {/* Action Zone: Language Switcher & Admin Portal */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Segmented Tactile Language Switcher */}
            <button
              onClick={onToggleLang}
              className="lang-btn !py-1.5 !px-3 text-xs font-semibold flex items-center gap-2 border border-[#CDC4B8] hover:border-[#8B1E2D] hover:text-[#8B1E2D] transition-all bg-white shadow-2xs active:scale-95"
              aria-label="Switch language"
            >
              <Globe size={14} className="text-[#8B1E2D]" />
              <span className="font-bold">{lang === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#161211] text-[#FAF8F5] hover:bg-[#8B1E2D] rounded-lg text-xs font-semibold tracking-wide shadow-2xs hover:shadow-md active:scale-[0.98] transition-all whitespace-nowrap border border-black/20"
            >
              <ShieldCheck size={14} className="text-[#C29B38]" />
              <span>{lang === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              id="menuBtn"
              className="md:hidden p-2 rounded-lg border border-[#E4DED7] text-[#26211F] hover:bg-white active:scale-95 transition-all shadow-2xs"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobileMenu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobileMenu"
            className="md:hidden border-t border-[#E4DED7] bg-[#FAF8F5] px-5 py-5 flex flex-col gap-3 text-base shadow-xl animate-in slide-in-from-top-2 duration-150"
            aria-label="Mobile Navigation"
          >
            <a
              className="py-2 text-[#161211] font-semibold hover:text-[#8B1E2D] transition-colors"
              href="#home"
              onClick={closeMobileMenu}
            >
              {t.nav_home}
            </a>
            <a
              className="py-2 text-[#161211] font-semibold hover:text-[#8B1E2D] transition-colors"
              href="#tracker"
              onClick={closeMobileMenu}
            >
              {t.nav_tracker}
            </a>
            <a
              className="py-2 text-[#161211] font-semibold hover:text-[#8B1E2D] transition-colors"
              href="#about"
              onClick={closeMobileMenu}
            >
              {t.nav_about}
            </a>
            <a
              className="py-2 text-[#161211] font-semibold hover:text-[#8B1E2D] transition-colors"
              href="#action"
              onClick={closeMobileMenu}
            >
              {t.nav_action}
            </a>

            <div className="pt-3 border-t border-[#E4DED7] flex flex-col gap-2">
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenAdmin();
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg bg-[#161211] text-white font-semibold text-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#C29B38]" />
                  <span>{lang === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
                </div>
                <span className="text-xs text-[#C29B38] font-mono">Sign In →</span>
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};
