import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Send, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RSVPRecord, InvitationData } from '../types';
import { useWeddingData } from '../context/WeddingDataContext';

interface RSVPSectionProps {
  data: InvitationData;
  initialGuestName?: string;
}

export const RSVPSection: React.FC<RSVPSectionProps> = ({ data, initialGuestName = '' }) => {
  const { saveRSVP } = useWeddingData();

  const [guestName, setGuestName] = useState<string>(initialGuestName);
  const [status, setStatus] = useState<'attending' | 'declined'>('attending');
  const [companionCount, setCompanionCount] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialGuestName) {
      setGuestName(initialGuestName);
    }
  }, [initialGuestName]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#832E41', '#C4AA7E', '#FAF8F5', '#A84358', '#D4AF37'],
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestName.trim()) return;

    setIsSubmitting(true);

    const newRecord: RSVPRecord = {
      id: Date.now().toString(),
      guestName: guestName.trim(),
      status,
      companionCount: status === 'attending' ? companionCount : 0,
      note: note.trim(),
      submittedAt: new Date().toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    saveRSVP(newRecord);
    setIsSubmitting(false);
    setIsSubmitted(true);
    if (status === 'attending') {
      triggerCelebration();
    }
  };

  const handleSendWhatsApp = async () => {
    if (!guestName.trim()) return;

    await handleSave();

    const attendanceText = status === 'attending' 
      ? `✅ *يسعدني ويشرفني الحضور بإذن الله*\n👥 *عدد الحضور:* ${companionCount}` 
      : `🤍 *أعتذر بكل ود عن عدم الحضور، وأتمنى للعروسين دوام الفرح والسعادة*`;

    const noteText = note.trim() ? `\n💌 *رسالة للعروسين:* ${note.trim()}` : '';

    const message = `السلام عليكم ورحمة الله وبركاته 🌸\n` +
      `تأكيد حضور حفل زفاف *${data.groom} و ${data.bride}*\n\n` +
      `👤 *الاسم:* ${guestName.trim()}\n` +
      `${attendanceText}${noteText}\n\n` +
      `بارك الله لكما وبارك عليكما وجمع بينكما في خير ✨`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${data.whatsappNumber}&text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section
      id="rsvp-invitation-section"
      className="w-full max-w-2xl mx-auto my-6 sm:my-8 select-none"
    >
      <div className="relative bg-[#FCFAF7] rounded-3xl p-4 xs:p-6 sm:p-8 md:p-9 border-2 border-[#DFCBA0] shadow-[0_16px_48px_rgba(45,11,20,0.08)] overflow-hidden">
        {/* Subtle decorative gold line */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-10 sm:w-14 bg-[#C4AA7E]" />
          <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#832E41]" />
          <span className="h-px w-10 sm:w-14 bg-[#C4AA7E]" />
        </div>

        <h3 className="font-sans-ar text-xl xs:text-2xl sm:text-3xl text-center font-bold text-[#2B1117]">
          تأكيد الحضور
        </h3>
        <p className="font-sans-ar text-xs sm:text-sm text-center text-[#7E3243] mt-1.5 max-w-md mx-auto">
          يسعدنا تأكيد حضوركم الكريم لمشاركتنا فرحة العمر وترتيب مقاعدكم في القاعة
        </p>

        {isSubmitted ? (
          <div className="my-6 p-4 sm:p-6 rounded-2xl bg-[#FAF3F5] border border-[#ECD1D8] text-center space-y-3 animate-fade-in">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#832E41] text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117]">
              {status === 'attending' ? 'شكراً لتأكيد حضورك!' : 'شكراً لردك اللطيف'}
            </h4>
            <p className="font-sans-ar text-xs sm:text-sm text-[#5E2330] max-w-sm mx-auto">
              {status === 'attending'
                ? `نتشرف بك يا ${guestName} وبانتظار تشريفك لنا يوم 5 نوفمبر 2026 بإذن الله.`
                : `نقدر اعتذارك يا ${guestName} ودعواتكم الطيبة تسعد قلوبنا دائماً.`}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCECEF] text-[#832E41] text-xs font-sans-ar font-medium border border-[#832E41]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم تسجيل وتوثيق ردك بنجاح ✨</span>
            </div>

            <div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-sans-ar text-[#832E41] underline hover:text-[#5E1C2B] transition-colors"
              >
                تعديل الرد
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
            {/* 1. Status Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => setStatus('attending')}
                className={`flex items-center justify-center gap-2 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                  status === 'attending'
                    ? 'bg-[#832E41] text-[#FAF8F5] border-[#832E41] shadow-md transform -translate-y-0.5'
                    : 'bg-white text-[#4A1B25] border-[#DDD5C5] hover:bg-[#FDF9FA]'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${status === 'attending' ? 'text-[#FAF8F5]' : 'text-[#832E41]'}`} />
                <span className="font-sans-ar text-xs sm:text-sm font-semibold">يشرفني الحضور بكل سرور</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('declined')}
                className={`flex items-center justify-center gap-2 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                  status === 'declined'
                    ? 'bg-[#8E6268] text-[#FAF8F5] border-[#8E6268] shadow-md transform -translate-y-0.5'
                    : 'bg-white text-[#4A1B25] border-[#DDD5C5] hover:bg-[#FDF9FA]'
                }`}
              >
                <XCircle className={`w-4 h-4 shrink-0 ${status === 'declined' ? 'text-[#FAF8F5]' : 'text-[#8E6268]'}`} />
                <span className="font-sans-ar text-xs sm:text-sm font-semibold">أعتذر بكل ود</span>
              </button>
            </div>

            {/* 2. Guest Name Input */}
            <div>
              <label className="block font-sans-ar text-xs sm:text-sm font-medium text-[#5E2330] mb-1.5">
                الاسم الكريم
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="أدخل اسمك أو اسم العائلة الكريمة..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm"
              />
            </div>

            {/* 3. Number of Attendees (Only if attending) */}
            {status === 'attending' && (
              <div className="animate-fade-in">
                <label className="block font-sans-ar text-xs sm:text-sm font-medium text-[#5E2330] mb-1.5">
                  عدد الحاضرين (شاملاً حضرتك)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCompanionCount(num)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-sans-ar font-bold transition-all duration-200 ${
                        companionCount === num
                          ? 'bg-[#832E41] text-[#FAF8F5] border-[#832E41] shadow-xs'
                          : 'bg-white text-[#5E2330] border-[#DDD5C5] hover:bg-[#FDF9FA]'
                      }`}
                    >
                      {num === 5 ? '5+' : num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Optional Prayer or Message */}
            <div>
              <label className="block font-sans-ar text-xs sm:text-sm font-medium text-[#5E2330] mb-1.5">
                رسالة أو دعاء مبارك للعروسين (اختياري)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اكتب كلمة طيبة أو دعاء جميل للعروسين..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm resize-none"
              />
            </div>

            {/* 5. Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* Save directly in app (تأكيد الحضور) */}
              <button
                type="submit"
                disabled={!guestName.trim() || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] font-sans-ar text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'جاري تأكيد الحضور...' : 'تأكيد الحضور'}
                </span>
              </button>

              {/* Send WhatsApp */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={!guestName.trim()}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-sans-ar text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
                <span>إرسال التأكيد عبر واتساب</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
