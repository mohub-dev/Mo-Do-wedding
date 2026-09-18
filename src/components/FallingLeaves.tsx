import React, { useEffect, useRef } from 'react';

type ParticleType = 'burgundy_heart' | 'gold_heart' | 'sparkle_star';

interface CelebrationParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  oscillationSpeed: number;
  oscillationAmplitude: number;
  oscillationOffset: number;
  opacity: number;
  baseOpacity: number;
  type: ParticleType;
  color: string;
  borderColor?: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface FallingLeavesProps {
  active: boolean;
}

export const FallingLeaves: React.FC<FallingLeavesProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palettes
    const burgundyTones = [
      { fill: '#832E41', border: '#5C1A28' }, // Royal Burgundy #832e41
      { fill: '#9C384E', border: '#6E2233' }, // Crimson Rose
      { fill: '#6B1F30', border: '#45101C' }, // Deep Wine Burgundy
      { fill: '#B0435C', border: '#832E41' }, // Velvet Ruby
    ];

    const goldTones = [
      { fill: '#D4AF37', border: '#A6841B' }, // Metallic Gold
      { fill: '#E5C07B', border: '#B89656' }, // Warm Luxury Gold
      { fill: '#F3D289', border: '#C8A252' }, // Shimmering Light Gold
      { fill: '#C5A467', border: '#8C733E' }, // Champagne Gold
    ];

    const starTones = ['#FFF8DB', '#FFE494', '#FFDF00', '#FFFFFF', '#FDF5D8'];

    const particleCount = 42;
    const particles: CelebrationParticle[] = [];

    // Helper to pick random type with balanced ratio:
    // ~40% Burgundy hearts, ~35% Gold hearts, ~25% Sparkle stars
    const getRandomType = (): ParticleType => {
      const rand = Math.random();
      if (rand < 0.4) return 'burgundy_heart';
      if (rand < 0.75) return 'gold_heart';
      return 'sparkle_star';
    };

    for (let i = 0; i < particleCount; i++) {
      const type = getRandomType();
      let color = '';
      let borderColor: string | undefined = undefined;

      if (type === 'burgundy_heart') {
        const item = burgundyTones[Math.floor(Math.random() * burgundyTones.length)];
        color = item.fill;
        borderColor = item.border;
      } else if (type === 'gold_heart') {
        const item = goldTones[Math.floor(Math.random() * goldTones.length)];
        color = item.fill;
        borderColor = item.border;
      } else {
        color = starTones[Math.floor(Math.random() * starTones.length)];
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.5 - height * 0.8, // Staggered entry from above and middle
        size: type === 'sparkle_star' ? Math.random() * 6 + 6 : Math.random() * 8 + 10,
        speedY: type === 'sparkle_star' ? Math.random() * 0.6 + 0.35 : Math.random() * 0.9 + 0.55,
        speedX: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        tilt: Math.random() * Math.PI,
        tiltSpeed: Math.random() * 0.03 + 0.015,
        oscillationSpeed: Math.random() * 0.02 + 0.01,
        oscillationAmplitude: Math.random() * 1.8 + 0.8,
        oscillationOffset: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.35 + 0.65,
        baseOpacity: Math.random() * 0.35 + 0.65,
        type,
        color,
        borderColor,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.06 + 0.03,
      });
    }

    let tick = 0;

    // Draw Heart shape
    const drawHeart = (size: number, fill: string, stroke?: string, scaleX = 1) => {
      ctx.save();
      ctx.scale(scaleX, 1);
      ctx.beginPath();
      const topY = -size * 0.3;
      const bottomY = size * 0.65;
      const widthD = size * 0.72;

      ctx.moveTo(0, topY + size * 0.22);
      // Left curve
      ctx.bezierCurveTo(
        -widthD * 0.5,
        topY - size * 0.32,
        -widthD * 1.08,
        topY + size * 0.32,
        0,
        bottomY
      );
      // Right curve
      ctx.bezierCurveTo(
        widthD * 1.08,
        topY + size * 0.32,
        widthD * 0.5,
        topY - size * 0.32,
        0,
        topY + size * 0.22
      );
      ctx.closePath();

      ctx.fillStyle = fill;
      ctx.fill();

      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();
    };

    // Draw Sparkle Star
    const drawSparkleStar = (size: number, fill: string, twinkleVal: number) => {
      const outer = size * (0.8 + 0.4 * twinkleVal);
      const inner = outer * 0.22;

      ctx.save();
      // Star Glow
      ctx.shadowColor = '#FFE89E';
      ctx.shadowBlur = 8 * twinkleVal;

      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (i * Math.PI) / 4;
        const x = Math.sin(angle) * r;
        const y = Math.cos(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();

      // Gleaming center core
      ctx.beginPath();
      ctx.arc(0, 0, inner * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x +=
          p.speedX +
          Math.sin(tick * p.oscillationSpeed + p.oscillationOffset) * p.oscillationAmplitude;
        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;
        p.twinklePhase += p.twinkleSpeed;

        // Reset when out of bottom bounds
        if (p.y > height + 30) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 30) p.x = -30;
        if (p.x < -30) p.x = width + 30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'sparkle_star') {
          const twinkleVal = (Math.sin(p.twinklePhase) + 1) / 2; // 0..1
          ctx.globalAlpha = p.baseOpacity * (0.5 + 0.5 * twinkleVal);
          drawSparkleStar(p.size, p.color, twinkleVal);
        } else {
          // 3D paper flutter tilt effect on hearts
          const scaleX = Math.cos(p.tilt);
          ctx.globalAlpha = p.opacity;
          drawHeart(p.size, p.color, p.borderColor, scaleX);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 select-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
