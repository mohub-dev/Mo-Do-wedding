import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoStageProps {
  onEnded: () => void;
  isStageActive: boolean;
  hasEnded: boolean;
}

export const VideoStage: React.FC<VideoStageProps> = ({
  onEnded,
  isStageActive,
  hasEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showMuteButton, setShowMuteButton] = useState<boolean>(false);
  const endedCalledRef = useRef<boolean>(false);

  const handleVideoComplete = useCallback(() => {
    if (!endedCalledRef.current) {
      endedCalledRef.current = true;
      onEnded();
    }
  }, [onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isStageActive && !hasEnded) {
      endedCalledRef.current = false;
      video.currentTime = 0;

      // Attempt playback with sound (user gesture originated from card click)
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setShowMuteButton(true);
          })
          .catch((error) => {
            console.warn('Autoplay with audio policy blocked, falling back to muted playback:', error);
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => {
              setShowMuteButton(true);
            }).catch((err) => {
              console.error('Playback failed:', err);
              // Fallback to finish stage if video fails
              handleVideoComplete();
            });
          });
      }
    } else if (!isStageActive) {
      video.pause();
      video.currentTime = 0;
      endedCalledRef.current = false;
    }
  }, [isStageActive, hasEnded, handleVideoComplete]);

  // Monitor playback time to safely catch end frame before any fade to black
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // The video ends at 8.5s. If it reaches >= 8.35s, trigger completion smoothly
    if (video.currentTime >= 8.35 && !endedCalledRef.current) {
      video.pause();
      handleVideoComplete();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div
      id="cinematic-video-stage"
      className={`relative w-full transition-all duration-1000 ${
        isStageActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Cinematic Letterbox Bar - Top */}
      <div
        id="letterbox-top"
        className={`fixed top-0 left-0 right-0 z-40 bg-[#161C14] transition-all duration-700 ease-out pointer-events-none ${
          isStageActive && !hasEnded
            ? 'h-8 sm:h-12 md:h-16 opacity-100'
            : 'h-0 opacity-0'
        }`}
      />

      {/* Cinematic Letterbox Bar - Bottom */}
      <div
        id="letterbox-bottom"
        className={`fixed bottom-0 left-0 right-0 z-40 bg-[#161C14] transition-all duration-700 ease-out pointer-events-none ${
          isStageActive && !hasEnded
            ? 'h-8 sm:h-12 md:h-16 opacity-100'
            : 'h-0 opacity-0'
        }`}
      />

      {/* Audio Mute/Unmute Control */}
      {showMuteButton && isStageActive && !hasEnded && (
        <button
          id="audio-toggle-button"
          onClick={toggleMute}
          className="fixed top-12 sm:top-16 left-4 sm:left-6 z-50 p-2.5 rounded-full bg-black/40 text-white/90 backdrop-blur-md hover:bg-black/60 transition-all duration-300 focus:outline-none"
          title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Video Container (16:9 full frame aspect ratio) */}
      <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-4 flex items-center justify-center min-h-[50vh] sm:min-h-[65vh] md:min-h-[75vh]">
        <div className="w-full aspect-16/9 relative rounded-lg overflow-hidden shadow-[0_20px_60px_rgba(20,26,18,0.3)] bg-transparent">
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            id="invitation-native-video"
            src="/assets/invitation_video.mp4"
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoComplete}
            className={`w-full h-full object-contain block transition-opacity duration-500 ${
              hasEnded ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />

          {/* Frozen Pristine End Frame Image: Displays permanently once video finishes with zero jump */}
          <div
            id="video-end-frame"
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 pointer-events-none ${
              hasEnded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src="/assets/invitation_card.png"
              alt="بطاقة الدعوة المفتوحة"
              className="w-full h-full object-contain block select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
