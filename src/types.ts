export interface TimelineEventItem {
  id: string;
  time: string;
  title: string;
  description: string;
  iconType: 'sparkles' | 'music' | 'utensils' | 'heart' | 'camera' | 'clock';
}

export interface InvitationData {
  closingQuote: string;
  occasion: string;
  groom: string;
  bride: string;
  namesDisplay: string;
  date: string;
  day: string;
  showDayOfWeek: boolean;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  dressCode: string;
  childrenPolicy: string;
  parkingPolicy: string;
  finalPhrase: string;
  quranVerseText: string;
  honorStatement: string;
  weddingTimestamp: number; // Timestamp in ms
  weddingDateTimeISO?: string; // YYYY-MM-DDTHH:mm
  whatsappNumber: string; // for receiving RSVP
  timelineEvents: TimelineEventItem[];
}

export const DEFAULT_TIMELINE_EVENTS: TimelineEventItem[] = [
  {
    id: 'tl-1',
    time: '8:00 م',
    title: 'استقبال الضيوف الكرام',
    description: 'فتح أبواب القاعة والترحيب بالمدعوين مع المشروبات والضيافة',
    iconType: 'sparkles',
  },
  {
    id: 'tl-2',
    time: '9:00 م',
    title: 'الزفة الملكية ودخول العروسين',
    description: 'لحظة الدخول المنتظرة وتألق العروسين في ليلة العمر',
    iconType: 'music',
  },
  {
    id: 'tl-3',
    time: '10:30 م',
    title: 'مأدبة العشاء الفاخرة',
    description: 'بوفيه عشاء مفتوح يجمع أشهى الأطباق والمقبلات والحلويات',
    iconType: 'utensils',
  },
  {
    id: 'tl-4',
    time: '11:30 م',
    title: 'تقطيع كعكة الزفاف والتصوير',
    description: 'مشاركة الفرحة، تقطيع التورتة والتقاط الصور التذكارية',
    iconType: 'heart',
  },
];

export const INVITATION_DATA: InvitationData = {
  closingQuote: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  occasion: "حفل زفاف",
  groom: "محمد",
  bride: "دنيا",
  namesDisplay: "محمد و دنيا",
  date: "5 نوفمبر 2026",
  day: "الخميس",
  showDayOfWeek: true,
  startTime: "8:00 مساءً",
  endTime: "12:00 مساءً",
  venueName: "قاعة لاجوي",
  address: "محرم بيك، محور المحمودية بجوار كوبري مشاه راغب",
  googleMapsUrl: "https://maps.app.goo.gl/gg8i1kbKGK4o6wVv5",
  dressCode: "رسمي وأنيق يليق بفخامة الحفل",
  childrenPolicy: "نعتذر عن استقبال الأطفال لراحتكم وسهرتكم",
  parkingPolicy: "تتوفر أماكن مخصصة وخدمة صف سيارات أمام القاعة",
  finalPhrase: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  quranVerseText: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  honorStatement: "يتشرف أهل العروسين بدعوتكم لمشاركتهم فرحة",
  // 5 November 2026 at 20:00:00 Egypt time (UTC+2) -> 2026-11-05T18:00:00Z
  weddingTimestamp: new Date('2026-11-05T20:00:00+02:00').getTime(),
  weddingDateTimeISO: '2026-11-05T20:00',
  whatsappNumber: "201000000000",
  timelineEvents: DEFAULT_TIMELINE_EVENTS,
};

export interface RSVPRecord {
  id: string;
  guestName: string;
  status: 'attending' | 'declined';
  companionCount: number;
  note?: string;
  submittedAt: string;
}

export interface GuestbookMessage {
  id: string;
  author: string;
  relation?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface BatchGuest {
  id: string;
  name: string;
  phone?: string;
  sent: boolean;
  sentAt?: string;
  notes?: string;
}
