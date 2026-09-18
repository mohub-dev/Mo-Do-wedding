import React from 'react';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import { InvitationData } from '../types';
import { QuranicVerse } from './QuranicVerse';

interface InvitationDetailsProps {
  data: InvitationData;
}

export const InvitationDetails: React.FC<InvitationDetailsProps> = ({ data }) => {
  return (
    <section
      id="invitation-details-section"
      className="relative z-10 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-2 xs:px-4 sm:px-6 py-6 sm:py-12 md:py-16 transition-all duration-1000"
    >
      {/* Paper Card Container */}
      <div 
        id="card-paper-interior"
        className="relative bg-[#FAF8F5] rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(25,32,22,0.22)] border border-[#E3DFC8]/70 overflow-hidden text-[#2B3527] px-3 xs:px-6 sm:px-12 md:px-16 py-8 xs:py-10 sm:py-14"
      >
        {/* Subtle watercolor paper fiber texture background */}
        <div className="absolute inset-0 bg-paper-fiber opacity-40 pointer-events-none" />

        {/* Botanical Foliage Corner Accents (Subtle and soft watercolor style) */}
        {/* Top-Right Foliage */}
        <div className="absolute top-0 right-0 w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 pointer-events-none opacity-80 overflow-hidden">
          <svg viewBox="0 0 150 150" className="w-full h-full">
            <g transform="translate(130, 20) rotate(110) scale(0.6)">
              <path d="M0,0 Q30,-20 70,-10 T 140,-20" fill="none" stroke="#4A5643" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20,-15 Q40,-35 65,-30 Q45,-15 20,-15 Z" fill="#607259" opacity="0.8" />
              <path d="M50,-10 Q70,5 95,-5 Q75,-15 50,-10 Z" fill="#788A71" opacity="0.8" />
              <path d="M80,-15 Q100,-40 125,-35 Q105,-20 80,-15 Z" fill="#8B9C83" opacity="0.8" />
              <ellipse cx="65" cy="5" rx="5" ry="8" fill="#3B4636" opacity="0.9" />
            </g>
          </svg>
        </div>

        {/* Bottom-Left Foliage */}
        <div className="absolute bottom-0 left-0 w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 pointer-events-none opacity-80 overflow-hidden">
          <svg viewBox="0 0 150 150" className="w-full h-full">
            <g transform="translate(20, 130) rotate(-70) scale(0.6)">
              <path d="M0,0 Q30,-20 70,-10 T 140,-20" fill="none" stroke="#4A5643" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20,-15 Q40,-35 65,-30 Q45,-15 20,-15 Z" fill="#607259" opacity="0.8" />
              <path d="M50,-10 Q70,5 95,-5 Q75,-15 50,-10 Z" fill="#788A71" opacity="0.8" />
              <path d="M80,-15 Q100,-40 125,-35 Q105,-20 80,-15 Z" fill="#8B9C83" opacity="0.8" />
              <ellipse cx="65" cy="5" rx="5" ry="8" fill="#3B4636" opacity="0.9" />
            </g>
          </svg>
        </div>

        {/* Content Flow in Strict Ordered Sequence */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
          
          {/* 1. المناسبة */}
          <div id="occasion-block" className="pt-2">
            <span className="font-sans-ar text-base sm:text-xl text-[#5A6C53] tracking-widest font-medium">
              {data.occasion}
            </span>
            <div className="w-12 h-0.5 bg-[#8E9F88]/40 mx-auto mt-2 rounded-full" />
          </div>

          {/* 2. الأسماء (The Most Prominent Element) */}
          <div id="names-block" className="py-1 sm:py-2">
            <h1 className="font-sans-ar text-4xl xs:text-5xl sm:text-6xl md:text-7xl text-[#242E20] tracking-wide leading-tight drop-shadow-xs font-bold">
              {data.namesDisplay}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3 text-[#7B8A74]">
              <span className="h-px w-12 sm:w-16 bg-[#8E9F88]/50" />
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6A7C63]" />
              <span className="h-px w-12 sm:w-16 bg-[#8E9F88]/50" />
            </div>
          </div>

          {/* 3. التاريخ & 4. اليوم */}
          <div id="date-schedule-block" className="w-full max-w-xl bg-[#F4F1EA]/70 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#E8E4DA]">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-3 sm:gap-4 text-center">
              
              {/* Date */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-[#5A6C53] mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-sans-ar text-xs text-[#6B7C64]">التاريخ</span>
                </div>
                <span className="font-sans-ar text-base xs:text-lg sm:text-xl font-bold text-[#2A3426]">
                  {data.date}
                </span>
              </div>

              {/* Divider on mobile / tablet */}
              <div className="h-px w-12 sm:w-px sm:h-10 bg-[#D8D2C4]" />

              {/* Day of Week */}
              {data.showDayOfWeek && (
                <div className="flex flex-col items-center">
                  <span className="font-sans-ar text-xs text-[#6B7C64] mb-1">اليوم</span>
                  <span className="font-sans-ar text-base xs:text-lg sm:text-xl font-bold text-[#2A3426]">
                    {data.day}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="h-px w-12 sm:w-px sm:h-10 bg-[#D8D2C4]" />

              {/* 5. الوقت */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-[#5A6C53] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-sans-ar text-xs text-[#6B7C64]">الوقت</span>
                </div>
                <span className="font-sans-ar text-sm xs:text-base sm:text-lg font-semibold text-[#2A3426]">
                  {data.startTime} - {data.endTime}
                </span>
              </div>
            </div>
          </div>

          {/* 6. المكان & 7. العنوان */}
          <div id="venue-location-block" className="w-full flex flex-col items-center space-y-2.5 sm:space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[#5A6C53]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#5F7356]" />
              <h2 className="font-sans-ar text-xl xs:text-2xl sm:text-3xl font-bold text-[#242E20]">
                {data.venueName}
              </h2>
            </div>
            <p className="font-sans-ar text-xs sm:text-base text-[#4F5E4A] max-w-md leading-relaxed px-2">
              {data.address}
            </p>

            {/* 8. Embedded Google Map */}
            <div
              id="embedded-google-map-container"
              className="mt-2 w-full max-w-lg rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#D4C3A3] shadow-[0_6px_20px_rgba(30,40,25,0.1)] bg-[#ECE8DF]"
            >
              <iframe
                title={`موقع ${data.venueName}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(data.venueName + ' ' + data.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-48 xs:h-56 sm:h-64 border-0 block"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="py-2 px-3 sm:px-4 bg-[#F5F2EB] border-t border-[#E0D8C5] flex items-center justify-between text-xs text-[#596954]">
                <span className="font-sans-ar flex items-center gap-1.5 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#5F7356] shrink-0" />
                  <span className="truncate">{data.venueName}</span>
                </span>
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans-ar font-bold text-[#4B5C47] hover:text-[#2E3B2B] underline underline-offset-2 transition-colors shrink-0"
                >
                  فتح في خرائط Google
                </a>
              </div>
            </div>
          </div>

          {/* 9. Dress Code */}
          {data.dressCode && (
            <div id="dress-code-block" className="pt-1 sm:pt-2">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#EDE8DE] border border-[#DDD6C8] text-[#3A4735]">
                <span className="font-sans-ar text-xs sm:text-sm text-[#677761]">Dress Code:</span>
                <span className="font-sans-ar text-xs sm:text-base font-bold text-[#2B3527]">{data.dressCode}</span>
              </div>
            </div>
          )}

          {/* 10. الآية القرآنية الكريمة المزخرفة */}
          <div id="final-phrase-block" className="pt-6 sm:pt-8 border-t border-[#E8E4DA] w-full flex flex-col items-center">
            <QuranicVerse
              verse={data.finalPhrase || "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً"}
              size="md"
              theme="light"
              showSurahHint={false}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
