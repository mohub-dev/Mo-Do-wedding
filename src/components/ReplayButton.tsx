import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ReplayButtonProps {
  onReplay: () => void;
}

export const ReplayButton: React.FC<ReplayButtonProps> = ({ onReplay }) => {
  return (
    <div id="replay-section" className="relative z-10 w-full flex justify-center pb-16 sm:pb-24 pt-4">
      <button
        id="replay-invitation-button"
        onClick={onReplay}
        className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FAF8F5]/20 hover:bg-[#FAF8F5]/30 text-[#FAF8F5] border border-[#FAF8F5]/30 shadow-sm backdrop-blur-xs font-sans-ar text-sm sm:text-base tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FAF8F5]/50"
        aria-label="إعادة تشغيل الدعوة"
      >
        <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:-rotate-90 text-[#FAF8F5]" />
        <span>إعادة تشغيل الدعوة</span>
      </button>
    </div>
  );
};
