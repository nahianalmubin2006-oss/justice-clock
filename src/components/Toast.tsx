import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-[#26211F] text-[#FAF8F5] px-5 py-3 rounded-md shadow-xl text-sm font-medium z-60 max-w-[90vw] text-center border border-[#FAF8F5]/20 animate-in fade-in slide-in-from-bottom-3 duration-200"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};
