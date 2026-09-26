import type { InvitationData } from '../types';
import { buildInvitationUrl } from './invitationUrl';

/**
 * Formats a royal WhatsApp invitation card message
 * with styling, Quranic verse, personalized guest addressing, and link.
 */
export function formatWhatsAppInvitation(
  data: InvitationData,
  guestName?: string,
  customUrl?: string
): string {
  const trimmedGuest = guestName?.trim() || '';

  const link = customUrl
    ? customUrl
    : buildInvitationUrl(trimmedGuest);

  const cleanVerse = (
    data.quranVerseText ||
    'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً'
  ).replace(/^[«"'\s﴿]+|[»"'\s﴾]+$/g, '');

  if (trimmedGuest) {
    return [
      `🌸 *المكرّم / المكرّمة:* ${trimmedGuest} حفظكم الله ورعاكم`,
      ``,
      `﴿ ${cleanVerse} ﴾`,
      ``,
      `يسعدنا ويشرفنا دعوتكم الكريمة لمشاركتنا أجمل اللحظات وأسعدها بمناسبة ${data.occasion || 'حفل زفاف'}:`,
      `💍 *${data.groom} و ${data.bride}* 💍`,
      ``,
      `بطاقة الدعوة:`,
      `تم إعداد بطاقة دعوة خاصة باسمكم الكريم. تفضلوا بفتح *بطاقة الدعوة* لمعرفة كافة تفاصيل وموقع الحفل وتأكيد حضوركم الكريم عبر الرابط التالي:`,
      ``,
      `👇 *اضغط هنا لفتح بطاقتكم وتسجيل الحضور:*`,
      `${link}`,
      ``,
      `✨ نسعد بتشريفكم وتأكيد حضوركم ومشاركتنا فرحتنا ✨`,
    ].join('\n');
  }

  return [
    `﴿ ${cleanVerse} ﴾`,
    ``,
    `يسعدنا ويشرفنا دعوتكم الكريمة لمشاركتنا فرحتنا الكبرى بمناسبة ${data.occasion || 'حفل زفاف'}:`,
    `💍 *${data.groom} و ${data.bride}* 💍`,
    ``,
    `بطاقة الدعوة:`,
    `تم إعداد بطاقة دعوة خاصة بكم. تفضلوا بفتح *بطاقة الدعوة* لمعرفة تفاصيل وموقع الحفل وتأكيد حضوركم الكريم عبر الرابط التالي:`,
    ``,
    `👇 *اضغط هنا لفتح بطاقة الدعوة وتسجيل الحضور:*`,
    `${link}`,
    ``,
    `✨ نسعد بتشريفكم وتأكيد حضوركم ومشاركتنا فرحتنا ✨`,
  ].join('\n');
}

export function buildWhatsAppShareUrl(text: string, phoneNumber?: string): string {
  let cleanPhone = phoneNumber ? phoneNumber.replace(/[^0-9+]/g, '').trim() : '';
  if (cleanPhone) {
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('00')) {
      cleanPhone = cleanPhone.substring(2);
    }
  }

  const whatsappUrl = new URL('https://wa.me/');
  if (cleanPhone) {
    whatsappUrl.pathname = `/${cleanPhone}`;
  }
  whatsappUrl.searchParams.set('text', text);
  return whatsappUrl.toString();
}

export function openWhatsAppShare(text: string, phoneNumber?: string) {
  window.open(buildWhatsAppShareUrl(text, phoneNumber), '_blank');
}
