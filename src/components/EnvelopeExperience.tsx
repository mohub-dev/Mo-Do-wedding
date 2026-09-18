import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoldEmblemSeal, OliveCornerBranch } from './BotanicalAccents';
import { QuranicVerse } from './QuranicVerse';
import { weddingAudio } from '../utils/audio';
import { InvitationData, INVITATION_DATA } from '../types';

interface EnvelopeExperienceProps {
  onOpened: () => void;
  closingQuote?: string;
  guestName?: string;
  data?: InvitationData;
}

export const EnvelopeExperience: React.FC<EnvelopeExperienceProps> = ({
  onOpened,
  closingQuote,
  guestName,
  data = INVITATION_DATA,
}) => {
  const [animationStep, setAnimationStep] = useState<'idle' | 'opening' | 'revealed'>('idle');

  const handleEnvelopeClick = () => {
    if (animationStep !== 'idle') return;

    // Start playing music immediately on user gesture
    weddingAudio.play();

    setAnimationStep('opening');

    // Perfect fluid transition sequence:
    // 0.0s - 0.2s: Wax seal fades out gently
    // 0.1s - 0.55s: Top triangular flap rotates open smoothly
    // 0.2s - 0.75s: The ivory card rises elegantly from inside the envelope
    // 0.8s: Seamless, graceful cross-dissolve to the full royal wedding card
    setTimeout(() => {
      setAnimationStep('revealed');
      onOpened();
    }, 800);
  };

  const displayNames = data.namesDisplay || `${data.groom} و ${data.bride}`;
  const displayOccasion = data.occasion || 'حفل زفاف';
  const displayDate = `${data.day} • ${data.date}`;
  const displayQuote = closingQuote || data.closingQuote || data.finalPhrase || "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً";

  return (
    <section
      id="envelope-stage"
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden"
    >
      {/* Ambient warm lighting & subtle rose-cream texture */}
      <div className="absolute inset-0 bg-radial from-[#FFFDF9] via-[#FAF4F2] to-[#ECE1E3] pointer-events-none" />
      
      {/* Soft decorative floating branch shadows on the table */}
      <div className="absolute top-8 right-8 w-64 h-64 opacity-20 pointer-events-none transform rotate-12 blur-xs">
        <OliveCornerBranch />
      </div>
      <div className="absolute bottom-8 left-8 w-72 h-72 opacity-20 pointer-events-none transform -rotate-45 blur-xs">
        <OliveCornerBranch flipped />
      </div>

      {/* Main Interactive Stage Column */}
      <div className="relative z-20 w-full max-w-[94vw] xs:max-w-[460px] sm:max-w-[560px] md:max-w-[620px] lg:max-w-[680px] flex flex-col items-center">
        
        {/* Main 3D Envelope Container */}
        <div
          id="envelope-card-trigger"
          onClick={handleEnvelopeClick}
          role="button"
          tabIndex={0}
          aria-label="انقر لفتح بطاقة الدعوة"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEnvelopeClick();
            }
          }}
          className="relative w-full aspect-[1.48/1] xs:aspect-[1.52/1] perspective-1000 cursor-pointer group select-none focus:outline-none"
        >
          {/* Layered Rich Ambient Shadow underneath the royal envelope */}
          <div className="absolute -inset-2 bg-[#2D0B14]/30 blur-2xl rounded-3xl transform translate-y-7 group-hover:translate-y-9 transition-transform duration-500" />
          <div className="absolute inset-x-4 -bottom-3 h-8 bg-[#22070E]/40 blur-lg rounded-full transform translate-y-3" />

          {/* The Envelope Box in 3D */}
          <div className="relative w-full h-full rounded-2xl sm:rounded-3xl preserve-3d shadow-[0_20px_45px_rgba(45,11,20,0.25)] border border-[#832E41]/70">
            
            {/* 1. Envelope Back Interior (Deep Burgundy Silk Lining) */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-[#521623] border border-[#3E0E19] overflow-hidden shadow-inner">
              {/* Interior delicate paper pattern */}
              <div className="absolute inset-0 bg-[#EFECE4]/15 bg-cream-paper opacity-35" />
              {/* Gold watermark ornament inside envelope pocket */}
              <div className="absolute inset-x-4 sm:inset-x-8 top-3 sm:top-5 flex flex-col items-center opacity-30">
                <span className="font-sans-ar text-[9px] xs:text-[10px] sm:text-[11px] text-[#DFCBA0] tracking-[0.25em] uppercase">
                  Royal Wedding Invitation
                </span>
                <span className="font-sans-ar text-xs xs:text-sm sm:text-base text-[#F7F4EE] tracking-widest mt-0.5 sm:mt-1">
                  {displayOccasion} • {displayNames}
                </span>
              </div>
            </div>

            {/* 2. The Ivory Invitation Card (Slides Up) */}
            <motion.div
              id="emerging-invitation-card"
              initial={false}
              animate={
                animationStep === 'opening'
                  ? { y: '-62%', scale: 1.04, rotate: -0.5 }
                  : { y: '0%', scale: 0.96, rotate: 0 }
              }
              transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-3 sm:inset-x-4 top-2.5 sm:top-3 bottom-2.5 sm:bottom-3 rounded-xl sm:rounded-2xl bg-[#FCFAF7] border border-[#D5BE91] shadow-xl p-3 sm:p-5 flex flex-col items-center justify-center text-center overflow-hidden z-10"
            >
              {/* Double Gold Fillet Border */}
              <div className="absolute inset-1.5 sm:inset-3 border border-[#DEC496] pointer-events-none rounded-lg sm:rounded-xl" />
              <div className="absolute inset-2.5 sm:inset-4 border border-[#ECE0C6] pointer-events-none rounded-md sm:rounded-lg" />

              {/* Corner Botanical Foliage */}
              <div className="absolute top-0 right-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 opacity-80 pointer-events-none">
                <OliveCornerBranch />
              </div>
              <div className="absolute bottom-0 left-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 opacity-80 pointer-events-none">
                <OliveCornerBranch flipped />
              </div>

              {/* Teaser Content on Emerging Card */}
              <div className="relative z-10 space-y-0.5 sm:space-y-1">
                <span className="font-sans-ar text-[11px] xs:text-xs sm:text-sm text-[#832E41] tracking-widest font-medium block">
                  {displayOccasion}
                </span>
                <h2 className="font-sans-ar text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-[#2B1117] font-bold tracking-wide pt-0.5 sm:pt-1">
                  {displayNames}
                </h2>
                <p className="font-sans-ar text-[10px] xs:text-xs text-[#8C4A5A] pt-0.5 sm:pt-1">
                  {displayDate}
                </p>
              </div>
            </motion.div>

            {/* 3. Envelope Front Flaps Construction */}
            
            {/* 3A. Left Side Flap (Solid Opaque Burgundy) */}
            <div
              className="absolute inset-y-0 left-0 w-full rounded-2xl sm:rounded-3xl z-20 pointer-events-none overflow-hidden"
              style={{
                clipPath: 'polygon(0% 0%, 52% 50%, 0% 100%)',
                background: 'linear-gradient(135deg, #832E41 0%, #6E2233 60%, #521623 100%)',
              }}
            >
              <div className="absolute inset-0 bg-burgundy-paper opacity-30" />
              <div className="absolute inset-0 bg-envelope-grain opacity-20" />
              {/* Left Flap Golden Embroidery Line */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-65">
                <polyline
                  points="0,0 52,50 0,100"
                  fill="none"
                  stroke="#DFCBA0"
                  strokeWidth="0.8"
                  strokeDasharray="3 2"
                />
              </svg>
            </div>

            {/* 3B. Right Side Flap (Solid Opaque Burgundy) */}
            <div
              className="absolute inset-y-0 right-0 w-full rounded-2xl sm:rounded-3xl z-20 pointer-events-none overflow-hidden"
              style={{
                clipPath: 'polygon(100% 0%, 48% 50%, 100% 100%)',
                background: 'linear-gradient(225deg, #832E41 0%, #6E2233 60%, #521623 100%)',
              }}
            >
              <div className="absolute inset-0 bg-burgundy-paper opacity-30" />
              <div className="absolute inset-0 bg-envelope-grain opacity-20" />
              {/* Right Flap Golden Embroidery Line */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-65">
                <polyline
                  points="100,0 48,50 100,100"
                  fill="none"
                  stroke="#DFCBA0"
                  strokeWidth="0.8"
                  strokeDasharray="3 2"
                />
              </svg>
            </div>

            {/* 3C. Bottom Pocket Flap (Solid Opaque Burgundy with Golden Stitched Edge) */}
            <div
              className="absolute inset-x-0 bottom-0 w-full h-full rounded-2xl sm:rounded-3xl z-25 pointer-events-none shadow-[0_-8px_20px_rgba(30,7,13,0.3)] overflow-hidden"
              style={{
                clipPath: 'polygon(0% 100%, 50% 38%, 100% 100%)',
                background: 'linear-gradient(0deg, #5E1C2B 0%, #762638 50%, #832E41 100%)',
              }}
            >
              <div className="absolute inset-0 bg-burgundy-paper opacity-35" />
              <div className="absolute inset-0 bg-envelope-grain opacity-25" />

              {/* Bottom Flap Golden Embroidery Border */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-75">
                <polyline
                  points="0,100 50,38 100,100"
                  fill="none"
                  stroke="#D9BA77"
                  strokeWidth="0.9"
                  strokeDasharray="3 2"
                />
                <polyline
                  points="3,100 50,42 97,100"
                  fill="none"
                  stroke="#F4E6C8"
                  strokeWidth="0.5"
                  opacity="0.65"
                />
              </svg>
            </div>

            {/* 4. Top Triangular Flap */}
            <motion.div
              id="envelope-top-flap"
              initial={false}
              animate={
                animationStep === 'opening'
                  ? { rotateX: 180, zIndex: 5 }
                  : { rotateX: 0, zIndex: 30 }
              }
              transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="absolute inset-0 rounded-t-2xl sm:rounded-t-3xl preserve-3d"
            >
              {/* Front of Flap */}
              <div
                className="absolute inset-0 rounded-t-2xl sm:rounded-t-3xl shadow-[0_12px_28px_rgba(30,7,13,0.5)] backface-hidden flex items-end justify-center overflow-hidden"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 56%)',
                  background: 'linear-gradient(180deg, #94374D 0%, #832E41 50%, #681F2F 100%)',
                }}
              >
                <div className="absolute inset-0 bg-burgundy-paper opacity-35" />
                <div className="absolute inset-0 bg-envelope-grain opacity-25" />

                {/* Delicate Gold Edge Piping on Flap V-Shape */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                >
                  <polyline
                    points="0,0 50,56 100,0"
                    fill="none"
                    stroke="#DEC490"
                    strokeWidth="1.1"
                    strokeDasharray="3 2"
                  />
                  <polyline
                    points="2,0 50,53 98,0"
                    fill="none"
                    stroke="#F8EED9"
                    strokeWidth="0.5"
                    opacity="0.75"
                  />
                </svg>
              </div>

              {/* Back of Flap */}
              <div
                className="absolute inset-0 rounded-t-2xl sm:rounded-t-3xl bg-[#4A131F] backface-hidden shadow-inner"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 56%)',
                  transform: 'rotateX(180deg)',
                }}
              >
                <div className="absolute inset-0 bg-cream-paper opacity-20" />
              </div>
            </motion.div>

            {/* 5. Natural Cord Ribbon & Bow */}
            <AnimatePresence>
              {animationStep === 'idle' && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.08, filter: 'blur(2px)' }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                >
                  {/* Horizontal Silk Twine Cord with Gold Highlights */}
                  <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-[#BFA87A] via-[#E2CE9F] to-[#BFA87A] shadow-[0_3px_8px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    <div className="w-full h-px bg-[#7A643B] opacity-75" />
                  </div>

                  {/* Vertical Silk Twine Cord */}
                  <div className="absolute inset-y-0 w-2 bg-gradient-to-b from-[#BFA87A] via-[#E2CE9F] to-[#BFA87A] shadow-[0_3px_8px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    <div className="h-full w-px bg-[#7A643B] opacity-75" />
                  </div>

                  {/* Center Wax Seal Emblem with Dynamic Names */}
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    className="relative z-50 w-20 h-20 xs:w-22 xs:h-22 sm:w-26 sm:h-26 md:w-28 md:h-28 cursor-pointer filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
                  >
                    <GoldEmblemSeal text={displayNames} />
                  </motion.div>

                  {/* Elegant Silk Guest Tag on Envelope */}
                  {guestName && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-2.5 xs:bottom-4 sm:bottom-8 right-2.5 xs:right-4 sm:right-8 z-50 max-w-[130px] xs:max-w-[170px] sm:max-w-xs px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#FCFAF6] border border-[#D8C7A5] sm:border-2 shadow-lg text-right transform rotate-[-3deg]"
                    >
                      <span className="block text-[9px] xs:text-[10px] text-[#832E41] font-sans-ar font-semibold">دعوة خاصة إلى:</span>
                      <span className="font-sans-ar text-xs xs:text-sm sm:text-base font-bold text-[#2B1117] leading-tight block pt-0.5 truncate">
                        {guestName}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover golden silk shimmer effect */}
            {animationStep === 'idle' && (
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-35" />
            )}

          </div>
        </div>

        {/* Prominent Clear Open Button */}
        <AnimatePresence>
          {animationStep === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5, transition: { duration: 0.2 } }}
              transition={{ delay: 0.25 }}
              className="w-full flex justify-center mt-5 sm:mt-8 z-30 px-2"
            >
              <button
                type="button"
                id="open-invitation-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnvelopeClick();
                }}
                className="w-full max-w-[280px] xs:max-w-xs sm:max-w-sm px-6 sm:px-12 py-3 sm:py-4 rounded-full bg-gradient-to-r from-[#832E41] via-[#99374E] to-[#832E41] hover:from-[#6E2233] hover:via-[#832E41] hover:to-[#6E2233] active:scale-[0.98] text-[#FAF8F5] border-2 border-[#D9BE8E] shadow-[0_12px_28px_rgba(131,46,65,0.35)] hover:shadow-[0_16px_36px_rgba(131,46,65,0.45)] text-sm xs:text-base sm:text-lg font-bold font-sans-ar tracking-widest cursor-pointer transition-all duration-300 select-none focus:outline-none focus:ring-4 focus:ring-[#D9BE8E]/40"
              >
                انقر لفتح الدعوة
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorated Quranic Verse Under the Button */}
        <motion.div
          id="closed-card-quote"
          initial={{ opacity: 0, y: 15 }}
          animate={{
            opacity: animationStep === 'opening' ? 0.35 : 1,
            y: 0,
          }}
          transition={{ duration: 0.4 }}
          className="relative z-20 mt-6 sm:mt-8 text-center w-full px-4"
        >
          <QuranicVerse
            verse={displayQuote}
            size="md"
            theme="light"
            showSurahHint={false}
          />
        </motion.div>

      </div>
    </section>
  );
};
