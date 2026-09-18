import React from 'react';

export const OliveCornerBranch: React.FC<{ className?: string; flipped?: boolean }> = ({
  className = '',
  flipped = false,
}) => {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`pointer-events-none select-none ${className} ${flipped ? 'scale-x-[-1] scale-y-[-1]' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="roseGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#832E41" />
          <stop offset="100%" stopColor="#A84358" />
        </linearGradient>
        <linearGradient id="roseGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#661C2C" />
          <stop offset="100%" stopColor="#832E41" />
        </linearGradient>
        <linearGradient id="goldBerry" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9E7D2E" />
        </linearGradient>
      </defs>

      {/* Main graceful arching stem */}
      <path
        d="M10,10 Q60,20 110,65 T145,145"
        stroke="#591825"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Secondary branch */}
      <path
        d="M45,18 Q80,45 95,95"
        stroke="#591825"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Leaves along branch */}
      {/* Leaf 1 */}
      <path
        d="M18,12 C28,5 42,8 48,18 C40,24 25,22 18,12 Z"
        fill="url(#roseGrad1)"
        opacity="0.9"
      />
      <path d="M18,12 Q33,15 48,18" stroke="#48121D" strokeWidth="0.8" opacity="0.6" />

      {/* Leaf 2 */}
      <path
        d="M36,16 C48,10 65,16 70,28 C58,32 44,28 36,16 Z"
        fill="url(#roseGrad2)"
        opacity="0.95"
      />
      <path d="M36,16 Q53,22 70,28" stroke="#48121D" strokeWidth="0.8" opacity="0.6" />

      {/* Leaf 3 */}
      <path
        d="M62,32 C78,26 95,35 98,48 C85,52 70,46 62,32 Z"
        fill="url(#roseGrad1)"
        opacity="0.9"
      />

      {/* Leaf 4 */}
      <path
        d="M80,48 C98,42 116,54 118,68 C104,70 90,62 80,48 Z"
        fill="url(#roseGrad2)"
        opacity="0.95"
      />

      {/* Leaf 5 */}
      <path
        d="M100,70 C118,66 134,80 132,96 C119,95 108,84 100,70 Z"
        fill="url(#roseGrad1)"
        opacity="0.9"
      />

      {/* Leaf 6 */}
      <path
        d="M118,98 C134,96 148,112 144,128 C131,124 122,112 118,98 Z"
        fill="url(#roseGrad2)"
        opacity="0.95"
      />

      {/* Secondary branch leaves */}
      <path
        d="M55,28 C62,38 60,54 50,62 C46,48 48,36 55,28 Z"
        fill="url(#roseGrad1)"
        opacity="0.85"
      />
      <path
        d="M75,52 C84,62 80,78 68,85 C65,72 68,60 75,52 Z"
        fill="url(#roseGrad2)"
        opacity="0.9"
      />

      {/* Gold berries */}
      <ellipse cx="44" cy="24" rx="4.5" ry="6" transform="rotate(30 44 24)" fill="url(#goldBerry)" />
      <ellipse cx="90" cy="58" rx="4" ry="5.5" transform="rotate(-20 90 58)" fill="url(#goldBerry)" />
      <ellipse cx="112" cy="90" rx="3.5" ry="5" transform="rotate(40 112 90)" fill="url(#goldBerry)" />
    </svg>
  );
};

export const GoldEmblemSeal: React.FC<{ className?: string; text?: string }> = ({
  className = '',
  text = 'محمد و دنيا',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(40,10,18,0.5)]">
        <defs>
          <radialGradient id="waxRadial" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#A84358" />
            <stop offset="35%" stopColor="#832E41" />
            <stop offset="75%" stopColor="#631B2A" />
            <stop offset="100%" stopColor="#3E0F19" />
          </radialGradient>
          <linearGradient id="sealGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9ECC8" />
            <stop offset="30%" stopColor="#DEC288" />
            <stop offset="70%" stopColor="#B38F46" />
            <stop offset="100%" stopColor="#8B6925" />
          </linearGradient>
          <filter id="waxInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#26080F" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* Organic wavy Wax Stamp Edge in Royal Burgundy */}
        <path
          d="M50 3 
             C56 2, 63 6, 68 10 
             C74 12, 80 17, 84 24 
             C89 30, 94 37, 95 44 
             C97 52, 95 61, 91 68 
             C88 75, 82 81, 76 86 
             C70 91, 62 95, 54 96 
             C46 97, 38 94, 31 90 
             C24 87, 18 81, 14 74 
             C9 68, 5 60, 5 52 
             C4 44, 8 36, 13 29 
             C17 22, 23 16, 30 12 
             C37 7, 44 3, 50 3 Z"
          fill="url(#waxRadial)"
          stroke="#4D1220"
          strokeWidth="1.2"
        />

        {/* Wax rim highlight */}
        <circle cx="50" cy="50" r="41" fill="none" stroke="#BA5B70" strokeWidth="1" opacity="0.4" />

        {/* Recessed Center Basin */}
        <circle cx="50" cy="50" r="37" fill="#581624" filter="url(#waxInnerShadow)" />

        {/* Outer Filigree Gold Ring with Dots */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="url(#sealGoldMetallic)" strokeWidth="1.4" strokeDasharray="3.5 2.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="url(#sealGoldMetallic)" strokeWidth="0.8" opacity="0.75" />

        {/* Top Miniature Olive Spray */}
        <path
          d="M50,21 C52,25 56,27 55,31 C52,30 51,28 50,21 Z"
          fill="url(#sealGoldMetallic)"
        />
        <path
          d="M50,21 C48,25 44,27 45,31 C48,30 49,28 50,21 Z"
          fill="url(#sealGoldMetallic)"
        />
        <circle cx="50" cy="32" r="1.2" fill="url(#sealGoldMetallic)" />
      </svg>

      {/* Center Initials/Names in Arabic with Embossed Glow */}
      <span
        className="absolute inset-0 flex items-center justify-center font-sans-ar text-sm sm:text-base font-bold tracking-wider pt-2 select-none"
        style={{
          color: '#F4E3BF',
          textShadow: '0 1px 2px #26080F, 0 -1px 1px rgba(255,255,255,0.3)',
        }}
      >
        {text}
      </span>
    </div>
  );
};
