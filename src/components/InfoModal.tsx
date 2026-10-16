import React, { useEffect } from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { X, ShieldCheck, FileWarning } from 'lucide-react';

interface InfoModalProps {
  type: 'privacy' | 'disclaimer' | null;
  lang: Language;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, lang, onClose }) => {
  const t = I18N[lang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [type, onClose]);

  if (!type) return null;

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? t.privacy_t : t.disclaimer_t;
  const content = isPrivacy ? t.privacy_b : t.disclaimer_b;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161211]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] text-[#161211] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#CDC4B8] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="infoModalTitle"
      >
        <div className="flex justify-between items-start gap-4 border-b border-[#E4DED7] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#8B1E2D]/10 text-[#8B1E2D]">
              {isPrivacy ? (
                <ShieldCheck size={22} />
              ) : (
                <FileWarning size={22} />
              )}
            </div>
            <h2 id="infoModalTitle" className="font-serif font-bold text-2xl text-[#161211]">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#E4DED7] bg-white hover:bg-[#161211] text-[#6B635E] hover:text-[#FAF8F5] transition-all shadow-2xs active:scale-95"
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 text-sm sm:text-base text-[#161211] leading-relaxed p-4 bg-white rounded-xl border border-[#E4DED7] shadow-2xs">
          <p>{content}</p>
        </div>

        <div className="mt-8 flex justify-end border-t border-[#E4DED7] pt-4">
          <button onClick={onClose} className="btn-primary !py-2 !px-5 text-xs shadow-md">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
