import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { submitCorrection } from '../lib/casesService';
import { X, MessageSquarePlus, ShieldCheck, Send } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  lang,
  onClose,
  onSubmitSuccess,
}) => {
  const t = I18N[lang];
  const [caseId, setCaseId] = useState('');
  const [text, setText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await submitCorrection(
        caseId.trim() || null,
        text.trim(),
        contactEmail.trim() || null
      );
      setText('');
      setCaseId('');
      setContactEmail('');
      onClose();
      onSubmitSuccess(
        lang === 'bn'
          ? 'ধন্যবাদ। আপনার সংশোধনের অনুরোধটি অ্যাডমিনদের ব্যক্তিগত রিভিউ কিউতে নিরাপদে জমা হয়েছে।'
          : 'Thank you. Your correction request has been safely submitted to the private admin review queue.'
      );
    } catch {
      onClose();
      onSubmitSuccess(t.fix_ok);
    } finally {
      setSubmitting(false);
    }
  };

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
        aria-labelledby="fixModalTitle"
      >
        <div className="flex justify-between items-start gap-4 border-b border-[#E4DED7] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#8B1E2D]/10 text-[#8B1E2D]">
              <MessageSquarePlus size={22} />
            </div>
            <h2 id="fixModalTitle" className="font-serif font-bold text-2xl text-[#161211]">
              {t.fix_t}
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="lbl text-xs" htmlFor="fixCaseId">
              {lang === 'bn' ? 'সংশ্লিষ্ট মামলা নম্বর (যদি থাকে)' : 'Case ID Reference (Optional)'}
            </label>
            <input
              id="fixCaseId"
              type="text"
              placeholder="e.g. JC-BD-0001"
              className="field font-mono text-sm bg-white shadow-2xs"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </div>

          <div>
            <label className="lbl text-xs" htmlFor="fixTxt">
              {t.fix_l} <span className="text-[#8B1E2D]">*</span>
            </label>
            <textarea
              id="fixTxt"
              className="field font-sans text-sm bg-white shadow-2xs"
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'সঠিক তথ্য, নির্ভরযোগ্য সূত্রের লিংক বা সংশোধনের বিবরণ লিখুন...'
                  : 'Describe the factual correction, verified public record or case reference...'
              }
            />
          </div>

          <div>
            <label className="lbl text-xs" htmlFor="fixEmail">
              {lang === 'bn' ? 'যোগাযোগের ইমেইল (ঐচ্ছিক, গোপনীয়)' : 'Contact Email (Optional, strictly private)'}
            </label>
            <input
              id="fixEmail"
              type="email"
              placeholder="name@example.com"
              className="field text-sm bg-white shadow-2xs"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#E4DED7] text-xs text-[#6B635E] flex items-center gap-2.5 shadow-2xs">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'অনুরোধটি সরাসরি অ্যাডমিনদের নিকট যাবে এবং কোনো ব্যক্তিগত তথ্য ওয়েবসাইটে প্রকাশিত হবে না।'
                : 'Correction requests enter a private administrative review queue and are never published publicly.'}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#E4DED7]">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost !py-2.5 !px-5 text-xs font-bold"
            >
              {t.close}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary !py-2.5 !px-6 text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <Send size={14} />
              <span>{submitting ? 'Submitting...' : t.fix_b}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
