import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ExternalLink,
  ClipboardCheck,
  Eye,
  Mail,
  FileText,
  Users,
} from 'lucide-react';
import { InvitationData } from '../types';
import { formatWhatsAppInvitation, openWhatsAppShare } from '../utils/whatsappShare';
import {
  createRoyalCardImage,
  downloadImageBlob,
  shareImageWithWebShare,
  copyImageToClipboard,
  CardExportType,
} from '../utils/cardImageExport';

interface ShareOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvitationData;
  guestName?: string;
  customUrl?: string;
  onOpenBulkModal?: () => void;
}

export const ShareOptionsModal: React.FC<ShareOptionsModalProps> = ({
  isOpen,
  onClose,
  data,
  guestName = '',
  customUrl,
  onOpenBulkModal,
}) => {
  const [cardType, setCardType] = useState<CardExportType>('envelope');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Generate card image preview on open, guestName change, or cardType change
  useEffect(() => {
    if (isOpen) {
      createRoyalCardImage(data, guestName, cardType)
        .then((res) => {
          setCardPreviewUrl(res.dataUrl);
        })
        .catch((err) => {
          console.error('Failed to preview card:', err);
        });
    }
  }, [isOpen, data, guestName, cardType]);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '';

  const targetLink = customUrl
    ? customUrl
    : guestName.trim()
    ? `${currentOrigin}?guest=${encodeURIComponent(guestName.trim())}`
    : typeof window !== 'undefined'
    ? window.location.href
    : '';

  const formattedMessage = formatWhatsAppInvitation(data, guestName, targetLink);

  const showNotification = (
    text: string,
    type: 'success' | 'info' | 'error' = 'success'
  ) => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // 1. Copy Image directly to Clipboard (Ctrl+V into WhatsApp)
  const handleCopyImageToClipboard = async () => {
    setIsGeneratingImage(true);
    try {
      const { blob, dataUrl } = await createRoyalCardImage(data, guestName, cardType);
      const success = await copyImageToClipboard(blob);
      if (success) {
        setCopiedImage(true);
        showNotification(
          'تم نسخ صورة بطاقة الدعوة الملكية! الصقها الآن (Ctrl+V) في محادثة الواتساب',
          'success'
        );
        setTimeout(() => setCopiedImage(false), 3500);
      } else {
        // Fallback: If browser sandbox blocks clipboard image write, download directly
        const filename = `دعوة-زفاف-${guestName ? guestName.replace(/\s+/g, '-') : 'محمد-ودنيا'}.png`;
        downloadImageBlob(blob, dataUrl, filename);
        showNotification(
          'تم حفظ صورة البطاقة في جهازك! يمكنك سحبها أو إرفاقها في واتساب مباشرة',
          'info'
        );
      }
    } catch (err) {
      console.error('Copy image failed:', err);
      showNotification('حدث خطأ أثناء نسخ الصورة، يرجى تجربة زر التحميل', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 2. Share as Image (WhatsApp / Mobile Share Sheet)
  const handleShareAsImage = async () => {
    setIsGeneratingImage(true);
    try {
      const { blob, dataUrl } = await createRoyalCardImage(data, guestName, cardType);
      const filename = `دعوة-زفاف-${guestName ? guestName.replace(/\s+/g, '-') : 'محمد-ودنيا'}.png`;

      const shared = await shareImageWithWebShare(
        blob,
        filename,
        `دعوة زفاف ${data.groom} و ${data.bride}`,
        formattedMessage
      );

      if (!shared) {
        // Fallback: Download image and open WhatsApp
        downloadImageBlob(blob, dataUrl, filename);
        showNotification(
          'تم تنزيل صورة البطاقة الملكية! جاري فتح واتساب لإرسال النص والصورة',
          'info'
        );
        setTimeout(() => {
          openWhatsAppShare(formattedMessage);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      openWhatsAppShare(formattedMessage);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. Download HD Card Image (PNG)
  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    try {
      const { blob, dataUrl } = await createRoyalCardImage(data, guestName, cardType);
      const filename = `دعوة-زفاف-${guestName ? guestName.replace(/\s+/g, '-') : 'محمد-ودنيا'}.png`;
      const downloaded = downloadImageBlob(blob, dataUrl, filename);
      if (downloaded) {
        showNotification('تم تنزيل صورة بطاقة الدعوة بدقة فائقة HD بنجاح!', 'success');
      } else {
        showNotification('يرجى الضغط على معاينة الصورة ثم حفظها', 'info');
      }
    } catch (err) {
      console.error('Download image failed:', err);
      showNotification('تعذر التنزيل التلقائي، اضغط على زر معاينة الصورة لحفظها', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4. Copy Full Invitation Text
  const handleCopyFormattedText = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopiedText(true);
      showNotification('تم نسخ نص الدعوة الملكية بالكامل!', 'success');
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Copy Only Link
  const handleCopyOnlyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetLink);
      setCopiedLink(true);
      showNotification('تم نسخ رابط الدعوة التفاعلي!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Direct WhatsApp Text
  const handleTextWhatsApp = () => {
    openWhatsAppShare(formattedMessage);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200 select-none"
    >
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border-2 border-[#DFCBA0] shadow-2xl p-4 sm:p-6 overflow-hidden text-right max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#B89656] via-[#E5D0A1] to-[#B89656]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-[#6E2233] hover:bg-[#832E41]/10 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#832E41]/10 flex items-center justify-center text-[#832E41] shrink-0 border border-[#832E41]/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans-ar text-base sm:text-lg font-bold text-[#2B1117]">
              مشاركة بطاقة الدعوة الملكية
            </h3>
            <p className="font-sans-ar text-xs text-[#7E3243]">
              {guestName
                ? `بطاقة مخصصة باسم: ${guestName}`
                : 'مشاركة بطاقة الدعوة مع الأهل والأصدقاء'}
            </p>
          </div>
        </div>

        {/* Card Style Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-1 rounded-2xl bg-[#F0EAE1] border border-[#DFCBA0]/60">
          <button
            type="button"
            onClick={() => setCardType('envelope')}
            className={`py-2 px-3 rounded-xl font-sans-ar text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cardType === 'envelope'
                ? 'bg-[#832E41] text-white shadow-sm'
                : 'text-[#692131] hover:bg-[#FAF8F5]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>المظروف والختم الملكي</span>
          </button>
          <button
            type="button"
            onClick={() => setCardType('details')}
            className={`py-2 px-3 rounded-xl font-sans-ar text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cardType === 'details'
                ? 'bg-[#832E41] text-white shadow-sm'
                : 'text-[#692131] hover:bg-[#FAF8F5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>بطاقة تفاصيل الحفل</span>
          </button>
        </div>

        {/* Card Thumbnail & Live Preview Banner */}
        {cardPreviewUrl && (
          <div className="mb-3 p-2.5 rounded-2xl bg-[#F4EFE6] border border-[#DFCBA0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={cardPreviewUrl}
                alt="معاينة بطاقة الدعوة"
                className={`object-cover rounded-lg border border-[#DFCBA0] shadow-xs shrink-0 cursor-pointer hover:scale-105 transition-transform ${
                  cardType === 'envelope' ? 'w-20 h-13' : 'w-12 h-16'
                }`}
                onClick={() => setShowPreviewModal(true)}
              />
              <div className="text-right overflow-hidden">
                <p className="font-sans-ar text-xs font-bold text-[#832E41] flex items-center gap-1">
                  <span>
                    {cardType === 'envelope'
                      ? 'صورة المظروف الملكي والختم'
                      : 'صورة بطاقة التفاصيل الفاخرة'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </p>
                <p className="font-sans-ar text-[11px] text-[#55202C] truncate">
                  {guestName ? `مكتوب عليها: ${guestName}` : 'جاهزة للإرسال والمشاركة بدقة فائقة'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white border border-[#DEC2C8] text-[#832E41] text-xs font-bold font-sans-ar flex items-center gap-1 hover:bg-[#FAF2F4] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة</span>
            </button>
          </div>
        )}

        {/* Dynamic Notification Toast */}
        {notificationMsg && (
          <div
            className={`mb-2.5 p-2.5 rounded-xl text-xs font-sans-ar font-bold text-center animate-fade-in flex items-center justify-center gap-2 border ${
              notificationMsg.type === 'success'
                ? 'bg-[#25D366]/15 border-[#25D366]/30 text-[#0F6B41]'
                : notificationMsg.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notificationMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-[#0F6B41]" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-600" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {/* Multi-Guest Bulk Dispatcher Trigger (if available) */}
          {onOpenBulkModal && (
            <button
              onClick={() => {
                onClose();
                onOpenBulkModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:from-[#0E7266] hover:to-[#05463E] text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="font-sans-ar text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>مدير الإرسال السريع لعدة مدعوين (WhatsApp)</span>
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </p>
                  <p className="font-sans-ar text-[11px] text-white/85">
                    إرسال بطاقات وروابط مخصصة بالاسم لقائمة ضيوفك بضغطة زر
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 shrink-0" />
            </button>
          )}

          {/* 1. Copy Image directly to Clipboard (Instant Ctrl+V) */}
          <button
            onClick={handleCopyImageToClipboard}
            disabled={isGeneratingImage}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#832E41] to-[#631B2B] hover:from-[#6E2233] hover:to-[#501321] text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                {isGeneratingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : copiedImage ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <ClipboardCheck className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-right">
                <p className="font-sans-ar text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <span>{copiedImage ? 'تم نسخ الصورة! الصقها الآن' : 'نسخ صورة البطاقة (لصق فوري Ctrl+V)'}</span>
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </p>
                <p className="font-sans-ar text-[11px] text-white/85">
                  لصق فوري في واتساب كصورة دعوة عالية الوضوح
                </p>
              </div>
            </div>
            {copiedImage ? (
              <span className="font-sans-ar text-xs bg-white/20 px-2 py-0.5 rounded-md font-bold">تم</span>
            ) : (
              <Copy className="w-4 h-4 text-white/80 shrink-0" />
            )}
          </button>

          {/* 2. Download HD Card Image */}
          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#FAF5EE] text-[#2B1117] border border-[#DDD4C4] shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#832E41]/10 flex items-center justify-center shrink-0 text-[#832E41]">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-right">
                <p className="font-sans-ar text-xs sm:text-sm font-bold text-[#832E41]">
                  تحميل صورة البطاقة بدقة عالية (HD PNG)
                </p>
                <p className="font-sans-ar text-[11px] text-[#7E3243]">
                  لحفظ الصورة في جهازك وإرسالها كملف صورة لأي شخص
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#832E41]/70 shrink-0" />
          </button>

          {/* 3. Share as Image via WhatsApp */}
          <button
            onClick={handleShareAsImage}
            disabled={isGeneratingImage}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="font-sans-ar text-xs sm:text-sm font-bold">
                  مشاركة كصورة وبطاقة عبر واتساب
                </p>
                <p className="font-sans-ar text-[11px] text-white/90">
                  إرسال صورة البطاقة مع النص الترحيبي والرابط
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white/80 shrink-0" />
          </button>

          {/* 4. Send Text Only via WhatsApp */}
          <button
            onClick={handleTextWhatsApp}
            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-[#FAF5EE] text-[#2B1117] border border-[#DDD4C4] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0 text-[#128C7E]">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-right">
                <p className="font-sans-ar text-xs font-bold text-[#2B1117]">
                  إرسال نص الدعوة الملكية فقط على واتساب
                </p>
                <p className="font-sans-ar text-[10px] text-[#7E3243]">
                  نص ملكي ترحيبي بالآية والأسماء مع رابط فتح المظروف وتأكيد الحضور
                </p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#128C7E] shrink-0" />
          </button>

          {/* 5. Copy Formatted Invitation Text */}
          <button
            onClick={handleCopyFormattedText}
            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-[#FAF5EE] text-[#2B1117] border border-[#DDD4C4] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#832E41]/10 flex items-center justify-center shrink-0 text-[#832E41]">
                {copiedText ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-right">
                <p className="font-sans-ar text-xs font-bold text-[#2B1117]">
                  {copiedText ? 'تم نسخ نص الدعوة!' : 'نسخ نص الدعوة بالكامل'}
                </p>
                <p className="font-sans-ar text-[10px] text-[#7E3243]">
                  لنسخ النص ولصقه في أي تطبيق آخر
                </p>
              </div>
            </div>
            {copiedText ? (
              <span className="font-sans-ar text-xs text-green-600 font-bold">تم</span>
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#832E41]/70 shrink-0" />
            )}
          </button>

          {/* 6. Copy Only Link */}
          <button
            onClick={handleCopyOnlyLink}
            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-[#FAF5EE] text-[#2B1117] border border-[#DDD4C4] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#832E41]/10 flex items-center justify-center shrink-0 text-[#832E41]">
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <span className="text-xs">🔗</span>
                )}
              </div>
              <div className="text-right">
                <p className="font-sans-ar text-xs font-bold text-[#2B1117]">
                  {copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط الدعوة المخصص'}
                </p>
                <p className="font-sans-ar text-[10px] text-[#7E3243] truncate max-w-[200px]">
                  {targetLink}
                </p>
              </div>
            </div>
            {copiedLink ? (
              <span className="font-sans-ar text-xs text-green-600 font-bold">تم</span>
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#832E41]/70 shrink-0" />
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-2.5 pt-2 border-t border-[#E8DFC9] text-center">
          <p className="font-sans-ar text-[11px] text-[#7E3243]">
            💡 <strong>طريقة سريعة:</strong> اضغط <strong>«نسخ صورة البطاقة»</strong> ثم في محادثة الواتساب اضغط <strong>Ctrl + V</strong> للإرسال كصورة فوراً!
          </p>
        </div>
      </div>

      {/* Full Preview Lightbox Modal */}
      {showPreviewModal && cardPreviewUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-xl w-full bg-[#FAF8F5] rounded-3xl p-4 sm:p-6 border border-[#DFCBA0] shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-3 left-3 p-1.5 rounded-full bg-black/10 text-[#2B1117] hover:bg-black/20"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-sans-ar text-sm sm:text-base font-bold text-[#832E41] mb-3">
              {cardType === 'envelope'
                ? 'معاينة صورة المظروف الملكي والختم'
                : 'معاينة صورة بطاقة التفاصيل الفاخرة'}
            </h4>
            <div className="max-h-[68vh] overflow-auto rounded-2xl border border-[#DEC2C8] shadow-inner bg-black/5 flex items-center justify-center p-1">
              <img
                src={cardPreviewUrl}
                alt="بطاقة الدعوة"
                className="w-full h-auto rounded-xl max-h-[60vh] object-contain shadow-md"
              />
            </div>
            <div className="flex gap-2 w-full mt-4">
              <button
                onClick={handleDownloadImage}
                className="flex-1 py-3 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-white text-xs sm:text-sm font-bold font-sans-ar flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة (PNG)</span>
              </button>
              <button
                onClick={handleCopyImageToClipboard}
                className="flex-1 py-3 rounded-xl bg-white border border-[#DEC2C8] text-[#832E41] text-xs sm:text-sm font-bold font-sans-ar flex items-center justify-center gap-1.5 hover:bg-[#FAF2F4] cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>نسخ للحافظة (Ctrl+V)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
