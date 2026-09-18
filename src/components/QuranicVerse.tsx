import React from 'react';

interface QuranicVerseProps {
  verse?: string;
  theme?: 'dark' | 'light' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSurahHint?: boolean;
}

export const QuranicVerse: React.FC<QuranicVerseProps> = ({
  verse = "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  theme = 'light',
  size = 'md',
  className = '',
  showSurahHint = false,
}) => {
  // Size classes tailored to fit elegantly on a single line on both mobile and desktop
  const textSizeClass = {
    sm: 'text-base sm:text-lg md:text-xl',
    md: 'text-lg sm:text-2xl md:text-3xl',
    lg: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  }[size];

  // Theme color styles
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-[#FAF8F5]' : 'text-[#2B1117]';
  const goldColor = isDark ? 'text-[#E5D0A1]' : 'text-[#B89656]';
  const dividerColor = isDark ? 'bg-[#E5D0A1]/50' : 'bg-[#B89656]/50';
  const surahHintColor = isDark ? 'text-[#E5D0A1]/80' : 'text-[#7E3243]';
  const arabesqueFill = isDark ? '#E5D0A1' : '#B89656';

  return (
    <div
      dir="rtl"
      className={`relative inline-flex flex-col items-center justify-center text-center px-1 sm:px-4 py-1 select-none max-w-full ${className}`}
    >
      {/* Top Islamic Ornate Flourish */}
      <div className="flex items-center justify-center gap-2 mb-1 opacity-85">
        <span className={`h-px w-6 sm:w-12 ${dividerColor}`} />
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
          fill={arabesqueFill}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Islamic 8-pointed star / Rosette motif */}
          <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
          <circle cx="12" cy="10" r="1.5" fill="#FAF8F5" />
        </svg>
        <span className={`h-px w-6 sm:w-12 ${dividerColor}`} />
      </div>

      {/* Decorated Quranic Verse with Calligraphic Brackets - Strictly Single Line */}
      <div className="relative flex items-center justify-center whitespace-nowrap overflow-visible max-w-full px-1">
        {/* Right Quranic Bracket ﴿ */}
        <span
          className={`font-amiri ${textSizeClass} ${goldColor} font-bold select-none leading-none inline-block ml-0.5 sm:ml-1`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
        >
          ﴿
        </span>

        {/* The Sacred Words with Tashkeel - strictly whitespace-nowrap and single line */}
        <span
          className={`font-amiri ${textSizeClass} ${textColor} font-bold leading-normal tracking-normal sm:tracking-wide whitespace-nowrap inline-block px-0.5 sm:px-1`}
          style={{
            textShadow: isDark
              ? '0 2px 6px rgba(0,0,0,0.45)'
              : '0 1px 2px rgba(184,150,86,0.2)',
          }}
        >
          {verse}
        </span>

        {/* Left Quranic Bracket ﴾ */}
        <span
          className={`font-amiri ${textSizeClass} ${goldColor} font-bold select-none leading-none inline-block mr-0.5 sm:mr-1`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
        >
          ﴾
        </span>
      </div>

      {/* Optional Surah Citation (disabled by default) */}
      {showSurahHint && (
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={`h-px w-5 sm:w-8 ${dividerColor} opacity-50`} />
          <span className={`font-amiri text-xs sm:text-sm ${surahHintColor} tracking-widest`}>
            سورة الروم : ٢١
          </span>
          <span className={`h-px w-5 sm:w-8 ${dividerColor} opacity-50`} />
        </div>
      )}
    </div>
  );
};
