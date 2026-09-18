import React from 'react';
import { QuranicVerse } from './QuranicVerse';

interface ClosedCardProps {
  onOpen: () => void;
  closingQuote: string;
}

export const ClosedCard: React.FC<ClosedCardProps> = ({ onOpen, closingQuote }) => {
  return (
    <section 
      id="closed-invitation-screen"
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#7B8A74] z-20 px-4 select-none overflow-hidden"
    >
      {/* Soft atmospheric gradient background */}
      <div className="absolute inset-0 bg-radial from-[#8A9A83]/50 via-[#7B8A74] to-[#687661] pointer-events-none" />

      {/* Main interactive envelope container */}
      <div 
        id="envelope-card-trigger"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label="فتح بطاقة الدعوة"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        className="relative z-10 w-full max-w-[620px] cursor-pointer group transition-transform duration-500 hover:scale-[1.015] active:scale-[0.99] focus:outline-none"
      >
        {/* Soft shadow & glow */}
        <div className="relative rounded-xl overflow-hidden shadow-[0_24px_50px_rgba(30,38,27,0.38)] group-hover:shadow-[0_28px_60px_rgba(30,38,27,0.45)] transition-shadow duration-500">
          <img
            src="/assets/closed_envelope.png"
            alt="بطاقة الدعوة المغلقة"
            className="w-full h-auto block object-contain select-none pointer-events-none aspect-16/9"
            draggable={false}
          />

          {/* Gentle interactive hover pulse indicator */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Prominent Clear Open Button (No icons) */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="px-9 py-3 sm:px-11 sm:py-3.5 rounded-full bg-[#3D4D38] hover:bg-[#2C3828] text-[#FAF8F5] border-2 border-[#D4C099] shadow-[0_10px_25px_rgba(30,42,27,0.3)] text-base sm:text-lg font-bold font-sans-ar tracking-widest cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#D4C099]/40"
          >
            انقر لفتح الدعوة
          </button>
        </div>
      </div>

      {/* Decorated Quranic Verse directly below the closed card */}
      <div 
        id="closed-card-quote"
        className="relative z-10 mt-6 sm:mt-8 text-center max-w-xl px-4"
      >
        <QuranicVerse
          verse={closingQuote || "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً"}
          size="md"
          theme="dark"
          showSurahHint={false}
        />
      </div>
    </section>
  );
};
