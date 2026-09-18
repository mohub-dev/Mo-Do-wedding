import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Sparkles,
  Image as ImageIcon,
  Users,
  UserPlus,
  Trash2,
  Search,
  Download,
  ExternalLink,
  FileSpreadsheet,
} from 'lucide-react';
import { InvitationData } from '../types';
import { formatWhatsAppInvitation, openWhatsAppShare } from '../utils/whatsappShare';
import { createRoyalCardImage, copyImageToClipboard, downloadImageBlob } from '../utils/cardImageExport';
import { ShareOptionsModal } from './ShareOptionsModal';

export interface BatchGuest {
  id: string;
  name: string;
  phone?: string;
  sent: boolean;
  sentAt?: string;
  notes?: string;
}

interface GuestLinkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvitationData;
}

const STORAGE_KEY_GUESTS = 'wedding_batch_guest_list_v2';

export const GuestLinkGeneratorModal: React.FC<GuestLinkGeneratorModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'single'>('bulk');

  // Single mode state
  const [singleName, setSingleName] = useState<string>('');
  const [singlePhone, setSinglePhone] = useState<string>('');
  const [singleCopied, setSingleCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [selectedGuestForModal, setSelectedGuestForModal] = useState<string>('');

  // Bulk mode state
  const [bulkTextInput, setBulkTextInput] = useState<string>('');
  const [showBulkPasteArea, setShowBulkPasteArea] = useState<boolean>(false);
  const [guestList, setGuestList] = useState<BatchGuest[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyingImageId, setCopyingImageId] = useState<string | null>(null);
  const [copiedAllReport, setCopiedAllReport] = useState<boolean>(false);

  // New guest inline input in bulk table
  const [inlineName, setInlineName] = useState<string>('');
  const [inlinePhone, setInlinePhone] = useState<string>('');

  // Load guests from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuestList(parsed);
          return;
        }
      }
      // Initial default sample if empty
      setGuestList([
        { id: '1', name: 'م. رندا فضة', phone: '', sent: false },
        { id: '2', name: 'د. أحمد المحمود وعائلته', phone: '', sent: false },
        { id: '3', name: 'الأستاذ خالد العلي', phone: '', sent: false },
        { id: '4', name: 'الأهل والأصدقاء الأعزاء', phone: '', sent: false },
      ]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to LocalStorage whenever guest list changes
  useEffect(() => {
    try {
      if (guestList.length > 0) {
        localStorage.setItem(STORAGE_KEY_GUESTS, JSON.stringify(guestList));
      }
    } catch (e) {
      console.error(e);
    }
  }, [guestList]);

  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '';

  const getGuestLink = (name: string) => {
    return name.trim()
      ? `${currentOrigin}?guest=${encodeURIComponent(name.trim())}`
      : currentOrigin;
  };

  // Process Bulk Paste
  const handleProcessBulkPaste = () => {
    if (!bulkTextInput.trim()) return;

    const lines = bulkTextInput.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const newGuests: BatchGuest[] = [];

    lines.forEach((line) => {
      let name = line.trim();
      let phone = '';

      if (line.includes(',') || line.includes('\t') || line.includes(' - ') || line.includes(':')) {
        const parts = line.split(/,|\t| - |:/);
        if (parts.length >= 2) {
          const part1 = parts[0].trim();
          const part2 = parts[1].trim();
          if (/^[\d+\s-]+$/.test(part2)) {
            name = part1;
            phone = part2;
          } else if (/^[\d+\s-]+$/.test(part1)) {
            phone = part1;
            name = part2;
          } else {
            name = part1;
          }
        }
      }

      if (name) {
        newGuests.push({
          id: Date.now() + Math.random().toString(36).substring(2, 7),
          name,
          phone,
          sent: false,
        });
      }
    });

    if (newGuests.length > 0) {
      setGuestList((prev) => [...newGuests, ...prev]);
      setBulkTextInput('');
      setShowBulkPasteArea(false);
    }
  };

  // Add single inline guest
  const handleAddInlineGuest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inlineName.trim()) return;

    const newGuest: BatchGuest = {
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      name: inlineName.trim(),
      phone: inlinePhone.trim(),
      sent: false,
    };

    setGuestList((prev) => [newGuest, ...prev]);
    setInlineName('');
    setInlinePhone('');
  };

  // Toggle sent status
  const handleToggleSent = (id: string) => {
    setGuestList((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              sent: !g.sent,
              sentAt: !g.sent
                ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                : undefined,
            }
          : g
      )
    );
  };

  // Delete guest
  const handleDeleteGuest = (id: string) => {
    setGuestList((prev) => prev.filter((g) => g.id !== id));
  };

  // Clear all guests
  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الأسماء من القائمة؟')) {
      setGuestList([]);
      localStorage.removeItem(STORAGE_KEY_GUESTS);
    }
  };

  // Send single guest via WhatsApp & mark as sent
  const handleSendGuestWhatsApp = (guest: BatchGuest) => {
    const link = getGuestLink(guest.name);
    const message = formatWhatsAppInvitation(data, guest.name, link);
    openWhatsAppShare(message, guest.phone);

    // Auto mark as sent
    setGuestList((prev) =>
      prev.map((g) =>
        g.id === guest.id
          ? {
              ...g,
              sent: true,
              sentAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            }
          : g
      )
    );
  };

  // Copy individual guest link
  const handleCopyGuestLink = (guest: BatchGuest) => {
    const link = getGuestLink(guest.name);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy individual guest envelope image to clipboard (Ctrl+V)
  const handleCopyGuestImage = async (guest: BatchGuest) => {
    setCopyingImageId(guest.id);
    try {
      const { blob, dataUrl } = await createRoyalCardImage(data, guest.name, 'envelope');
      const success = await copyImageToClipboard(blob);
      if (!success) {
        downloadImageBlob(blob, dataUrl, `دعوة-${guest.name.replace(/\s+/g, '-')}.png`);
      }
      setCopiedId(`img-${guest.id}`);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setCopyingImageId(null);
    }
  };

  // Copy all links as formatted summary report
  const handleCopyAllReport = () => {
    if (guestList.length === 0) return;
    const lines = guestList.map(
      (g, index) =>
        `${index + 1}. ${g.name}${g.phone ? ` (${g.phone})` : ''} - [${g.sent ? 'تم الإرسال ✅' : 'قيد الانتظار ⏳'}]\nالرابط: ${getGuestLink(g.name)}`
    );
    const report = `📋 قائمة روابط دعوة زفاف ${data.groom} و ${data.bride}:\n\n` + lines.join('\n\n');
    navigator.clipboard.writeText(report);
    setCopiedAllReport(true);
    setTimeout(() => setCopiedAllReport(false), 3000);
  };

  // Download links list as CSV file
  const handleDownloadCsv = () => {
    if (guestList.length === 0) return;
    const headers = 'الاسم,الهاتف,الحالة,رابط الدعوة المخصص\n';
    const rows = guestList
      .map(
        (g) =>
          `"${g.name.replace(/"/g, '""')}","${g.phone || ''}","${g.sent ? 'تم الإرسال' : 'لم يرسل'}","${getGuestLink(g.name)}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `قائمة-مدعوين-زفاف-${data.groom}-${data.bride}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered guest list
  const filteredGuests = useMemo(() => {
    return guestList.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.phone && g.phone.includes(searchQuery));
      if (!matchesSearch) return false;
      if (statusFilter === 'pending') return !g.sent;
      if (statusFilter === 'sent') return g.sent;
      return true;
    });
  }, [guestList, searchQuery, statusFilter]);

  const sentCount = guestList.filter((g) => g.sent).length;
  const pendingCount = guestList.length - sentCount;
  const progressPercent = guestList.length > 0 ? Math.round((sentCount / guestList.length) * 100) : 0;

  if (!isOpen) return null;

  return (
    <>
      <div
        dir="rtl"
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs select-none animate-fade-in"
      >
        <div
          className="relative w-full max-w-2xl bg-[#FCFAF7] rounded-3xl border-2 border-[#DFCBA0] shadow-2xl p-4 sm:p-6 overflow-hidden text-right max-h-[94vh] flex flex-col"
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#832E41]/10 flex items-center justify-center text-[#832E41] shrink-0 border border-[#832E41]/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans-ar text-base sm:text-lg font-bold text-[#2B1117] flex items-center gap-2">
                <span>مساعد الإرسال السريع لعدة مدعوين عبر واتساب</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="font-sans-ar text-xs text-[#7E3243]">
                إنشاء وإرسال بطاقات مخصصة بالاسم لأي عدد من الضيوف بضغطة واحدة وتتبع حالة الإرسال
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-3 p-1 rounded-2xl bg-[#F0EAE1] border border-[#DFCBA0]/60">
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-3 rounded-xl font-sans-ar text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bulk'
                  ? 'bg-[#832E41] text-white shadow-sm'
                  : 'text-[#692131] hover:bg-[#FAF8F5]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>قائمة المدعوين والإرسال المتعدد ({guestList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`py-2 px-3 rounded-xl font-sans-ar text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-[#832E41] text-white shadow-sm'
                  : 'text-[#692131] hover:bg-[#FAF8F5]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>تخصيص سريع لضيف واحد</span>
            </button>
          </div>

          {/* TAB 1: BULK DISPATCHER */}
          {activeTab === 'bulk' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              {/* Progress & Summary Bar */}
              <div className="p-3 rounded-2xl bg-[#FAF5EE] border border-[#DFCBA0] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs font-sans-ar font-bold text-[#2B1117]">
                  <span className="text-[#832E41]">الإجمالي: {guestList.length}</span>
                  <span className="text-[#B89656]">•</span>
                  <span className="text-green-700">تم الإرسال: {sentCount} ✅</span>
                  <span className="text-[#B89656]">•</span>
                  <span className="text-amber-700">المتبقي: {pendingCount} ⏳</span>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-44 bg-gray-200 h-2 rounded-full overflow-hidden shrink-0">
                  <div
                    className="bg-[#25D366] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Quick actions top right */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBulkPasteArea(!showBulkPasteArea)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#DEC2C8] text-[#832E41] text-[11px] font-bold font-sans-ar hover:bg-[#FAF2F4] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>{showBulkPasteArea ? 'إخفاء مربع اللصق' : 'لصق قائمة أسماء جماعية'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAllReport}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#DFCBA0] text-[#55202C] text-[11px] font-bold font-sans-ar hover:bg-[#FAF5EE] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAllReport ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAllReport ? 'تم نسخ التقرير' : 'نسخ كل الروابط'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    title="تنزيل كملف Excel / CSV"
                    className="p-1.5 rounded-xl bg-white border border-[#DFCBA0] text-[#55202C] hover:bg-[#FAF5EE] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bulk Paste Area (Expandable) */}
              {showBulkPasteArea && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#DFCBA0] space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#832E41]">
                      ألصق قائمة الأسماء هنا (كل اسم في سطر):
                    </span>
                    <span className="text-[11px] text-[#7E3243]">
                      يمكن كتابة: "الاسم" أو "الاسم, رقم الهاتف"
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={bulkTextInput}
                    onChange={(e) => setBulkTextInput(e.target.value)}
                    placeholder={`م. رندا فضة\nد. أحمد المحمود وعائلته, 01012345678\nالأستاذ خالد العلي\nالأهل والأصدقاء`}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-sans-ar text-[#2B1117] focus:outline-none focus:border-[#832E41] leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkPasteArea(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-[#7E3243] hover:bg-[#FAF2F4]"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessBulkPaste}
                      className="px-4 py-1.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-white text-xs font-bold font-sans-ar shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>إضافة الأسماء إلى القائمة الآن</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Add Single Inline Form */}
              <form
                onSubmit={handleAddInlineGuest}
                className="flex items-center gap-2 p-2 rounded-2xl bg-[#FAF8F5] border border-[#DDD4C4]"
              >
                <input
                  type="text"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  placeholder="أضف اسماً جديداً للقائمة (مثال: د. ماجد السعيد)..."
                  className="flex-1 bg-transparent px-2 text-xs font-sans-ar text-[#2B1117] focus:outline-none placeholder:text-[#9E868E]"
                />
                <input
                  type="text"
                  value={inlinePhone}
                  onChange={(e) => setInlinePhone(e.target.value)}
                  placeholder="رقم الواتساب (اختياري)"
                  className="w-36 bg-white px-2.5 py-1.5 rounded-xl border border-[#DDD4C4] text-[11px] font-sans-ar text-[#2B1117] focus:outline-none ltr text-right"
                />
                <button
                  type="submit"
                  disabled={!inlineName.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-white text-xs font-bold font-sans-ar transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </form>

              {/* Search & Filter Toolbar */}
              <div className="flex items-center justify-between gap-2">
                {/* Search box */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7E3243]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في أسماء المدعوين أو الأرقام..."
                    className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-white border border-[#DDD4C4] text-xs font-sans-ar text-[#2B1117] focus:outline-none focus:border-[#832E41]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#7E3243]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter buttons */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#DDD4C4] shrink-0 text-[11px] font-bold font-sans-ar">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-[#832E41] text-white' : 'text-[#692131]'
                    }`}
                  >
                    الكل ({guestList.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-800'
                    }`}
                  >
                    المتبقي ({pendingCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('sent')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'sent' ? 'bg-green-600 text-white' : 'text-green-800'
                    }`}
                  >
                    تم ({sentCount})
                  </button>
                </div>
              </div>

              {/* Guest Cards Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                {filteredGuests.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#DFCBA0] text-[#7E3243]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-sans-ar text-xs font-bold">لا يوجد ضيوف مطابقين للبحث</p>
                    <p className="font-sans-ar text-[11px] text-[#9E868E] mt-1">
                      يمكنك لصق قائمة أسماء جديدة بالضغط على زر "لصق قائمة أسماء جماعية"
                    </p>
                  </div>
                ) : (
                  filteredGuests.map((guest) => {
                    const link = getGuestLink(guest.name);
                    const isCopied = copiedId === guest.id;
                    const isImageCopied = copiedId === `img-${guest.id}`;
                    const isCopyingImg = copyingImageId === guest.id;

                    return (
                      <div
                        key={guest.id}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          guest.sent
                            ? 'bg-[#F2FBF5] border-[#BCE5CB]'
                            : 'bg-white border-[#DDD4C4] hover:border-[#832E41]/50 shadow-xs'
                        }`}
                      >
                        {/* Guest info & Checkbox */}
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {/* Sent toggle checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleSent(guest.id)}
                            title={guest.sent ? 'تم الإرسال - اضغط لإلغاء التحديد' : 'اضغط للتحديد كمرسل'}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                              guest.sent
                                ? 'bg-[#25D366] border-[#25D366] text-white shadow-xs'
                                : 'border-[#DDD4C4] hover:border-[#832E41] text-transparent hover:text-gray-300'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-sans-ar text-xs sm:text-sm font-bold text-[#2B1117] truncate">
                                {guest.name}
                              </span>
                              {guest.sent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-green-100 text-green-800 font-bold shrink-0">
                                  تم الإرسال {guest.sentAt ? `(${guest.sentAt})` : '✅'}
                                </span>
                              )}
                            </div>
                            <p className="font-sans-ar text-[11px] text-[#7E3243] truncate dir-ltr text-right max-w-[280px]">
                              {guest.phone ? `📱 ${guest.phone} • ` : ''}
                              {link}
                            </p>
                          </div>
                        </div>

                        {/* Guest Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* 1. Send Direct WhatsApp (Primary Action) */}
                          <button
                            type="button"
                            onClick={() => handleSendGuestWhatsApp(guest)}
                            className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold font-sans-ar flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
                            title="إرسال عبر واتساب فوراً وتحديد كمرسل"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>إرسال واتساب</span>
                          </button>

                          {/* 2. Copy Image (Ctrl+V) */}
                          <button
                            type="button"
                            onClick={() => handleCopyGuestImage(guest)}
                            disabled={isCopyingImg}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-[#DFCBA0] text-[#832E41] hover:bg-[#FAF5EE] text-xs font-bold font-sans-ar flex items-center gap-1 transition-colors cursor-pointer"
                            title="نسخ صورة المظروف الملكي باسم هذا الضيف للصقها في واتساب (Ctrl+V)"
                          >
                            {isImageCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="hidden sm:inline text-green-600">تم نسخ الصورة</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-3.5 h-3.5 text-[#832E41]" />
                                <span className="hidden sm:inline">نسخ الصورة</span>
                              </>
                            )}
                          </button>

                          {/* 3. Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopyGuestLink(guest)}
                            className="p-1.5 rounded-xl bg-white border border-[#DDD4C4] text-[#55202C] hover:bg-[#FAF5EE] transition-colors cursor-pointer"
                            title="نسخ الرابط المخصص"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* 4. Open Share Options Modal for this guest */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGuestForModal(guest.name);
                              setIsShareModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-white border border-[#DDD4C4] text-[#832E41] hover:bg-[#FAF5EE] transition-colors cursor-pointer"
                            title="معاينة وتحميل بطاقة هذا الضيف"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. Delete from list */}
                          <button
                            type="button"
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="حذف من القائمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom footer in bulk tab */}
              <div className="pt-2 border-t border-[#E8DFC9] flex items-center justify-between text-xs text-[#7E3243]">
                <span>
                  💡 <strong>نصيحة سريعة:</strong> الضغط على <strong>«إرسال واتساب»</strong> يفتح المحادثة تلقائياً ويعلّم الضيف كـ <strong>«تم الإرسال ✅»</strong>.
                </span>
                {guestList.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:underline text-[11px] font-bold"
                  >
                    مسح القائمة
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE GUEST GENERATOR */}
          {activeTab === 'single' && (
            <div className="flex-1 overflow-y-auto space-y-4 pt-1">
              <div>
                <label className="block font-sans-ar text-xs font-bold text-[#55202C] mb-1.5">
                  اسم الضيف أو العائلة (كما ترغب أن يظهر على المظروف):
                </label>
                <input
                  type="text"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="مثال: سعادة المستشار أحمد فؤاد، م. رندا فضة، خالي العزيز أبو محمد..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#DDD5C5] text-[#222A1E] placeholder:text-[#A0A99C] focus:outline-none focus:ring-2 focus:ring-[#832E41]/50 font-sans-ar text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-sans-ar text-xs font-bold text-[#55202C] mb-1.5">
                  رقم هاتف الواتساب (اختياري لفتح المحادثة فوراً):
                </label>
                <input
                  type="text"
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="مثال: +201012345678 أو 01012345678"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#DDD5C5] text-[#222A1E] placeholder:text-[#A0A99C] focus:outline-none focus:ring-2 focus:ring-[#832E41]/50 font-sans-ar text-sm dir-ltr text-right"
                />
              </div>

              {/* Preset quick names */}
              <div>
                <span className="block text-[11px] text-[#7E3243] mb-1 font-bold">
                  تسميات شائعة سريعة:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['العائلة الكريمة', 'الأصدقاء الأعزاء', 'الأهل والأحباب', 'الزملاء الأعزاء'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSingleName(tag)}
                      className="px-2.5 py-1 rounded-full bg-[#F2EDE1] hover:bg-[#E7E0D2] text-[#44513E] text-xs font-sans-ar border border-[#DDD5C5] transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Link Preview */}
              <div>
                <label className="block font-sans-ar text-xs font-bold text-[#55202C] mb-1.5">
                  الرابط المخصص المباشر:
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-[#DDD5C5]">
                  <input
                    type="text"
                    readOnly
                    value={getGuestLink(singleName)}
                    className="w-full bg-transparent font-sans-ar text-xs text-[#5D6F57] focus:outline-none select-all truncate ltr text-right"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getGuestLink(singleName));
                      setSingleCopied(true);
                      setTimeout(() => setSingleCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#832E41] text-white text-xs font-sans-ar font-bold hover:bg-[#6E2233] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {singleCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    const link = getGuestLink(singleName);
                    const msg = formatWhatsAppInvitation(data, singleName, link);
                    openWhatsAppShare(msg, singlePhone);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-sans-ar font-bold shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال دعوة واتساب مباشرة</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedGuestForModal(singleName);
                    setIsShareModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#DFCBA0] hover:bg-[#F7F4EC] text-[#832E41] text-sm font-sans-ar font-bold transition-all cursor-pointer shadow-xs"
                >
                  <ImageIcon className="w-4 h-4 text-[#832E41]" />
                  <span>معاينة وتحميل صورة المظروف</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Options / Card Image Preview Modal */}
      {isShareModalOpen && (
        <ShareOptionsModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={data}
          guestName={selectedGuestForModal || singleName}
          customUrl={getGuestLink(selectedGuestForModal || singleName)}
        />
      )}
    </>
  );
};
