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

  // The fragment is client-only, so every personalized link keeps the same crawler-visible /invite URL.
  useEffect(() => {
    const readUrlState = () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash
        );
        const queryParams = new URLSearchParams(window.location.search);
        const name = hashParams.get('guest') || queryParams.get('guest') || '';

        setGuestName(name.trim());

        if (queryParams.has('admin') || queryParams.get('view') === 'admin') {
          setIsAdminView(true);
        }
      } catch (e) {
        console.warn('Failed to parse invitation URL', e);
      }
    };

    readUrlState();
    window.addEventListener('hashchange', readUrlState);
    return () => window.removeEventListener('hashchange', readUrlState);
  }, []);

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
