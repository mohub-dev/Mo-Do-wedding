import React, { useRef } from 'react';
import { X, Download, Sparkles, MapPin, Calendar, Users } from 'lucide-react';
import { InvitationData } from '../types';

interface VIPEntryPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName: string;
  data: InvitationData;
  companionCount?: number;
}

export const VIPEntryPassModal: React.FC<VIPEntryPassModalProps> = ({
  isOpen,
  onClose,
  guestName,
  data,
  companionCount = 1,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayName = guestName.trim() || 'ضيفنا الكريم';
  const qrData = encodeURIComponent(
    `WEDDING-PASS|GUEST:${displayName}|COUPLE:${data.groom}&${data.bride}|DATE:2026-11-05|VENUE:${data.venueName}`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&color=832e41&bgcolor=fcfaf7&margin=0`;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#FAF7F2] rounded-3xl border-2 border-[#D8C49D] shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
          <div className="flex items-center gap-2 text-[#832E41]">
            <Sparkles className="w-5 h-5 text-[#C4AA7E]" />
            <h3 className="font-sans-ar text-base sm:text-lg font-bold text-[#2B1117]">
              بطاقة الدخول الرقمية (VIP Pass)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFE9DD] text-[#7E3243] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Digital Pass Card */}
        <div
          ref={cardRef}
          className="relative rounded-2xl bg-gradient-to-b from-[#FCFAF7] to-[#F7EEF0] border border-[#DFCBA0] p-4 sm:p-5 shadow-xs text-center space-y-4 overflow-hidden"
        >
          {/* Decorative Corner Fillets */}
          <div className="absolute inset-1.5 border border-[#DEC496]/50 rounded-xl pointer-events-none" />

          {/* Top Pass Brand */}
          <div className="space-y-0.5">
            <span className="font-sans-ar text-[11px] font-bold uppercase tracking-widest text-[#8A713F]">
              بطاقة دعوة خاصة • VIP ENTRY PASS
            </span>
            <h4 className="font-sans-ar text-2xl sm:text-3xl font-bold text-[#2B1117]">
              {data.groom} و {data.bride}
            </h4>
          </div>

          {/* Guest Name Callout */}
          <div className="py-2.5 px-3 rounded-xl bg-white/90 border border-[#E5DEC9] shadow-xs">
            <span className="text-[11px] text-[#7E3243] font-medium block">مرحباً بكم:</span>
            <p className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117] mt-0.5">
              {displayName}
            </p>
            {companionCount > 1 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#832E41] font-semibold mt-1">
                <Users className="w-3 h-3" /> مسموح بالدخول لـ ({companionCount}) أفراد
              </span>
            )}
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E2D6C0] max-w-[200px] mx-auto shadow-xs">
            <img
              src={qrCodeUrl}
              alt="رمز الاستجابة السريع للدخول"
              className="w-36 h-36 rounded-lg"
              loading="lazy"
            />
            <span className="text-[10px] text-[#8C4A5A] font-mono mt-1.5">
              PASS #{Math.abs(displayName.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 90000 + 10000)}
            </span>
          </div>

          {/* Details Summary */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5E2330] text-right pt-1 border-t border-[#E8DFCF]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C4AA7E]" />
              <span>الخميس 5 نوفمبر 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C4AA7E]" />
              <span className="truncate">{data.venueName}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center pt-1">
          <button
            onClick={() => window.print()}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#DEC496]" />
            <span>طباعة أو حفظ البطاقة الرقمية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
