import { InvitationData } from '../types';

export type CardExportType = 'envelope' | 'details';

/**
 * Generates the Closed Royal Envelope with Wax Seal and Guest Tag
 * Exactly matching the luxury physical envelope visual design.
 * Resolution: 1200 x 800 (1.5:1 ratio - perfect for WhatsApp, Facebook, Instagram, and HD printing)
 */
export function generateRoyalEnvelopeCanvas(
  data: InvitationData,
  guestName?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();

  // Helper: Rounded Rect Path
  const roundRectPath = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 1. Base Envelope Background with Rounded Corners
  const cornerRadius = 36;
  roundRectPath(0, 0, width, height, cornerRadius);
  ctx.clip();

  // Deep burgundy luxury gradient
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    80,
    width / 2,
    height / 2,
    width * 0.7
  );
  bgGrad.addColorStop(0, '#8E3246');
  bgGrad.addColorStop(0.4, '#832E41');
  bgGrad.addColorStop(0.8, '#6E2233');
  bgGrad.addColorStop(1, '#501522');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Micro-dot luxury paper texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  const dotSpacing = 16;
  for (let x = 8; x < width; x += dotSpacing) {
    for (let y = 8; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Envelope 4 Flaps subtle shading (Polygon lines)
  const cx = width / 2;
  const cy = height / 2;

  // Top Flap Shadow
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();

  // Bottom Flap Shadow
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fill();

  // 4. Diagonal Stitches & Seams from 4 corners to center
  const drawDiagonalSeams = () => {
    ctx.save();
    
    // Four corner points
    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, height },
      { x: width, y: height },
    ];

    corners.forEach((c) => {
      // Solid subtle gold under-line
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = 'rgba(223, 203, 160, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Parallel dashed golden embroidery stitches
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = '#E2D0A7';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([9, 7]);
      ctx.stroke();
    });

    ctx.restore();
  };
  drawDiagonalSeams();

  // 5. Horizontal Gold Ribbon
  const ribbonThickness = 9;
  
  // Horizontal Ribbon
  const hRibbonGrad = ctx.createLinearGradient(0, cy - ribbonThickness / 2, 0, cy + ribbonThickness / 2);
  hRibbonGrad.addColorStop(0, '#B89656');
  hRibbonGrad.addColorStop(0.3, '#F5E8C7');
  hRibbonGrad.addColorStop(0.7, '#DFCBA0');
  hRibbonGrad.addColorStop(1, '#9E7D36');
  
  ctx.fillStyle = hRibbonGrad;
  ctx.fillRect(0, cy - ribbonThickness / 2, width, ribbonThickness);
  
  // Horizontal Ribbon Dark Border lines
  ctx.fillStyle = '#6E521E';
  ctx.fillRect(0, cy - ribbonThickness / 2 - 0.7, width, 0.8);
  ctx.fillRect(0, cy + ribbonThickness / 2, width, 0.8);

  // Vertical Ribbon
  const vRibbonGrad = ctx.createLinearGradient(cx - ribbonThickness / 2, 0, cx + ribbonThickness / 2, 0);
  vRibbonGrad.addColorStop(0, '#B89656');
  vRibbonGrad.addColorStop(0.3, '#F5E8C7');
  vRibbonGrad.addColorStop(0.7, '#DFCBA0');
  vRibbonGrad.addColorStop(1, '#9E7D36');

  ctx.fillStyle = vRibbonGrad;
  ctx.fillRect(cx - ribbonThickness / 2, 0, ribbonThickness, height);

  // Vertical Ribbon Dark Border lines
  ctx.fillStyle = '#6E521E';
  ctx.fillRect(cx - ribbonThickness / 2 - 0.7, 0, 0.8, height);
  ctx.fillRect(cx + ribbonThickness / 2, 0, 0.8, height);

  // 6. Central Royal Wax Seal
  const sealRadius = 92;

  // Outer Seal Soft Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(25, 4, 10, 0.65)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;

  // Wax Seal Body Path (Circular Organic Rim)
  ctx.beginPath();
  ctx.arc(cx, cy, sealRadius, 0, Math.PI * 2);
  const sealGrad = ctx.createRadialGradient(
    cx - 20,
    cy - 25,
    15,
    cx,
    cy,
    sealRadius
  );
  sealGrad.addColorStop(0, '#9E3B50');
  sealGrad.addColorStop(0.35, '#832E41');
  sealGrad.addColorStop(0.75, '#601927');
  sealGrad.addColorStop(1, '#3E0C17');
  ctx.fillStyle = sealGrad;
  ctx.fill();
  ctx.restore();

  // Wax Rim Highlight
  ctx.beginPath();
  ctx.arc(cx, cy, sealRadius - 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200, 100, 125, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Recessed Center Basin
  const basinRadius = 72;
  ctx.beginPath();
  ctx.arc(cx, cy, basinRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#521320';
  ctx.fill();

  // Inner Shadow for Basin
  ctx.beginPath();
  ctx.arc(cx, cy, basinRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#2F0811';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Outer Filigree Gold Dashed Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, Math.PI * 2);
  ctx.strokeStyle = '#DFCBA0';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4.5, 3.5]);
  ctx.stroke();
  ctx.restore();

  // Inner Solid Gold Thin Ring
  ctx.beginPath();
  ctx.arc(cx, cy, 57, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(223, 203, 160, 0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top miniature royal crown / flourish emblem inside seal
  ctx.save();
  ctx.fillStyle = '#DFCBA0';
  // Central leaf
  ctx.beginPath();
  ctx.moveTo(cx, cy - 42);
  ctx.quadraticCurveTo(cx + 6, cy - 36, cx + 4, cy - 30);
  ctx.quadraticCurveTo(cx, cy - 33, cx, cy - 42);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 42);
  ctx.quadraticCurveTo(cx - 6, cy - 36, cx - 4, cy - 30);
  ctx.quadraticCurveTo(cx, cy - 33, cx, cy - 42);
  ctx.fill();
  // Small dot
  ctx.beginPath();
  ctx.arc(cx, cy - 28, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Calligraphy Names in Seal Center
  const groom = data.groom?.trim() || 'محمد';
  const bride = data.bride?.trim() || 'دنيا';
  const sealText = `${groom} و ${bride}`;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.font = 'bold 27px "El Messiri", "Amiri", "Cairo", sans-serif';
  
  // Text Shadow / Emboss
  ctx.fillStyle = '#22050B';
  ctx.fillText(sealText, cx + 1, cy + 8);
  
  // Gold Metallic Text
  ctx.fillStyle = '#F5E4C3';
  ctx.fillText(sealText, cx, cy + 7);
  ctx.restore();

  // 7. Elegant Silk Guest Tag in Bottom Right Corner
  const finalGuestName = guestName?.trim() || 'ضيوفنا الكرام';
  if (finalGuestName) {
    const tagW = 270;
    const tagH = 92;
    const tagX = width - tagW - 45;
    const tagY = height - tagH - 40;

    ctx.save();
    // Subtle rotation like physical card tag
    ctx.translate(tagX + tagW / 2, tagY + tagH / 2);
    ctx.rotate((-2.5 * Math.PI) / 180);
    ctx.translate(-(tagX + tagW / 2), -(tagY + tagH / 2));

    // Tag Drop Shadow
    ctx.shadowColor = 'rgba(20, 4, 8, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Tag Box
    roundRectPath(tagX, tagY, tagW, tagH, 18);
    ctx.fillStyle = '#FCFAF6';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#D8C7A5';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tag Text
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // Label: دعوة خاصة إلى:
    ctx.fillStyle = '#832E41';
    ctx.font = 'bold 15px "El Messiri", "Cairo", sans-serif';
    ctx.fillText('دعوة خاصة إلى:', tagX + tagW / 2, tagY + 32);

    // Guest Name
    ctx.fillStyle = '#2B1117';
    ctx.font = 'bold 22px "El Messiri", "Cairo", sans-serif';
    
    // Auto-fit guest name if long
    let displayGuest = finalGuestName;
    if (displayGuest.length > 24) {
      displayGuest = displayGuest.substring(0, 22) + '...';
    }
    ctx.fillText(displayGuest, tagX + tagW / 2, tagY + 66);

    ctx.restore();
  }

  ctx.restore();
  return canvas;
}

/**
 * Generates the Inner Invitation Details Card
 * Resolution: 1080 x 1440
 */
export function generateRoyalDetailsCanvas(
  data: InvitationData,
  guestName?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1440;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background Parchment Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FCFAF7');
  bgGrad.addColorStop(0.5, '#F9F5EE');
  bgGrad.addColorStop(1, '#F3EBDD');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    100,
    width / 2,
    height / 2,
    width * 0.8
  );
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  vignette.addColorStop(1, 'rgba(218, 196, 150, 0.15)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const drawRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    strokeColor?: string,
    lineWidth?: number,
    fillColor?: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor && lineWidth) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  const drawDiamond = (cx: number, cy: number, size: number, color: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Borders
  drawRoundedRect(36, 36, width - 72, height - 72, 28, '#C5A059', 5);
  drawRoundedRect(50, 50, width - 100, height - 100, 20, '#DFCBA0', 2);

  const corners = [
    { x: 50, y: 50 },
    { x: width - 50, y: 50 },
    { x: 50, y: height - 50 },
    { x: width - 50, y: height - 50 },
  ];
  corners.forEach((c) => {
    drawDiamond(c.x, c.y, 10, '#C5A059');
    drawDiamond(c.x, c.y, 5, '#832E41');
  });

  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  let currentY = 110;

  // Bismillah
  ctx.fillStyle = '#832E41';
  ctx.font = 'bold 36px Amiri, "El Messiri", "Cairo", serif';
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, currentY);

  currentY += 40;
  ctx.strokeStyle = 'rgba(197, 160, 89, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 140, currentY);
  ctx.lineTo(width / 2 + 140, currentY);
  ctx.stroke();
  drawDiamond(width / 2, currentY, 6, '#C5A059');

  currentY += 50;

  // Quranic Verse
  ctx.fillStyle = '#5A212E';
  ctx.font = '22px Amiri, "El Messiri", serif';
  ctx.fillText('﴿ وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا', width / 2, currentY);
  currentY += 34;
  ctx.fillText('وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ﴾', width / 2, currentY);

  currentY += 45;

  // Guest Name Box
  const trimmedGuest = guestName?.trim();
  if (trimmedGuest) {
    const boxW = Math.min(width - 160, 720);
    const boxH = 74;
    const boxX = (width - boxW) / 2;
    drawRoundedRect(
      boxX,
      currentY,
      boxW,
      boxH,
      16,
      '#DFCBA0',
      2,
      'rgba(131, 46, 65, 0.06)'
    );

    ctx.fillStyle = '#832E41';
    ctx.font = 'bold 26px "El Messiri", "Cairo", sans-serif';
    ctx.fillText(
      `المكرّم / المكرمة: ${trimmedGuest} حفظكم الله`,
      width / 2,
      currentY + 46
    );

    currentY += 105;
  } else {
    currentY += 15;
  }

  // Invitation Intro
  ctx.fillStyle = '#4A1E27';
  ctx.font = '24px "El Messiri", "Cairo", sans-serif';
  ctx.fillText(
    'يتشرف أهل العروسين بدعوة سيادتكم لمشاركتنا أجمل اللحظات بمناسبة حفل زفاف',
    width / 2,
    currentY
  );

  currentY += 80;

  // Names
  const groom = data.groom || 'محمد';
  const bride = data.bride || 'دنيا';

  ctx.fillStyle = '#832E41';
  ctx.font = 'bold 64px Amiri, "El Messiri", serif';
  ctx.fillText(`${groom}  💍  ${bride}`, width / 2, currentY);

  currentY += 25;
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, currentY);
  ctx.lineTo(width / 2 + 200, currentY);
  ctx.stroke();
  drawDiamond(width / 2 - 100, currentY, 5, '#832E41');
  drawDiamond(width / 2 + 100, currentY, 5, '#832E41');
  drawDiamond(width / 2, currentY, 8, '#C5A059');

  currentY += 55;

  // Details Box
  const cardW = width - 160;
  const cardH = 340;
  const cardX = (width - cardW) / 2;
  drawRoundedRect(cardX, currentY, cardW, cardH, 22, '#DFCBA0', 2, '#FFFFFF');

  let detailsY = currentY + 65;
  const drawDetailRow = (icon: string, label: string, val: string) => {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#832E41';
    ctx.font = 'bold 24px "El Messiri", sans-serif';
    ctx.fillText(`${icon} ${label}:`, width - 140, detailsY);

    ctx.fillStyle = '#2B1117';
    ctx.font = '24px "El Messiri", sans-serif';
    ctx.fillText(val, width - 290, detailsY);
    detailsY += 68;
  };

  const formattedDate = data.day ? `يوم ${data.day} • ${data.date}` : (data.date || '5 نوفمبر 2026');
  const formattedTime = data.startTime && data.endTime ? `من الساعة ${data.startTime} وحتى ${data.endTime}` : (data.startTime || 'الساعة 8:00 مساءً');

  drawDetailRow('📅', 'التاريخ', formattedDate);
  drawDetailRow('⏰', 'الموعد', formattedTime);
  drawDetailRow('📍', 'المكان', data.venueName || 'قاعة لاجوي الملكية');
  drawDetailRow('🏛️', 'العنوان', data.address || 'محرم بيك، محور المحمودية');

  currentY += cardH + 45;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#832E41';
  ctx.font = 'bold 26px "El Messiri", "Cairo", sans-serif';
  ctx.fillText('✨ حضوركم يشرفنا ويزيد ليلتنا بهجة وسروراً ✨', width / 2, currentY);

  currentY += 45;
  ctx.fillStyle = '#C5A059';
  ctx.font = '18px "El Messiri", sans-serif';
  ctx.fillText('دعوة زفاف خاصة وملكية • Wedding Invitation', width / 2, currentY);

  return canvas;
}

