import React, { useState, useEffect, useCallback } from 'react';
import { CaseItem, DatabaseCase, Language } from './types';
import { I18N } from './data/i18n';
import { CASES } from './data/cases';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Featured } from './components/Featured';
import { Tracker } from './components/Tracker';
import { AboutSection } from './components/AboutSection';
import { ActionSection } from './components/ActionSection';
import { Footer } from './components/Footer';
import { CaseModal } from './components/CaseModal';
import { ProcessModal } from './components/ProcessModal';
import { CorrectionModal } from './components/CorrectionModal';
import { InfoModal } from './components/InfoModal';
import { Toast } from './components/Toast';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  subscribeToPublishedCases,
  toCaseItem,
} from './lib/casesService';
import { testConnection } from './lib/firebase';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('jc-lang');
      if (saved === 'en' || saved === 'bn') return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#admin';
  });

  const [now, setNow] = useState<number>(Date.now());
  const [liveCases, setLiveCases] = useState<CaseItem[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [infoType, setInfoType] = useState<'privacy' | 'disclaimer' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('jc-lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Listen to hash changes for #admin route
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Test Firestore connection on boot as required by skill
  useEffect(() => {
    testConnection();
  }, []);

  // Subscribe to published cases from Firestore
  useEffect(() => {
    const unsub = subscribeToPublishedCases(
      (dbCases: DatabaseCase[]) => {
        setIsDbLoaded(true);
        if (dbCases.length > 0) {
          const items = dbCases.map((c, i) => toCaseItem(c, i));
          setLiveCases(items);
        } else {
          // If no cases currently in Firestore, fallback to initial demo cases for display preview
          // while clearly communicating the state to admins
          setLiveCases(
            CASES.map((c, i) => ({
              ...c,
              titleBn: `কেস রেকর্ড #${c.n}`,
              titleEn: `Case Record #${c.n}`,
            }))
          );
        }
      },
      (error) => {
        console.warn('Real-time database connection note:', error);
        setIsDbLoaded(true);
        setLiveCases(
          CASES.map((c, i) => ({
            ...c,
            titleBn: `কেস রেকর্ড #${c.n}`,
            titleEn: `Case Record #${c.n}`,
          }))
        );
      }
    );

    return () => unsub();
  }, []);

  // Master 1-second interval for all live ticking clocks
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
  };

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
  };

  const handleBackToPublic = () => {
    window.location.hash = '';
    setIsAdminView(false);
  };

  const handleShare = async () => {
    const t = I18N[lang];
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(t.shareMsg);
        showToast(t.copied);
      } else {
        showToast(t.shareMsg);
      }
    } catch {
      showToast(t.copyFail);
    }
  };

  if (isAdminView) {
    return (
      <>
        <AdminDashboard
          onBackToPublic={handleBackToPublic}
          onToast={showToast}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#26211F]">
      {/* Accessible skip link */}
      <a href="#main" className="skip">
        Skip to content
      </a>

      {/* Main navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenAdmin={handleOpenAdmin}
      />

      <main id="main" className="flex-1">
        {/* A. Hero section with live clock */}
        <Hero lang={lang} now={now} />

        {/* B. Overview Stats counters synchronized with live database */}
        <Stats lang={lang} cases={liveCases} />

        {/* C. Featured Cases with live timers */}
        <Featured
          lang={lang}
          now={now}
          cases={liveCases}
          onOpenDetails={(c) => setSelectedCase(c)}
        />

        {/* D. Full Interactive Case Tracker with filters & sorting */}
        <Tracker
          lang={lang}
          now={now}
          cases={liveCases}
          isDbLoaded={isDbLoaded}
          onOpenDetails={(c) => setSelectedCase(c)}
          onOpenAdmin={handleOpenAdmin}
        />

        {/* E. About & Methodology */}
        <AboutSection lang={lang} />

        {/* F. Action Section */}
        <ActionSection
          lang={lang}
          onShare={handleShare}
          onLearnProcess={() => setIsProcessOpen(true)}
          onSuggestCorrection={() => setIsCorrectionOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onSetLang={handleSetLang}
        onOpenPrivacy={() => setInfoType('privacy')}
        onOpenDisclaimer={() => setInfoType('disclaimer')}
      />

      {/* Interactive Modals */}
      <CaseModal
        c={selectedCase}
        lang={lang}
        now={now}
        onClose={() => setSelectedCase(null)}
      />

      <ProcessModal
        isOpen={isProcessOpen}
        lang={lang}
        onClose={() => setIsProcessOpen(false)}
      />

      <CorrectionModal
        isOpen={isCorrectionOpen}
        lang={lang}
        onClose={() => setIsCorrectionOpen(false)}
        onSubmitSuccess={(msg) => showToast(msg)}
      />

      <InfoModal
        type={infoType}
        lang={lang}
        onClose={() => setInfoType(null)}
      />

      {/* Toast notifications */}
      <Toast message={toastMessage} />
    </div>
  );
}
