import React from 'react';
import { Sparkles } from 'lucide-react';

interface PersonalizedGreetingProps {
  guestName: string;
}

export const PersonalizedGreeting: React.FC<PersonalizedGreetingProps> = ({ guestName }) => {
  if (!guestName) return null;

  return (
    <div
      id="personalized-guest-greeting"
      className="w-full max-w-2xl mx-auto mb-6 sm:mb-8 select-none"
    >
      <div className="relative p-4 xs:p-5 sm:p-6 md:p-7 rounded-3xl bg-[#FAF5F6]/95 border-2 border-[#DFCBA0] shadow-[0_12px_36px_rgba(45,11,20,0.08)] text-center overflow-hidden">
        {/* Subtle gold ribbon top accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C4AA7E] to-transparent" />

        <div className="flex items-center justify-center gap-2 text-[#832E41] mb-1.5">
          <Sparkles className="w-4 h-4 text-[#C4AA7E]" />
          <span className="font-sans-ar text-xs sm:text-sm font-bold text-[#832E41] tracking-wide">
            دعوة خاصة ومميزة
          </span>
          <Sparkles className="w-4 h-4 text-[#C4AA7E]" />
        </div>

        <p className="font-sans-ar text-sm sm:text-base md:text-lg text-[#7E3243] mt-0.5">
          أهلاً وسهلاً بضيوفنا الكرام الأعزاء
        </p>

        <h3 className="font-sans-ar text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-[#2B1117] font-bold mt-2 py-1">
          {guestName}
        </h3>

        <p className="font-sans-ar text-xs sm:text-sm md:text-base text-[#5E2330] mt-1.5 leading-relaxed max-w-md mx-auto">
          يسعدنا ويشرفنا حضوركم ومشاركتنا فرحة العمر في ليلة زفافنا الميمونة
        </p>
      </div>
    </div>
  );
};
