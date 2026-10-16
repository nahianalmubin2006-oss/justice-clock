import React, { useEffect } from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { X, Scale, ArrowRight } from 'lucide-react';

interface ProcessModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export const ProcessModal: React.FC<ProcessModalProps> = ({ isOpen, lang, onClose }) => {
  const t = I18N[lang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        aria-labelledby="processModalTitle"
      >
        <div className="flex justify-between items-start gap-4 border-b border-[#E4DED7] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#8B1E2D]/10 text-[#8B1E2D]">
              <Scale size={22} />
            </div>
            <h2 id="processModalTitle" className="font-serif font-bold text-2xl text-[#161211]">
              {t.process_t}
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

        <ol className="mt-6 space-y-3.5 text-sm sm:text-base text-[#161211]">
          {t.process.map((step, idx) => (
            <li
              key={idx}
              className="p-3.5 bg-white rounded-xl border border-[#E4DED7] shadow-2xs flex items-start gap-3"
            >
              <span className="font-mono text-xs font-bold text-[#8B1E2D] px-2 py-0.5 rounded bg-[#8B1E2D]/5 border border-[#8B1E2D]/15 mt-0.5 shrink-0">
                0{idx + 1}
              </span>
              <span className="leading-relaxed font-medium">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-[#E4DED7] pt-4">
          <p className="text-xs text-[#6B635E] italic leading-relaxed">
            {t.process_n}
          </p>
          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="btn-primary !py-2 !px-5 text-xs shadow-md">
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
