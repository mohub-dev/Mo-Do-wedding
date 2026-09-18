import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Share2,
  Check,
  RotateCcw,
  ExternalLink,
  QrCode,
  Sparkles,
  Copy,
  Heart,
} from 'lucide-react';
import { InvitationData } from '../types';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { CountdownTimer } from './CountdownTimer';
import { EventTimeline } from './EventTimeline';
import { EtiquetteCards } from './EtiquetteCards';
import { VIPEntryPassModal } from './VIPEntryPassModal';
import { RSVPSection } from './RSVPSection';
import { Guestbook } from './Guestbook';
import { QuranicVerse } from './QuranicVerse';
import { ShareOptionsModal } from './ShareOptionsModal';
import { GuestLinkGeneratorModal } from './GuestLinkGeneratorModal';
import { formatWhatsAppInvitation, openWhatsAppShare } from '../utils/whatsappShare';

interface WeddingCardProps {
  data: InvitationData;
  guestName?: string;
  onReplay: () => void;
}

export const WeddingCard: React.FC<WeddingCardProps> = ({
  data,
  guestName = '',
  onReplay,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Generate Google Calendar Link
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `حفل زفاف ${data.groom} و ${data.bride}`
  )}&dates=20261105T180000Z/20261105T220000Z&details=${encodeURIComponent(
    `يتشرف العروسان بدعوتكم لحضور حفل زفافهما في ${data.venueName}.\nالعنوان: ${data.address}`
  )}&location=${encodeURIComponent(`${data.venueName}, ${data.address}`)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${data.venueName} - ${data.address}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleWhatsAppShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <section
      id="wedding-card-view"
      className="relative z-10 w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-8 md:py-10"
    >
      {/* 1. Personalized Greeting for Invited Guest */}
      {guestName && <PersonalizedGreeting guestName={guestName} />}

      {/* Royal Cardstock Container */}
      <div
        id="royal-wedding-card-view"
        className="relative bg-[#FCFAF7] rounded-2xl sm:rounded-3xl shadow-[0_16px_48px_rgba(45,11,20,0.1),0_6px_16px_rgba(45,11,20,0.04)] border border-[#DFCBA0]/80 overflow-hidden text-[#2B1117] px-3.5 xs:px-5 sm:px-7 md:px-8 py-5 xs:py-6 sm:py-8 md:py-9 transition-all duration-700"
      >
        {/* Subtle Cotton Paper Fiber Texture */}
        <div className="absolute inset-0 bg-cream-paper opacity-60 pointer-events-none" />

        {/* Double Gold Fillet Decorative Border */}
        <div className="absolute inset-1.5 sm:inset-2.5 border border-[#DFCBA0]/50 rounded-xl sm:rounded-[20px] pointer-events-none" />
        <div className="absolute inset-2.5 sm:inset-3.5 border border-[#EFE5D0]/80 rounded-lg sm:rounded-[16px] pointer-events-none" />

        {/* Main Card Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-7">
          
          {/* 1. البسملة الشريفة */}
          <div id="card-bismillah" className="pt-1 sm:pt-2">
            <p className="font-amiri text-lg sm:text-2xl md:text-3xl text-[#832E41] tracking-wider leading-relaxed font-bold">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* 2. الآية القرآنية الكريمة */}
          <div id="card-quran-verse" className="w-full max-w-2xl px-2 sm:px-6">
            <div className="flex items-center justify-center gap-2 mb-2 opacity-85">
              <span className="h-px w-8 sm:w-16 bg-[#B89656]/50" />
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="#B89656"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
                <circle cx="12" cy="10" r="1.5" fill="#FAF8F5" />
              </svg>
              <span className="h-px w-8 sm:w-16 bg-[#B89656]/50" />
            </div>

            <p
              dir="rtl"
              className="font-amiri text-lg sm:text-2xl md:text-3xl text-[#2B1117] font-bold leading-relaxed tracking-normal sm:tracking-wide text-center"
              style={{ textShadow: '0 1px 2px rgba(184,150,86,0.2)' }}
            >
              <span className="text-[#B89656] font-bold select-none inline">﴿ </span>
              {(data.quranVerseText || "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً").replace(/^[«"'\s﴿]+|[»"'\s﴾]+$/g, '')}
              <span className="text-[#B89656] font-bold select-none inline"> ﴾</span>
            </p>
          </div>

          {/* 3. ديباجة الدعوة */}
          <div id="card-honor-statement" className="space-y-1">
            <span className="font-sans-ar text-sm sm:text-base md:text-lg text-[#7E3243] tracking-wide block font-medium">
              {data.honorStatement || "يتشرف أهل العروسين بدعوتكم لمشاركتهم فرحة"}
            </span>
            <h3 className="font-sans-ar text-lg xs:text-xl sm:text-2xl md:text-3xl text-[#832E41] font-bold tracking-wide pt-0.5">
              {data.occasion}
            </h3>
          </div>

          {/* 4. أسماء العروسين والشعار الذهبي */}
          <div id="card-couple-names" className="py-1 sm:py-2 w-full max-w-lg">
            <div className="relative inline-block px-2">
              <h1 className="font-sans-ar text-3xl xs:text-4xl sm:text-5xl md:text-6xl text-[#2B1117] font-bold tracking-normal leading-snug drop-shadow-xs">
                {data.namesDisplay}
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2">
              <span className="h-px w-10 sm:w-20 bg-gradient-to-l from-[#C4AA7E] to-transparent" />
              <span className="font-sans-ar text-xs xs:text-sm sm:text-base md:text-lg text-[#9A7D43] tracking-wider font-semibold">
                بارك الله لهما وبارك عليهما وجمع بينهما في خير
              </span>
              <span className="h-px w-10 sm:w-20 bg-gradient-to-r from-[#C4AA7E] to-transparent" />
            </div>
          </div>

          {/* 5. بطاقة الموعد والتاريخ */}
          <div
            id="card-date-time-box"
            className="w-full max-w-sm sm:max-w-md mx-auto p-3.5 xs:p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#FDF8F9] to-[#F5ECEE] border-2 border-[#DFCBA0] space-y-1.5 sm:space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-center gap-2 text-[#832E41] text-xs sm:text-sm md:text-base font-bold">
              <Calendar className="w-4 h-4 text-[#C4AA7E]" />
              <span>الموعد المبارك بمشيئة الله تعالى</span>
            </div>
            <p className="font-sans-ar text-lg xs:text-xl sm:text-2xl md:text-3xl text-[#2B1117] font-bold">
              يوم {data.day} • {data.date}
            </p>
            <p className="font-sans-ar text-xs sm:text-sm md:text-base text-[#5E2330]">
              من الساعة <span className="font-bold text-[#2B1117]">{data.startTime}</span> وحتى <span className="font-bold text-[#2B1117]">{data.endTime}</span>
            </p>
          </div>

          {/* 6. المكان والعنوان والخريطة المضمنة */}
          <div id="card-venue-section" className="w-full max-w-sm sm:max-w-md mx-auto space-y-2 pt-1">
            <div className="flex items-center justify-center gap-2 text-[#832E41]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#832E41]" />
              <h2 className="font-sans-ar text-xl xs:text-2xl sm:text-3xl font-bold text-[#2B1117]">
                {data.venueName}
              </h2>
            </div>
            <p className="font-sans-ar text-xs sm:text-sm md:text-base text-[#5E2330] leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              {data.address}
            </p>

            {/* الخريطة المضمنة */}
            <div
              id="embedded-google-map-container"
              className="mt-2 w-full rounded-2xl overflow-hidden border-2 border-[#DEC496] shadow-xs bg-[#FAF7F2]"
            >
              <iframe
                title={`موقع ${data.venueName}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(data.venueName + ' ' + data.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-36 xs:h-40 sm:h-48 md:h-52 border-0 block"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* شريط أدوات الخريطة */}
              <div className="py-2 px-3 sm:px-4 bg-[#FCFAF7] border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#6A2B3A]">
                <button
                  onClick={handleCopyAddress}
                  className="font-sans-ar flex items-center gap-1.5 font-medium hover:text-[#2B1117] transition-colors"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3E7D32]" />
                      <span className="text-[#3E7D32] font-semibold">تم نسخ العنوان</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#832E41]" />
                      <span>نسخ العنوان</span>
                    </>
                  )}
                </button>
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans-ar font-bold text-[#832E41] hover:text-[#5E1C2B] flex items-center gap-1.5 underline underline-offset-2 transition-colors"
                >
                  <span>فتح الاتجاهات (GPS)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 7. الجدول الزمني لفقرات الحفل (Event Timeline) */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            <EventTimeline events={data.timelineEvents} />
          </div>

          {/* 8. إرشادات الحفل والزي المقترح (Etiquette & Dress Code) */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            <EtiquetteCards
              dressCode={data.dressCode}
              childrenPolicy={data.childrenPolicy}
              parkingPolicy={data.parkingPolicy}
            />
          </div>

          {/* 9. الآية الختامية */}
          <div id="card-closing-phrase" className="pt-4 sm:pt-5 border-t border-[#EBE3D3] w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
            <QuranicVerse
              verse={data.finalPhrase || "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً"}
              size="md"
              theme="light"
              showSurahHint={false}
            />
            <p className="font-sans-ar text-sm sm:text-base md:text-lg text-[#832E41] pt-1.5 font-semibold">
              حضوركم يشرفنا ويسعد قلوبنا، ويزيد ليلتنا بهجة وسروراً
            </p>
          </div>

        </div>
      </div>

      {/* 2. العداد التنازلي المباشر */}
      <CountdownTimer
        targetTimestamp={data.weddingTimestamp}
        day={data.day}
        date={data.date}
      />

      {/* 3. Smart RSVP Section (تأكيد الحضور) */}
      <RSVPSection data={data} initialGuestName={guestName} />

      {/* 4. Digital Guestbook (سجل التهاني والمباركات) */}
      <Guestbook initialAuthor={guestName} groom={data.groom} bride={data.bride} />

      {/* 5. شريط أزرار التفاعل والإجراءات السريعة - صف واحد في آخر الصفحة */}
      <div
        id="invitation-actions-tray"
        className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto select-none"
      >
        <div className="grid grid-cols-5 gap-1 xs:gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-2xl bg-white/80 border border-[#E8DFC9] shadow-xs backdrop-blur-xs">
          {/* VIP Digital Entry Pass Modal Trigger */}
          <button
            onClick={() => setIsPassModalOpen(true)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 sm:py-2.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] shadow-xs hover:shadow-md font-sans-ar text-[11px] xs:text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
            title="بطاقة الدخول الرقمية VIP"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DEC496] shrink-0" />
            <span className="truncate">بطاقة VIP</span>
          </button>

          {/* Add to Google Calendar */}
          <a
            id="add-to-calendar-btn"
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 sm:py-2.5 rounded-xl bg-[#FCFAF7] hover:bg-white text-[#3A141E] border border-[#DDD4C4] shadow-xs hover:shadow-md font-sans-ar text-[11px] xs:text-xs sm:text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
            title="إضافة إلى التقويم"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#832E41] shrink-0" />
            <span className="truncate">التقويم</span>
          </a>

          {/* Share via WhatsApp */}
          <button
            id="share-whatsapp-btn"
            onClick={handleWhatsAppShare}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 sm:py-2.5 rounded-xl bg-[#FCFAF7] hover:bg-white text-[#3A141E] border border-[#DDD4C4] shadow-xs hover:shadow-md font-sans-ar text-[11px] xs:text-xs sm:text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none whitespace-nowrap"
            title="مشاركة الدعوة عبر واتساب"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#832E41] shrink-0" />
            <span className="truncate">مشاركة</span>
          </button>

          {/* Copy Link */}
          <button
            id="copy-invitation-link-btn"
            onClick={handleCopyLink}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 sm:py-2.5 rounded-xl bg-[#FCFAF7] hover:bg-white text-[#3A141E] border border-[#DDD4C4] shadow-xs hover:shadow-md font-sans-ar text-[11px] xs:text-xs sm:text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none whitespace-nowrap"
            title="نسخ رابط الدعوة"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3E7D32] shrink-0" />
                <span className="text-[#3E7D32] truncate">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#832E41] shrink-0" />
                <span className="truncate">نسخ الرابط</span>
              </>
            )}
          </button>

          {/* Replay Envelope Opening */}
          <button
            id="replay-invitation-btn"
            onClick={onReplay}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 sm:py-2.5 rounded-xl bg-[#832E41]/10 hover:bg-[#832E41]/20 text-[#4D1522] border border-[#832E41]/30 font-sans-ar text-[11px] xs:text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none whitespace-nowrap"
            title="إعادة فتح المظروف"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#832E41] shrink-0" />
            <span className="truncate">فتح المظروف</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-8 pb-4 text-center select-none">
        <p className="text-[11px] sm:text-xs text-[#832E41]/60 font-sans-ar">
          دعوة زفاف خاصة • {data.groom} & {data.bride}
        </p>
      </footer>

      {/* VIP Entry Pass Modal */}
      <VIPEntryPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        guestName={guestName}
        data={data}
      />

      {/* Share Options & Image Export Modal */}
      <ShareOptionsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={data}
        guestName={guestName}
        onOpenBulkModal={() => {
          setIsShareModalOpen(false);
          setIsBulkModalOpen(true);
        }}
      />

      {/* Bulk Multi-Guest Dispatcher Modal */}
      <GuestLinkGeneratorModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        data={data}
      />
    </section>
  );
};
