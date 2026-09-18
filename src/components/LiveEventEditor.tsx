import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Sparkles,
  Calendar,
  MapPin,
  Heart,
  Clock,
  Music,
  Utensils,
  Camera,
  CheckCircle2,
  Plus,
  Trash2,
  Phone,
  BookOpen,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useWeddingData } from '../context/WeddingDataContext';
import { InvitationData, TimelineEventItem, INVITATION_DATA } from '../types';

interface LiveEventEditorProps {
  onPreviewInvitation?: () => void;
}

export const LiveEventEditor: React.FC<LiveEventEditorProps> = ({ onPreviewInvitation }) => {
  const { invitationData, updateInvitationData, resetInvitationData } = useWeddingData();

  // Local form state for smooth editing before committing
  const [formData, setFormData] = useState<InvitationData>(invitationData);
  const [saveSuccessAlert, setSaveSuccessAlert] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'basics' | 'datetime' | 'location' | 'texts' | 'etiquette' | 'timeline'>('basics');

  // Handle single field change
  const handleChange = (key: keyof InvitationData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-update namesDisplay if groom or bride changes, unless custom
      if (key === 'groom' || key === 'bride') {
        const groom = key === 'groom' ? value : prev.groom;
        const bride = key === 'bride' ? value : prev.bride;
        updated.namesDisplay = `${groom} و ${bride}`;
      }
      return updated;
    });
  };

  // Handle Wedding Date & Time ISO Picker change (updates timestamp as well)
  const handleDateTimeISOChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const dateObj = new Date(val);
    if (!isNaN(dateObj.getTime())) {
      setFormData((prev) => ({
        ...prev,
        weddingDateTimeISO: val,
        weddingTimestamp: dateObj.getTime(),
      }));
    }
  };

  // Timeline Events management
  const handleTimelineChange = (index: number, field: keyof TimelineEventItem, value: any) => {
    setFormData((prev) => {
      const updatedEvents = [...prev.timelineEvents];
      updatedEvents[index] = {
        ...updatedEvents[index],
        [field]: value,
      };
      return { ...prev, timelineEvents: updatedEvents };
    });
  };

  const handleAddTimelineEvent = () => {
    const newEvent: TimelineEventItem = {
      id: `tl-custom-${Date.now()}`,
      time: '12:00 ص',
      title: 'فقرة جديدة',
      description: 'وصف مختصر لهذه الفقرة',
      iconType: 'sparkles',
    };
    setFormData((prev) => ({
      ...prev,
      timelineEvents: [...prev.timelineEvents, newEvent],
    }));
  };

  const handleDeleteTimelineEvent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timelineEvents: prev.timelineEvents.filter((_, i) => i !== index),
    }));
  };

  // Submit and save to global context & localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvitationData(formData);
    setSaveSuccessAlert('تم حفظ وتطبيق التعديلات بنجاح! تظهر الآن مباشرة في كامل بطاقة الدعوة والمظروف ✨');
    setTimeout(() => {
      setSaveSuccessAlert(null);
    }, 4500);
  };

  // Reset to original defaults
  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من استعادة كافة بيانات الحفل الأصلية والافتراضية؟')) {
      resetInvitationData();
      setFormData(INVITATION_DATA);
      setSaveSuccessAlert('تمت استعادة البيانات الافتراضية بنجاح 🔄');
      setTimeout(() => {
        setSaveSuccessAlert(null);
      }, 4000);
    }
  };

  const subTabs = [
    { id: 'basics', label: 'العروسان والمناسبة', icon: Heart },
    { id: 'datetime', label: 'الموعد والعداد', icon: Calendar },
    { id: 'location', label: 'المكان والخريطة', icon: MapPin },
    { id: 'texts', label: 'الآيات والعبارات', icon: BookOpen },
    { id: 'etiquette', label: 'الإرشادات والتفاصيل', icon: Info },
    { id: 'timeline', label: 'الجدول الزمني', icon: Clock },
  ] as const;

  return (
    <div id="live-event-editor-container" className="space-y-6">
      {/* Header with Save Action Bar */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCECEF] text-[#832E41] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C4AA7E]" />
            <span>محرر بيانات الحفل المباشر • Live Event Editor</span>
          </div>
          <h2 className="font-sans-ar text-xl sm:text-2xl font-bold text-[#2B1117]">
            تعديل نصوص وبيانات الدعوة مباشرة
          </h2>
          <p className="text-xs sm:text-sm text-[#7E3243] mt-0.5">
            عدّل أي نص أو تاريخ أو موقع، وستنعكس التغييرات فوراً على الدعوة والمظروف دون تعديل الكود.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF5F6] hover:bg-[#F5E6E8] text-[#832E41] text-xs font-semibold border border-[#EAD2D8] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4 text-[#DEC496]" />
            <span>حفظ التعديلات مباشرة</span>
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {saveSuccessAlert && (
        <div className="p-4 rounded-2xl bg-[#EDF7ED] border border-[#C8E6C9] text-[#1B5E20] flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{saveSuccessAlert}</span>
          </div>
          {onPreviewInvitation && (
            <button
              onClick={onPreviewInvitation}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1B5E20] underline hover:text-[#0D3812] shrink-0"
            >
              <span>معاينة النتيجة الآن</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#832E41] text-white shadow-sm'
                  : 'bg-white text-[#5E2330] hover:bg-[#FAF4F6] border border-[#E6DCCE]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#DEC496]' : 'text-[#832E41]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Fields Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. العروسان والمناسبة */}
        {activeSubTab === 'basics' && (
          <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFE8DC]">
              <Heart className="w-5 h-5 text-[#832E41]" />
              <h3 className="font-sans-ar text-lg font-bold text-[#2B1117]">
                بيانات العروسين والمناسبة
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  اسم العريس
                </label>
                <input
                  type="text"
                  value={formData.groom}
                  onChange={(e) => handleChange('groom', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: محمد"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  اسم العروس
                </label>
                <input
                  type="text"
                  value={formData.bride}
                  onChange={(e) => handleChange('bride', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: دنيا"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  صيغة عرض الأسماء (الختم والعنوان الرئيسي)
                </label>
                <input
                  type="text"
                  value={formData.namesDisplay}
                  onChange={(e) => handleChange('namesDisplay', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: محمد و دنيا"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  عنوان المناسبة
                </label>
                <input
                  type="text"
                  value={formData.occasion}
                  onChange={(e) => handleChange('occasion', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: حفل زفاف / عقد قران / حفل خطوبة"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. الموعد والتوقيت والعد التنازلي */}
        {activeSubTab === 'datetime' && (
          <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFE8DC]">
              <Calendar className="w-5 h-5 text-[#832E41]" />
              <h3 className="font-sans-ar text-lg font-bold text-[#2B1117]">
                الموعد والتوقيت والعد التنازلي
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  تاريخ الحفل كتابة
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: 5 نوفمبر 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  يوم الأسبوع
                </label>
                <input
                  type="text"
                  value={formData.day}
                  onChange={(e) => handleChange('day', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: الخميس"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  وقت بدء الحفل
                </label>
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: 8:00 مساءً"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  وقت ختام الحفل
                </label>
                <input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: 12:00 مساءً"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5 p-4 rounded-2xl bg-[#FAF5EB] border border-[#E9DCBF]">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-[#634E26] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#8A713F]" />
                    <span>توقيت العد التنازلي التلقائي (التاريخ والوقت الرقمي الدقيق)</span>
                  </label>
                  <span className="text-[11px] text-[#8A713F]">
                    يضبط عداد الثواني والدقائق بدقة
                  </span>
                </div>
                <input
                  type="datetime-local"
                  value={formData.weddingDateTimeISO || '2026-11-05T20:00'}
                  onChange={handleDateTimeISOChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C7A5] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. المكان والعنوان وخريطة الموقع */}
        {activeSubTab === 'location' && (
          <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFE8DC]">
              <MapPin className="w-5 h-5 text-[#832E41]" />
              <h3 className="font-sans-ar text-lg font-bold text-[#2B1117]">
                مكان الحفل وموقع الخريطة
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  اسم القاعة أو المكان
                </label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => handleChange('venueName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: قاعة لاجوي"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  العنوان بالتفصيل (يظهر تحت اسم القاعة وفي الخريطة)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7] leading-relaxed"
                  placeholder="مثال: محرم بيك، محور المحمودية بجوار كوبري مشاه راغب"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  رابط خرائط Google المباشر (GPS Link)
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7] font-mono text-xs"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. الآيات والافتتاحيات والعبارات */}
        {activeSubTab === 'texts' && (
          <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFE8DC]">
              <BookOpen className="w-5 h-5 text-[#832E41]" />
              <h3 className="font-sans-ar text-lg font-bold text-[#2B1117]">
                الآيات القرآنية وديباجة الدعوة والعبارات
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  الآية القرآنية الكريمة في صدر البطاقة
                </label>
                <textarea
                  rows={2}
                  value={formData.quranVerseText}
                  onChange={(e) => handleChange('quranVerseText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7] leading-relaxed font-amiri"
                  placeholder="«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا...»"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  ديباجة التشريف والترحيب
                </label>
                <input
                  type="text"
                  value={formData.honorStatement}
                  onChange={(e) => handleChange('honorStatement', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: يتشرف أهل العروسين بدعوتكم لمشاركتهم فرحة"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  الآية أو العبارة الختامية (تظهر أسفل المظروف وفي ختام البطاقة)
                </label>
                <input
                  type="text"
                  value={formData.finalPhrase}
                  onChange={(e) => {
                    handleChange('finalPhrase', e.target.value);
                    handleChange('closingQuote', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. إرشادات وتفاصيل الحفل والتواصل */}
        {activeSubTab === 'etiquette' && (
          <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EFE8DC]">
              <Info className="w-5 h-5 text-[#832E41]" />
              <h3 className="font-sans-ar text-lg font-bold text-[#2B1117]">
                إرشادات الحفل ورقم استقبال التأكيدات
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  الزي المقترح (Dress Code)
                </label>
                <input
                  type="text"
                  value={formData.dressCode}
                  onChange={(e) => handleChange('dressCode', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: رسمي وأنيق يليق بفخامة الحفل"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  سياسة حضور الأطفال
                </label>
                <input
                  type="text"
                  value={formData.childrenPolicy}
                  onChange={(e) => handleChange('childrenPolicy', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: نعتذر عن استقبال الأطفال لراحتكم وسهرتكم"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117]">
                  تفاصيل صف السيارات (Parking)
                </label>
                <input
                  type="text"
                  value={formData.parkingPolicy}
                  onChange={(e) => handleChange('parkingPolicy', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7]"
                  placeholder="مثال: تتوفر أماكن مخصصة وخدمة صف سيارات أمام القاعة"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#2B1117] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#832E41]" />
                  <span>رقم الواتساب لاستقبال تأكيدات الحضور</span>
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B3] focus:border-[#832E41] focus:ring-2 focus:ring-[#832E41]/20 outline-none text-sm bg-[#FCFAF7] font-mono text-xs"
                  placeholder="مثال: 201000000000 (مع مفتاح الدولة)"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. الجدول الزمني لفقرات الحفل */}
        {activeSubTab === 'timeline' && (
          <div className="p-5 sm:p-7 bg-white rounded-3xl border border-[#E4DCCF] shadow-xs space-y-5 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE8DC]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#832E41]" />
                <h3 className="font-sans-ar text-lg font-bold text-[#2B1117]">
                  الجدول الزمني لفقرات الحفل (Event Itinerary)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddTimelineEvent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#832E41]/10 hover:bg-[#832E41]/20 text-[#832E41] text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فقرة جديدة</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.timelineEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E5DEC9] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#832E41] px-2.5 py-0.5 rounded-full bg-[#FCECEF]">
                      فقرة #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteTimelineEvent(index)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="حذف هذه الفقرة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2B1117]">
                        توقيت الفقرة
                      </label>
                      <input
                        type="text"
                        value={event.time}
                        onChange={(e) => handleTimelineChange(index, 'time', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5C9B3] text-xs bg-white"
                        placeholder="مثال: 8:00 م"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#2B1117]">
                        عنوان الفقرة
                      </label>
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => handleTimelineChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5C9B3] text-xs bg-white"
                        placeholder="مثال: الزفة الملكية ودخول العروسين"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#2B1117]">
                        وصف الفقرة
                      </label>
                      <input
                        type="text"
                        value={event.description}
                        onChange={(e) => handleTimelineChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5C9B3] text-xs bg-white"
                        placeholder="مثال: لحظة الدخول المنتظرة وتألق العروسين..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2B1117]">
                        نوع الأيقونة
                      </label>
                      <select
                        value={event.iconType}
                        onChange={(e) => handleTimelineChange(index, 'iconType', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5C9B3] text-xs bg-white"
                      >
                        <option value="sparkles">✨ بريق ونجوم (Sparkles)</option>
                        <option value="music">🎵 موسيقى وزفة (Music)</option>
                        <option value="utensils">🍽️ عشاء وبوفيه (Dining)</option>
                        <option value="heart">❤️ حب وتورتة (Heart)</option>
                        <option value="camera">📷 تصوير (Camera)</option>
                        <option value="clock">⏰ ساعة وتوقيت (Clock)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Floating/Sticky Save Button Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5F2] border border-[#DFCBA0] flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#7E3243]">
            <Sparkles className="w-4 h-4 text-[#DEC496]" />
            <span>يتم تطبيق أي تعديل وحفظه تلقائياً في التخزين المحلي المتصل بالدعوة.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#832E41] hover:bg-white transition-colors"
            >
              استعادة الافتراضي
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4 text-[#DEC496]" />
              <span>حفظ التعديلات فوراً</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
