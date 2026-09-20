import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { weddingAudio } from '../utils/audio';

export const AudioControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(weddingAudio.isPlaying());

  useEffect(() => {
    const unsubscribe = weddingAudio.subscribe(() => {
      setIsPlaying(weddingAudio.isPlaying());
    });
    return unsubscribe;
  }, []);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Synchronously initiate audio toggle directly inside the user click
    weddingAudio.togglePlay();
  };

  return (
    <div className="fixed top-4 left-4 z-40 select-none">
      <button
        id="audio-toggle-btn"
        onClick={toggleAudio}
        className={`group flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-sm backdrop-blur-md transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer ${
          !isPlaying
            ? 'bg-[#FCFAF7]/90 text-[#7E3243] border-[#E8D6DC]'
            : 'bg-[#832E41] text-[#FAF8F5] border-[#832E41] shadow-md'
        }`}
        title={isPlaying ? 'كتم الصوت' : 'تشغيل الصوت'}
        aria-label={isPlaying ? 'كتم الصوت' : 'تشغيل الصوت'}
        aria-pressed={isPlaying}
      >
        {!isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 text-[#A67E88]" />
            <span className="text-xs font-sans-ar text-[#832E41] hidden sm:inline">
              تشغيل الصوت
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-[#FAF8F5] animate-pulse" />
            <span className="text-xs font-sans-ar text-[#FAF8F5] font-medium hidden sm:inline">
              موسيقى الزفاف
            </span>
            {/* Visualizer bars */}
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-[#FAF8F5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-3 bg-[#FAF8F5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-[#FAF8F5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </>
        )}
      </button>
    </div>
  );
};