/**
 * Creates image blob and Data URL from canvas (Defaults to Royal Closed Envelope).
 */
export async function createRoyalCardImage(
  data: InvitationData,
  guestName?: string,
  type: CardExportType = 'envelope'
): Promise<{ blob: Blob; dataUrl: string }> {
  const canvas =
    type === 'details'
      ? generateRoyalDetailsCanvas(data, guestName)
      : generateRoyalEnvelopeCanvas(data, guestName);

  const dataUrl = canvas.toDataURL('image/png', 0.98);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        resolve(new Blob([ab], { type: mimeString }));
      }
    }, 'image/png', 0.98);
  });

  return { blob, dataUrl };
}

/**
 * Direct file download with multiple fallback triggers.
 */
export function downloadImageBlob(
  blob: Blob,
  dataUrl?: string,
  filename: string = 'wedding-envelope-invitation.png'
): boolean {
  try {
    const url = dataUrl || URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      if (!dataUrl) {
        URL.revokeObjectURL(url);
      }
    }, 2000);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    if (dataUrl) {
      window.open(dataUrl, '_blank');
      return true;
    }
    return false;
  }
}

/**
 * Copies PNG image directly to system clipboard.
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof ClipboardItem !== 'undefined'
  ) {
    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    } catch (err) {
      console.warn('Clipboard image copy write failed:', err);
      return false;
    }
  }
  return false;
}

/**
 * Shares image using Native Web Share API if supported.
 */
export async function shareImageWithWebShare(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.share
  ) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return true;
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Web Share API error:', err);
      }
    }
  }
  return false;
}
