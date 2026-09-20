import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWeddingData } from './context/WeddingDataContext';
import { EnvelopeExperience } from './components/EnvelopeExperience';
import { WeddingCard } from './components/WeddingCard';
import { AdminDashboard } from './components/AdminDashboard';
import { FallingLeaves } from './components/FallingLeaves';
import { AudioControl } from './components/AudioControl';
import { weddingAudio } from './utils/audio';

export default function App() {
  const { invitationData } = useWeddingData();
  const [isOpened, setIsOpened] = useState(false);
  const [leavesActive, setLeavesActive] = useState(false);
  const [guestName, setGuestName] = useState<string>('');
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.has('admin') || params.get('view') === 'admin';
    } catch {
      return false;
    }
  });

  // Extract personalized guest name from URL parameters (?guest=... or ?to=... or ?name=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('guest') || params.get('to') || params.get('name') || '';
      if (name.trim()) {
        const trimmed = name.trim();
        setGuestName(trimmed);
        document.title = `دعوة خاصة لـ ${trimmed} 🌸 | زفاف ${invitationData.groom} و ${invitationData.bride}`;
        
        // Update OpenGraph Title & Description for dynamic guest preview
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
          ogTitle.setAttribute('content', `دعوة خاصة لـ ${trimmed} 🌸 | زفاف ${invitationData.groom} & ${invitationData.bride} 💍`);
        }
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
          ogDesc.setAttribute('content', `يتشرف العروسين بدعوة سيادتكم (${trimmed}) لمشاركتهم فرحتهم الكبرى يوم ${invitationData.day} ${invitationData.date} بقاعة ${invitationData.venueName}.`);
        }
      } else {
        document.title = `دعوة زفاف ${invitationData.groom} و ${invitationData.bride} | بطاقة دعوة إلكترونية فاخرة`;
      }

      if (params.has('admin') || params.get('view') === 'admin') {
        setIsAdminView(true);
      }
    } catch (e) {
      console.warn('Failed to parse URL query params', e);
    }
  }, [invitationData.groom, invitationData.bride, invitationData.day, invitationData.date, invitationData.venueName]);

  // When envelope opens
  const handleOpen = useCallback(() => {
    setLeavesActive(true);
    setIsOpened(true);
  }, []);

  // When user clicks replay
  const handleReplay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpened(false);
    setTimeout(() => {
      setLeavesActive(false);
      weddingAudio.pause();
    }, 400);
  }, []);

  // Switch to admin view and update URL query
  const handleGoToAdmin = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('admin', 'true');
    window.history.pushState({}, '', url.toString());
    setIsAdminView(true);
  }, []);

  // Exit admin view and return to guest invitation view
  const handleExitAdmin = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.toString());
    setIsAdminView(false);
    setIsOpened(true);
  }, []);

  // Ensure scroll is restored when opened
  useEffect(() => {
    if (!isOpened && !isAdminView) {
      window.scrollTo(0, 0);
    }
  }, [isOpened, isAdminView]);

  // If URL has ?admin=true or user switched to Admin View:
  if (isAdminView) {
    return (
      <AdminDashboard
        data={invitationData}
        onExitAdmin={handleExitAdmin}
      />
    );
  }

  return (
    <main
      id="wedding-invitation-root"
      className="relative min-h-screen w-full bg-[#F8F5F2] text-[#2B1117] overflow-x-hidden selection:bg-[#832E41] selection:text-white"
    >
      {/* Delicate floating olive leaves canvas */}
      <FallingLeaves active={leavesActive} />

      {/* Floating Audio Controller */}
      <AudioControl />

      {/* Views with Smooth Seamless Handover Transition */}
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="envelope-view"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.35, ease: 'easeOut' },
            }}
            className="w-full"
          >
            <EnvelopeExperience
              onOpened={handleOpen}
              closingQuote={invitationData.closingQuote}
              guestName={guestName}
              data={invitationData}
            />
          </motion.div>
        ) : (
          <motion.div
            key="wedding-card-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
            className="w-full min-h-screen flex flex-col items-center justify-start"
          >
            <WeddingCard
              data={invitationData}
              guestName={guestName}
              onReplay={handleReplay}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
