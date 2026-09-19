import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Heart,
  Sparkles,
  Copy,
  Check,
  Send,
  Trash2,
  Search,
  Download,
  Lock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  X,
  CheckCircle2,
  Edit3,
  Link,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { InvitationData, RSVPRecord } from '../types';
import { useWeddingData } from '../context/WeddingDataContext';
import { LiveEventEditor } from './LiveEventEditor';
import { formatWhatsAppInvitation, openWhatsAppShare } from '../utils/whatsappShare';
import { ShareOptionsModal } from './ShareOptionsModal';
import { GuestLinkGeneratorModal } from './GuestLinkGeneratorModal';

interface AdminDashboardProps {
  data: InvitationData;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onExitAdmin }) => {
  const {
    invitationData,
    rsvps,
    guestbookMessages,
    saveRSVP,
    deleteRSVP,
    deleteGuestbookMessage,
    exportRSVPsCSV,
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
  } = useWeddingData();

  // Admin Login State
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const result = await adminLogin(adminPassword);
    setIsLoggingIn(false);
    if (!result.success) {
      setLoginError(result.error || 'كلمة المرور غير صحيحة');
    }
  };

  // Active Main Admin Section Tab
  const [activeTab, setActiveTab] = useState<'editor' | 'rsvps' | 'links' | 'guestbook'>('editor');

  // Guest Link Generator State
  const [targetGuestName, setTargetGuestName] = useState<string>('');
  const [copiedGuestLink, setCopiedGuestLink] = useState<boolean>(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);

  // Search & Filter for RSVPs
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<'attending' | 'declined'>('attending');
  const [manualCompanions, setManualCompanions] = useState<number>(1);
  const [manualNote, setManualNote] = useState<string>('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Secret Admin URL
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const adminSecretUrl = `${origin}?admin=true`;

  const handleCopyAdminUrl = () => {
    navigator.clipboard.writeText(adminSecretUrl);
    setCopiedAdminLink(true);
    setTimeout(() => setCopiedAdminLink(false), 2500);
  };

  // Guest link computation
  const currentData = invitationData || data;
  const generatedGuestLink = targetGuestName.trim()
    ? `${origin}?guest=${encodeURIComponent(targetGuestName.trim())}`
    : origin;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(generatedGuestLink);
    setCopiedGuestLink(true);
    setTimeout(() => setCopiedGuestLink(false), 2500);
  };

  const handleShareGuestWhatsApp = () => {
    const trimmed = targetGuestName.trim();
    const message = formatWhatsAppInvitation(currentData, trimmed, generatedGuestLink);
    openWhatsAppShare(message);
  };

  // Add Manual Record Handler
  const handleAddManualRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newRecord: RSVPRecord = {
      id: Date.now().toString(),
      guestName: manualName.trim(),
      status: manualStatus,
      companionCount: manualStatus === 'attending' ? manualCompanions : 0,
      note: manualNote.trim(),
      submittedAt: new Date().toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const ok = await saveRSVP(newRecord);
    if (ok) {
      setManualName('');
      setManualNote('');
      setManualCompanions(1);
      setShowAddModal(false);
      setNotificationMsg(`تمت إضافة ${newRecord.guestName} بنجاح إلى قاعدة البيانات ✨`);
    } else {
      setNotificationMsg('تعذر حفظ السجل على الخادم. يرجى المحاولة لاحقًا.');
    }
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Metrics Calculations
  const attendingList = rsvps.filter((r) => r.status === 'attending');
  const declinedList = rsvps.filter((r) => r.status === 'declined');
  const totalConfirmedAttendees = attendingList.reduce(
    (acc, curr) => acc + (curr.companionCount || 1),
    0
  );
  const totalCompanions = attendingList.reduce(
    (acc, curr) => acc + Math.max(0, (curr.companionCount || 1) - 1),
    0
  );

  // Filtered RSVPs
  const filteredRSVPs = rsvps.filter((r) => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.note && r.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdminAuthenticated) {
    return (
      <main
        id="admin-login-screen"
        dir="rtl"
        className="min-h-screen w-full bg-[#F8F5F2] text-[#2B1117] font-sans-ar flex items-center justify-center p-4 selection:bg-[#832E41] selection:text-white"
      >
        <div className="relative w-full max-w-md bg-[#FCFAF7] rounded-3xl p-6 sm:p-8 border-2 border-[#DFCBA0] shadow-[0_16px_48px_rgba(45,11,20,0.08)] text-center overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#832E41] text-[#FAF8F5] flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock className="w-7 h-7 text-[#DEC496]" />
          </div>

          <h2 className="font-sans-ar text-2xl font-bold text-[#2B1117] mb-1">
            تسجيل دخول المشرف
          </h2>
          <p className="font-sans-ar text-xs sm:text-sm text-[#7E3243] mb-6">
            لوحة الإدارة محمية برمز سري. أدخل كلمة المرور للمتابعة.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-right">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-sans-ar text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block font-sans-ar text-xs font-semibold text-[#5E2330] mb-1.5">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDD5C5] text-[#2B1117] placeholder:text-[#B59199] focus:outline-none focus:ring-2 focus:ring-[#832E41]/40 font-sans-ar text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!adminPassword || isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-white font-sans-ar text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? <span>جاري التحقق...</span> : <span>دخول لوحة الإدارة</span>}
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full text-center text-xs font-sans-ar text-[#832E41] hover:underline pt-2 cursor-pointer"
            >
              العودة إلى بطاقة الدعوة
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main
      id="private-admin-dashboard"
      dir="rtl"
      className="min-h-screen bg-[#F8F5F2] text-[#2B1117] font-sans-ar selection:bg-[#832E41] selection:text-white pb-16 pt-4 sm:pt-8 px-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Navigation & Status Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 bg-[#FCFAF7] rounded-3xl border border-[#E4DCCF] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#832E41] text-[#FAF8F5] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#DEC496]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCECEF] text-[#832E41] text-xs font-semibold">
                  <Lock className="w-3 h-3" /> لوحة تحكم الإدارة
                </span>
                <span className="text-xs text-[#8C4A5A]">
                  {currentData.occasion} • {currentData.groom} و {currentData.bride}
                </span>
              </div>
              <h1 className="font-sans-ar text-xl sm:text-2xl font-bold text-[#2B1117] mt-0.5">
                لوحة تحكم وإدارة الحفل الشاملة
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Direct Open Bulk Dispatcher */}
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
              title="فتح مساعد الإرسال السريع لعدة مدعوين عبر واتساب"
            >
              <Users className="w-4 h-4" />
              <span>مدير الإرسال السريع (WhatsApp)</span>
            </button>

            {/* View Public Invitation Page */}
            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F9F5F6] text-[#4A1B25] border border-[#ECDCD6] text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
            >
              <span>معاينة الدعوة</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={adminLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
              title="تسجيل الخروج من لوحة الإدارة"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Secret URL Box */}
        <section
          id="secret-admin-link-card"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#832E41]/10 via-[#FAF7F2] to-[#DEC496]/20 border border-[#D5C9B3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2B1117]">
              <Lock className="w-4 h-4 text-[#832E41]" />
              <span>رابط الإدارة السري المباشر (احفظه للوصول إلى هذه اللوحة في أي وقت):</span>
            </div>
            <p className="text-xs text-[#7E3243] font-mono break-all dir-ltr text-right">
              {adminSecretUrl}
            </p>
          </div>

          <button
            onClick={handleCopyAdminUrl}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] text-xs sm:text-sm font-medium transition-colors shadow-xs whitespace-nowrap"
          >
            {copiedAdminLink ? (
              <>
                <Check className="w-4 h-4 text-[#DEC496]" />
                <span>تم نسخ الرابط السري</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ الرابط السري</span>
              </>
            )}
          </button>
        </section>

        {/* Notification Alert if any */}
        {notificationMsg && (
          <div className="p-3.5 rounded-2xl bg-[#FAF0F2] text-[#832E41] text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in border border-[#ECD1D8]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#832E41]" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Primary Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('editor')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'editor'
                ? 'bg-[#832E41] text-white shadow-md'
                : 'bg-white text-[#5E2330] hover:bg-[#FAF4F6] border border-[#E6DCCE]'
            }`}
          >
            <Edit3 className={`w-4 h-4 ${activeTab === 'editor' ? 'text-[#DEC496]' : 'text-[#832E41]'}`} />
            <span>محرر بيانات الحفل المباشر (Live Editor)</span>
          </button>

          <button
            onClick={() => setActiveTab('rsvps')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'rsvps'
                ? 'bg-[#832E41] text-white shadow-md'
                : 'bg-white text-[#5E2330] hover:bg-[#FAF4F6] border border-[#E6DCCE]'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'rsvps' ? 'text-[#DEC496]' : 'text-[#832E41]'}`} />
            <span>سجل الحضور والمدعوين ({rsvps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'links'
                ? 'bg-[#832E41] text-white shadow-md'
                : 'bg-white text-[#5E2330] hover:bg-[#FAF4F6] border border-[#E6DCCE]'
            }`}
          >
            <Link className={`w-4 h-4 ${activeTab === 'links' ? 'text-[#DEC496]' : 'text-[#832E41]'}`} />
            <span>توليد روابط الضيوف المخصصة (VIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('guestbook')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'guestbook'
                ? 'bg-[#832E41] text-white shadow-md'
                : 'bg-white text-[#5E2330] hover:bg-[#FAF4F6] border border-[#E6DCCE]'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'guestbook' ? 'text-[#DEC496]' : 'text-[#832E41]'}`} />
            <span>سجل التهاني والمباركات ({guestbookMessages.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Event Editor */}
        {activeTab === 'editor' && (
          <LiveEventEditor onPreviewInvitation={onExitAdmin} />
        )}

        {/* Tab 2: RSVP Management */}
        {activeTab === 'rsvps' && (
          <div className="space-y-6 animate-fade-in">
            {/* Key Metrics Overview Cards */}
            <section id="metrics-overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Confirmed Attendees */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DECF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#832E41] mb-2">
                  <span className="text-xs font-medium">إجمالي الحضور المؤكد</span>
                  <div className="w-8 h-8 rounded-full bg-[#FCECEF] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#832E41]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans-ar text-2xl sm:text-3xl font-bold text-[#2B1117]">
                    {totalConfirmedAttendees}
                  </span>
                  <span className="text-xs text-[#7E3243]">شخص</span>
                </div>
                <p className="text-[11px] text-[#8C4A5A] mt-1">
                  {attendingList.length} ضيف + {totalCompanions} مرافق
                </p>
              </div>

              {/* Total Responses */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DECF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#832E41] mb-2">
                  <span className="text-xs font-medium">إجمالي الردود المسجلة</span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EB] flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-[#832E41]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans-ar text-2xl sm:text-3xl font-bold text-[#2B1117]">
                    {rsvps.length}
                  </span>
                  <span className="text-xs text-[#7E3243]">رد</span>
                </div>
                <p className="text-[11px] text-[#8C4A5A] mt-1">
                  محدث ومحفوظ فوراً
                </p>
              </div>

              {/* Declined Responses */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DECF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8E5B4B] mb-2">
                  <span className="text-xs font-medium">المعتذرون</span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF0ED] flex items-center justify-center">
                    <UserX className="w-4 h-4 text-[#8E5B4B]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans-ar text-2xl sm:text-3xl font-bold text-[#352520]">
                    {declinedList.length}
                  </span>
                  <span className="text-xs text-[#8A7973]">شخص</span>
                </div>
                <p className="text-[11px] text-[#8A7973] mt-1">
                  أرسلوا اعتذاراً لطيفاً
                </p>
              </div>

              {/* Guestbook Messages */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DECF] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#B38D4C] mb-2">
                  <span className="text-xs font-medium">رسائل التهاني والمباركات</span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EB] flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#B38D4C]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans-ar text-2xl sm:text-3xl font-bold text-[#2E281F]">
                    {guestbookMessages.length}
                  </span>
                  <span className="text-xs text-[#8B806E]">تهنئة</span>
                </div>
                <p className="text-[11px] text-[#8B806E] mt-1">
                  مسجلة في سجل الشرف
                </p>
              </div>
            </section>

            {/* Registered Guests Table */}
            <section
              id="rsvps-management-section"
              className="p-5 sm:p-7 rounded-3xl bg-[#FCFAF7] border border-[#DEC496] shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3D3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117]">
                      سجل وقائمة تأكيدات الحضور
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FCECEF] text-[#832E41] text-xs font-bold">
                      {rsvps.length} مسجل
                    </span>
                  </div>
                  <p className="text-xs text-[#7E3243] mt-0.5">
                    تصفح جميع من أكدوا حضورهم أو اعتذروا مع تفاصيل المرافقين والملاحظات
                  </p>
                </div>

                {/* Actions: Add Manual & Export CSV */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-[#FAF8F5] text-xs font-semibold transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#DEC496]" />
                    <span>إضافة ضيف يدوياً</span>
                  </button>

                  <button
                    onClick={exportRSVPsCSV}
                    disabled={rsvps.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF4F6] text-[#4A1B25] border border-[#E8D4DA] text-xs font-medium transition-colors shadow-xs disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5 text-[#832E41]" />
                    <span>تصدير Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Controls: Search and Status Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#A67E88] absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث بالاسم أو الملاحظة..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-[#DCD3C4] text-xs focus:outline-none focus:border-[#832E41]"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-[#832E41] text-white shadow-xs'
                        : 'bg-white text-[#7E3243] border border-[#DDD4C4] hover:bg-[#FAF4F6]'
                    }`}
                  >
                    الكل ({rsvps.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('attending')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'attending'
                        ? 'bg-[#832E41] text-white shadow-xs'
                        : 'bg-white text-[#832E41] border border-[#DDD4C4] hover:bg-[#FAF4F6]'
                    }`}
                  >
                    الحاضرون ({attendingList.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('declined')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'declined'
                        ? 'bg-[#8E5B4B] text-white shadow-xs'
                        : 'bg-white text-[#8E5B4B] border border-[#DDD4C4] hover:bg-[#FAF4F6]'
                    }`}
                  >
                    المعتذرون ({declinedList.length})
                  </button>
                </div>
              </div>

              {/* RSVP List Table */}
              <div className="border border-[#E4DCCF] rounded-2xl bg-white overflow-hidden shadow-xs">
                {filteredRSVPs.length === 0 ? (
                  <div className="py-12 text-center text-[#8C4A5A] text-xs space-y-1">
                    <Users className="w-8 h-8 text-[#D8C4CA] mx-auto mb-2" />
                    <p className="font-semibold text-[#2B1117]">لا توجد ردود تطابق البحث الحالي</p>
                    <p className="text-[11px] text-[#A67E88]">الردود المسجلة من الضيوف ستظهر هنا تلقائياً</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#FAF7F2] text-[#4A1B25] font-semibold border-b border-[#E7DFD2]">
                        <tr>
                          <th className="py-3 px-4">اسم الضيف</th>
                          <th className="py-3 px-4">الحالة</th>
                          <th className="py-3 px-4">إجمالي العدد</th>
                          <th className="py-3 px-4">الملاحظات / التهاني</th>
                          <th className="py-3 px-4">تاريخ التسجيل</th>
                          <th className="py-3 px-4 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE9DD]">
                        {filteredRSVPs.map((record) => (
                          <tr key={record.id} className="hover:bg-[#FCFAF7] transition-colors">
                            <td className="py-3 px-4 font-bold text-[#2B1117]">
                              {record.guestName}
                            </td>
                            <td className="py-3 px-4">
                              {record.status === 'attending' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCECEF] text-[#832E41] font-semibold text-[11px]">
                                  <CheckCircle2 className="w-3 h-3" /> حاضر
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5ECE8] text-[#7A564A] font-semibold text-[11px]">
                                  معتذر
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#4A1B25]">
                              {record.status === 'attending'
                                ? `${record.companionCount || 1} أشخاص`
                                : '-'}
                            </td>
                            <td className="py-3 px-4 text-[#5E2330] max-w-xs truncate" title={record.note}>
                              {record.note || <span className="text-[#BCA3AA]">-</span>}
                            </td>
                            <td className="py-3 px-4 text-[#8C4A5A] whitespace-nowrap text-[11px]">
                              {record.submittedAt}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف رد "${record.guestName}"؟`)) {
                                    deleteRSVP(record.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-[#A5685B] hover:bg-[#FBEAE7] transition-colors"
                                title="حذف هذا الرد"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Tab 3: VIP Link Generator */}
        {activeTab === 'links' && (
          <div className="space-y-4 animate-fade-in">
            {/* Bulk Multi-Guest Dispatcher Promo Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#832E41] to-[#551A27] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-[#4A1723] text-xs font-bold">
                    جديد • ميزة مميزة
                  </span>
                  <h3 className="font-sans-ar text-base sm:text-lg font-bold">
                    مساعد الإرسال السريع الجماعي لعدة ضيوف
                  </h3>
                </div>
                <p className="font-sans-ar text-xs text-[#F2D6DE] max-w-xl">
                  هل لديك قائمة أسماء طويلة؟ يمكنك لصقها دفعة واحدة وإرسال الدعوات المخصصة على واتساب بضغطة واحدة مع تتبع من استلم ومن ينتظر!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-sans-ar text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>فتح مدير الإرسال المتعدد الآن</span>
              </button>
            </div>

            <section
              id="custom-guest-link-card"
              className="p-5 sm:p-7 rounded-3xl bg-[#FCFAF7] border border-[#DEC496] shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#EBE3D3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#832E41]/10 text-[#832E41] flex items-center justify-center shadow-xs">
                    <Sparkles className="w-6 h-6 text-[#DEC496]" />
                  </div>
                  <div>
                    <h2 className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117]">
                      تخصيص رابط دعوة سريع لضيف مفرد
                    </h2>
                    <p className="text-xs text-[#7E3243] mt-0.5">
                      أنشئ رابطاً خاصاً باسم الضيف ليرى اسمه يزين المظروف وبطاقة الدعوة بلمسة ملوكية
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DEC2C8] text-[#832E41] hover:bg-[#FAF2F4] text-xs font-bold font-sans-ar flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>إرسال لقائمة متعددة</span>
                </button>
              </div>

            <div className="space-y-3">
              <div>
                <label className="block font-sans-ar text-xs font-medium text-[#5E2330] mb-1.5">
                  اسم الضيف الكريم (كما ترغب أن يظهر في الدعوة):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={targetGuestName}
                    onChange={(e) => setTargetGuestName(e.target.value)}
                    placeholder="مثال: سعادة الدكتور أحمد العلي، خالي العزيز أبو محمد، الأستاذة سارة..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#D8CFC0] text-sm focus:outline-none focus:border-[#832E41] text-[#2B1117]"
                  />
                  {targetGuestName && (
                    <button
                      onClick={() => setTargetGuestName('')}
                      className="px-3 py-2 text-xs text-[#8C4A5A] hover:text-[#2B1117]"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>

              {/* Generated Link & Actions */}
              <div className="p-3.5 rounded-2xl bg-[#F8F2F4] border border-[#E8D4DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[11px] font-bold text-[#832E41]">الرابط المخصص للضيف:</span>
                  <p className="text-xs text-[#4A1B25] font-mono truncate dir-ltr text-right">
                    {generatedGuestLink}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyGuestLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF2F4] text-[#4A1B25] border border-[#DEC2C8] text-xs font-medium transition-colors shadow-xs"
                  >
                    {copiedGuestLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3A7E30]" />
                        <span className="text-[#3A7E30]">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#832E41]" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShareGuestWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5A] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال عبر واتساب</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF2F4] text-[#832E41] border border-[#DEC2C8] text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#832E41]" />
                    <span>خيارات ومشاركة صورة</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
        )}

        {/* Tab 4: Guestbook Messages Management */}
        {activeTab === 'guestbook' && (
          <section
            id="guestbook-management-section"
            className="p-5 sm:p-7 rounded-3xl bg-[#FCFAF7] border border-[#DEC496] shadow-xs space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3D3] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117]">
                    إدارة سجل التهاني والمباركات
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E4] text-[#7F602B] text-xs font-bold">
                    {guestbookMessages.length} رسالة
                  </span>
                </div>
                <p className="text-xs text-[#7E3243] mt-0.5">
                  رسائل المحبة والأدعية التي كتبها الضيوف في سجل الزفاف
                </p>
              </div>
            </div>

            {guestbookMessages.length === 0 ? (
              <div className="py-12 text-center text-[#8C4A5A] text-xs space-y-1">
                <Heart className="w-8 h-8 text-[#D8C4CA] mx-auto mb-2" />
                <p className="font-semibold text-[#2B1117]">لا توجد رسائل تهنئة حتى الآن</p>
                <p className="text-[11px] text-[#A67E88]">الرسائل التي يكتبها المدعوون ستظهر هنا فوراً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {guestbookMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-2xl bg-white border border-[#E5DECF] shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[#2B1117] text-sm">{msg.author}</span>
                        <div className="flex items-center gap-2">
                          {msg.relation && (
                            <span className="text-[11px] text-[#832E41] px-2 py-0.5 rounded-md bg-[#FCECEF]">
                              {msg.relation}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف تهنئة "${msg.author}"؟`)) {
                                deleteGuestbookMessage(msg.id);
                              }
                            }}
                            className="p-1 rounded-md text-[#A5685B] hover:bg-[#FBEAE7] transition-colors"
                            title="حذف الرسالة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#4A1B25] leading-relaxed italic">
                        «{msg.content}»
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8C4A5A] pt-2 border-t border-[#F5EDEF]">
                      <span>{msg.createdAt}</span>
                      <span className="flex items-center gap-1 text-[#832E41]">
                        <Heart className="w-3 h-3 fill-[#832E41]" /> {msg.likes || 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Manual Add RSVP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FCFAF7] rounded-3xl border border-[#DED4C3] shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
              <h3 className="font-sans-ar text-base font-bold text-[#2B1117] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#832E41]" />
                <span>إضافة ضيف يدوياً</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#8C4A5A] hover:bg-[#EFE9DC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualRSVP} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#4A1B25] mb-1">اسم الضيف:</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5CCBC] text-xs focus:outline-none focus:border-[#832E41]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A1B25] mb-1">حالة الحضور:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualStatus('attending')}
                    className={`py-2 rounded-xl font-semibold transition-all ${
                      manualStatus === 'attending'
                        ? 'bg-[#832E41] text-white shadow-xs'
                        : 'bg-white text-[#5E2330] border border-[#D5CCBC]'
                    }`}
                  >
                    مؤكد الحضور
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('declined')}
                    className={`py-2 rounded-xl font-semibold transition-all ${
                      manualStatus === 'declined'
                        ? 'bg-[#8E5B4B] text-white shadow-xs'
                        : 'bg-white text-[#8E5B4B] border border-[#D5CCBC]'
                    }`}
                  >
                    معتذر
                  </button>
                </div>
              </div>

              {manualStatus === 'attending' && (
                <div>
                  <label className="block font-medium text-[#4A1B25] mb-1">إجمالي عدد الأفراد:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setManualCompanions(num)}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          manualCompanions === num
                            ? 'bg-[#832E41] text-white shadow-xs'
                            : 'bg-white text-[#5E2330] border border-[#D5CCBC]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A1B25] mb-1">ملاحظة أو رسالة (اختياري):</label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="مثال: تم التأكيد هاتفياً"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5CCBC] text-xs focus:outline-none focus:border-[#832E41]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8DFD0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#D5CCBC] text-[#5E2330] font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#832E41] hover:bg-[#6E2233] text-white font-semibold transition-colors shadow-xs"
                >
                  حفظ الضيف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Options & Image Export Modal */}
      <ShareOptionsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={currentData}
        guestName={targetGuestName}
        customUrl={generatedGuestLink}
        onOpenBulkModal={() => {
          setIsShareModalOpen(false);
          setIsBulkModalOpen(true);
        }}
      />

      {/* Bulk Multi-Guest Dispatcher Modal */}
      <GuestLinkGeneratorModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        data={currentData}
      />
    </main>
  );
};
