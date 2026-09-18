import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Heart } from 'lucide-react';

interface CountdownTimerProps {
  targetTimestamp: number;
  day?: string;
  date?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalHours: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTimestamp,
  day = 'الخميس',
  date = '5 نوفمبر 2026',
}) => {
  const calculateTime = (): TimeRemaining => {
    const diff = targetTimestamp - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalHours: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const totalHours = Math.floor(diff / (1000 * 60 * 60));

    return { days, hours, minutes, seconds, isPast: false, totalHours };
  };

  const [time, setTime] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const units = [
    { label: 'أيام', englishLabel: 'DAYS', value: time.days, max: 365 },
    { label: 'ساعات', englishLabel: 'HOURS', value: time.hours, max: 24 },
    { label: 'دقائق', englishLabel: 'MINUTES', value: time.minutes, max: 60 },
    { label: 'ثوانٍ', englishLabel: 'SECONDS', value: time.seconds, max: 60, isPulsing: true },
  ];

  return (
    <section
      id="wedding-countdown-timer"
      aria-label="العد التنازلي لموعد الزفاف"
      className="w-full max-w-2xl mx-auto my-6 sm:my-8 select-none"
    >
      {/* Royal Card Container */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#FCFAF7] via-[#FAF5F2] to-[#F7ECEE] p-4 xs:p-6 sm:p-7 md:p-8 border-2 border-[#DFCBA0] shadow-[0_16px_48px_rgba(45,11,20,0.08)] text-center overflow-hidden">
        
        {/* Subtle Background Watermark / Ornamental Radial */}
        <div className="absolute inset-0 bg-radial from-[#DEC496]/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Top Gold Filigree Ribbon */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C4AA7E] to-transparent" />

        {/* Decorative Inner Border Frame */}
        <div className="absolute inset-2 sm:inset-3 rounded-xl sm:rounded-2xl border border-[#DEC496]/40 pointer-events-none" />

        {/* Header: Calligraphic Badge */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#832E41] mb-1.5">
            <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-[#C4AA7E] to-transparent" />
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#832E41]/10 border border-[#832E41]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#B89656]" />
              <span className="font-sans-ar text-xs sm:text-sm font-bold text-[#832E41] tracking-wider">
                العد التنازلي لليلة العمر
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#B89656]" />
            </div>
            <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-[#C4AA7E] to-transparent" />
          </div>

          <h3 className="font-sans-ar text-lg sm:text-2xl md:text-3xl font-bold text-[#2B1117] mt-1">
            باقي على موعد الفرح والسرور
          </h3>
        </div>

        {time.isPast ? (
          <div className="relative z-10 py-5 px-4 bg-white/80 rounded-2xl border border-[#DFCBA0] shadow-xs">
            <Heart className="w-7 h-7 text-[#832E41] fill-[#832E41] mx-auto mb-2 animate-bounce" />
            <p className="font-sans-ar text-lg xs:text-xl sm:text-2xl text-[#2B1117] font-bold">
              بارك الله لهما وبارك عليهما وجمع بينهما في خير
            </p>
            <p className="font-sans-ar text-sm sm:text-base text-[#7E3243] mt-1.5">
              تم حفل الزفاف الميمون بحمد الله وتوفيقه
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3.5 md:gap-4">
            {units.map((unit, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center justify-center p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-b from-white to-[#FDFBFA] border-2 border-[#ECDCD6] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(131,46,65,0.1)] hover:border-[#DEC496] hover:-translate-y-0.5"
              >
                {/* Gold Top Accent on unit card */}
                <div className="absolute top-0 inset-x-3 sm:inset-x-5 h-[2px] bg-gradient-to-r from-transparent via-[#DEC496] to-transparent" />

                {/* Digit Display */}
                <div className="relative flex items-center justify-center my-0.5">
                  <span
                    className={`font-sans-ar text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums ${
                      unit.isPulsing ? 'text-[#832E41]' : 'text-[#2B1117]'
                    }`}
                    style={{
                      textShadow: '0 1px 2px rgba(43,17,23,0.08)',
                    }}
                  >
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Primary Arabic Label */}
                <span className="font-sans-ar text-xs sm:text-sm md:text-base text-[#832E41] font-bold tracking-wide mt-1">
                  {unit.label}
                </span>

                {/* Subtitle English / Luxury Indicator */}
                <span className="font-sans-ar text-[8px] xs:text-[9px] sm:text-[10px] text-[#A67E88] uppercase tracking-widest hidden xs:inline-block">
                  {unit.englishLabel}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Status / Date Confirmation Bar */}
        <div className="relative z-10 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#EAE0D2] flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm md:text-base text-[#7E3243] font-sans-ar">
          <Calendar className="w-4 h-4 text-[#832E41]" />
          <span className="font-semibold text-[#2B1117]">{day} • {date}</span>
          <span className="text-[#C4AA7E] hidden xs:inline">•</span>
          <span className="text-[#7E3243] hidden xs:inline">نتشوق لرؤيتكم ومشاركتنا فرحة العمر</span>
        </div>
      </div>
    </section>
  );
};
