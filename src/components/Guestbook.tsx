import React, { useState, useEffect } from 'react';
import { Heart, Send, MessageCircleHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GuestbookMessage } from '../types';
import { useWeddingData } from '../context/WeddingDataContext';

interface GuestbookProps {
  initialAuthor?: string;
  groom: string;
  bride: string;
}

const PRESET_BLESSINGS = [
  'بارك الله لكما وبارك عليكما وجمع بينكما في خير 🤍',
  'ألف مبروك وبالرفاه والبنين يا رب ✨',
  'أجمل عروسين في الدنيا، ربي يتمم لكم بكل خير 🌸',
  'دمتم سنداً وحباً لبعضكم طوال العمر 🌿',
];

export const Guestbook: React.FC<GuestbookProps> = ({ initialAuthor = '', groom, bride }) => {
  const {
    guestbookMessages,
    saveGuestbookMessage,
    setGuestbookMessages,
  } = useWeddingData();

  const [author, setAuthor] = useState<string>(initialAuthor);
  const [relation, setRelation] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialAuthor) {
      setAuthor(initialAuthor);
    }
  }, [initialAuthor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const newMsg: GuestbookMessage = {
      id: Date.now().toString(),
      author: author.trim(),
      relation: relation.trim() || undefined,
      content: content.trim(),
      createdAt: 'الآن',
      likes: 1,
    };

    saveGuestbookMessage(newMsg);
    setIsSubmitting(false);
    setContent('');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#832E41', '#FAF8F5', '#A84358'],
    });
  };

  const handleLike = (id: string) => {
    if (likedMap[id]) return;
    setLikedMap(prev => ({ ...prev, [id]: true }));

    const updated = guestbookMessages.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m);
    setGuestbookMessages(updated);
    try {
      localStorage.setItem('wedding_guestbook_messages', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <section
      id="wedding-guestbook-section"
      className="w-full max-w-2xl mx-auto my-6 sm:my-8 select-none"
    >
      <div className="relative bg-[#FCFAF7] rounded-3xl p-4 xs:p-6 sm:p-8 md:p-9 border-2 border-[#DFCBA0] shadow-[0_16px_48px_rgba(45,11,20,0.08)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-10 sm:w-14 bg-[#C4AA7E]" />
          <MessageCircleHeart className="w-4 h-4 sm:w-5 sm:h-5 text-[#832E41]" />
          <span className="h-px w-10 sm:w-14 bg-[#C4AA7E]" />
        </div>

        <h3 className="font-sans-ar text-xl xs:text-2xl sm:text-3xl text-center font-bold text-[#2B1117]">
          سجل التهاني والمباركات
        </h3>
        <p className="font-sans-ar text-xs sm:text-sm text-center text-[#7E3243] mt-1.5 max-w-md mx-auto">
          شارك العروسين {groom} و {bride} أطيب التهاني والأدعية لتبقى ذكرى عطرة في قلوبهما
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-sans-ar text-xs font-medium text-[#5E2330] mb-1">
                اسمك الكريم *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="الاسم..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm"
              />
            </div>

            <div>
              <label className="block font-sans-ar text-xs font-medium text-[#5E2330] mb-1">
                صلة القرابة أو الصفة (اختياري)
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="مثال: صديق، زميل، الأهل..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm"
              />
            </div>
          </div>

          {/* Quick Blessing chips */}
          <div>
            <span className="block font-sans-ar text-xs sm:text-sm text-[#8C4A5A] mb-1.5 font-medium">
              عبارات تهنئة سريعة (انقر للاختيار):
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_BLESSINGS.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setContent(phrase)}
                  className="px-3 py-1.5 rounded-full bg-[#F7EEF0] hover:bg-[#EFE2E5] text-[#5E1C2B] text-xs sm:text-sm font-sans-ar font-medium transition-colors duration-200 border border-[#E8D0D6]"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-sans-ar text-xs sm:text-sm font-medium text-[#5E2330] mb-1">
              رسالتك ودعاؤك للعروسين *
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تهنئتك القلبية هنا..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!author.trim() || !content.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] font-sans-ar text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting ? 'جاري نشر التهنئة...' : 'نشر التهنئة في السجل'}
            </span>
          </button>
        </form>

        {/* Message Feed */}
        <div className="mt-8 space-y-3.5 max-h-96 overflow-y-auto pr-1">
          {guestbookMessages.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE4D5] shadow-2xs hover:border-[#DEC496] transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-sans-ar font-bold text-base text-[#2B1117]">
                    {item.author}
                  </span>
                  {item.relation && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F7EEF0] text-[#832E41] text-xs font-sans-ar font-medium">
                      {item.relation}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#A67E88] font-sans-ar">
                  {item.createdAt}
                </span>
              </div>

              <p className="font-sans-ar text-sm sm:text-base text-[#4A1B25] leading-relaxed">
                {item.content}
              </p>

              <div className="mt-3 pt-2 border-t border-[#F5EDEF] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-1.5 text-xs font-sans-ar transition-colors duration-200 ${
                    likedMap[item.id] ? 'text-[#832E41]' : 'text-[#A67E88] hover:text-[#832E41]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedMap[item.id] ? 'fill-current text-[#832E41]' : ''}`} />
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
