import * as THREE from 'three';

/**
 * High-resolution procedural texture generator for EurekaLab 3D.
 * Creates sharp, stylized PBR textures using HTML5 Canvas without any external asset dependencies.
 */

// Cache textures to avoid recreating canvases on every frame or render
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates or retrieves a cached CanvasTexture with correct colorSpace and anisotropy.
 */
function createCachedCanvasTexture(
  key: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
}

// ==========================================
// 1. CHARACTER FACE & ROBOT SCREEN TEXTURES
// ==========================================

export function getBoyFaceTexture(): THREE.CanvasTexture {
  return createCachedCanvasTexture('boy_face', 512, 512, (ctx, w, h) => {
    // Pleasant warm skin base
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(0, 0, w, h);

    // Soft rosy cheeks
    const blushLeft = ctx.createRadialGradient(160, 310, 5, 160, 310, 45);
    blushLeft.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
    blushLeft.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = blushLeft;
    ctx.beginPath();
    ctx.arc(160, 310, 45, 0, Math.PI * 2);
    ctx.fill();

    const blushRight = ctx.createRadialGradient(352, 310, 5, 352, 310, 45);
    blushRight.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
    blushRight.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = blushRight;
    ctx.beginPath();
    ctx.arc(352, 310, 45, 0, Math.PI * 2);
    ctx.fill();

    // Stylized Anime/Pixar Eyes
    // Sclera (Whites)
    const drawEye = (cx: number, cy: number) => {
      // White eye base with slight gradient
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 48, 56, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Blue sparkling iris
      const irisGrad = ctx.createRadialGradient(cx, cy - 5, 8, cx, cy, 34);
      irisGrad.addColorStop(0, '#38bdf8');
      irisGrad.addColorStop(0.6, '#0284c7');
      irisGrad.addColorStop(1, '#0f172a');
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = irisGrad;
      ctx.fill();

      // Deep dark pupil
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.fill();

      // Star-bright specular highlights
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 12, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + 12, cy + 10, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Upper stylized eyelash line
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 49, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#1e1b4b';
      ctx.stroke();

      // Eyebrow
      ctx.beginPath();
      ctx.arc(cx, cy - 40, 40, Math.PI * 1.25, Math.PI * 1.75);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#3b1d08';
      ctx.stroke();
      ctx.restore();
    };

    drawEye(170, 240);
    drawEye(342, 240);

    // Cute nose button
    ctx.beginPath();
    ctx.arc(256, 310, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Friendly bright smile
    ctx.beginPath();
    ctx.arc(256, 340, 36, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#991b1b';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner teeth / smile depth
    ctx.beginPath();
    ctx.arc(256, 340, 34, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}

export function getGirlFaceTexture(): THREE.CanvasTexture {
  return createCachedCanvasTexture('girl_face', 512, 512, (ctx, w, h) => {
    // Fair porcelain skin tone with rosy undertone
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(0, 0, w, h);

    // Prominent glowing blush
    const blushL = ctx.createRadialGradient(150, 315, 6, 150, 315, 50);
    blushL.addColorStop(0, 'rgba(236, 72, 153, 0.55)');
    blushL.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = blushL;
    ctx.beginPath();
    ctx.arc(150, 315, 50, 0, Math.PI * 2);
    ctx.fill();

    const blushR = ctx.createRadialGradient(362, 315, 6, 362, 315, 50);
    blushR.addColorStop(0, 'rgba(236, 72, 153, 0.55)');
    blushR.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = blushR;
    ctx.beginPath();
    ctx.arc(362, 315, 50, 0, Math.PI * 2);
    ctx.fill();

    // Big expressive sparkling eyes with curved lashes
    const drawGirlEye = (cx: number, cy: number, flip: boolean) => {
      ctx.save();
      // White eye
      ctx.beginPath();
      ctx.ellipse(cx, cy, 52, 60, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1e1b4b';
      ctx.stroke();

      // Vibrant violet/emerald magical iris
      const iris = ctx.createRadialGradient(cx, cy - 6, 10, cx, cy, 36);
      iris.addColorStop(0, '#c084fc');
      iris.addColorStop(0.5, '#7c3aed');
      iris.addColorStop(1, '#2e1065');
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fillStyle = iris;
      ctx.fill();

      // Pupil with subtle heart glow
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#0f051d';
      ctx.fill();

      // Double highlights
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 14, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 14, cy + 10, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Dramatic eyelashes
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 53, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#1e1b4b';
      ctx.stroke();

      // Eyelash wings
      const wingDir = flip ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx + wingDir * 45, cy - 18);
      ctx.lineTo(cx + wingDir * 62, cy - 28);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1e1b4b';
      ctx.stroke();

      // Eyebrow
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 42, Math.PI * 1.25, Math.PI * 1.75);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#581c87';
      ctx.stroke();
      ctx.restore();
    };

    drawGirlEye(165, 235, false);
    drawGirlEye(347, 235, true);

    // Dainty nose
    ctx.beginPath();
    ctx.arc(256, 305, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    // Sweet beaming smile
    ctx.beginPath();
    ctx.arc(256, 335, 34, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.fillStyle = '#be123c';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(256, 330, 24, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}

export function getRobotVisorTexture(blink = false): THREE.CanvasTexture {
  const key = `robot_screen_${blink ? 'blink' : 'open'}`;
  return createCachedCanvasTexture(key, 512, 256, (ctx, w, h) => {
    // Deep glossy OLED black screen
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Subtle CRT scanline effect
    ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }

    // Outer cyber screen border
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Glowing Neon Cyan Eyes
    const glowColor = '#38bdf8';
    const coreColor = '#e0f2fe';

    const drawRobotEye = (cx: number, cy: number) => {
      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 24;

      if (blink) {
        // Cheerful curved arc (happy blink)
        ctx.beginPath();
        ctx.arc(cx, cy + 10, 40, Math.PI * 1.2, Math.PI * 1.8);
        ctx.lineWidth = 14;
        ctx.strokeStyle = glowColor;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.lineWidth = 8;
        ctx.strokeStyle = coreColor;
        ctx.stroke();
      } else {
        // Expressive bright robotic ring eye with central pupil
        ctx.beginPath();
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#042f2e';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = coreColor;
        ctx.fill();

        // Eye corner LED indicators
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(cx - 32, cy - 42, 10, 4);
        ctx.fillRect(cx + 22, cy - 42, 10, 4);
      }
      ctx.restore();
    };

    drawRobotEye(160, 128);
    drawRobotEye(352, 128);

    // Digital smile waveform in center
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 175, 24, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.restore();
  });
}

// ==========================================
// 2. FABRIC & OUTFIT TEXTURES (PBR PATTERNS)
// ==========================================

export function getAthleticFabricTexture(baseHex: string): THREE.CanvasTexture {
  return createCachedCanvasTexture(`fabric_athletic_${baseHex}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, w, h);

    // Micro honeycomb breathable sports mesh pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 0; x < w; x += 8) {
      for (let y = 0; y < h; y += 8) {
        ctx.beginPath();
        ctx.arc(x + 4, y + ((x / 8) % 2 === 0 ? 0 : 4), 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sport racing dual stripes on side
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 0, 12, h);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(36, 0, 6, h);
  });
}

export function getExplorerLeatherTexture(): THREE.CanvasTexture {
  return createCachedCanvasTexture('explorer_leather', 256, 256, (ctx, w, h) => {
    // Rich khaki safari fabric with stitch lines
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(0, 0, w, h);

    // Crossweave fabric texture
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < w; i += 4) {
      ctx.fillRect(i, 0, 1, h);
      ctx.fillRect(0, i, w, 1);
    }

    // Explorer Utility pockets & yellow-gold compass insignia
    ctx.fillStyle = '#a67c52';
    ctx.fillRect(30, 40, 70, 70);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 40, 70, 70);

    // Compass star
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(65, 75, 12, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function getSciFiArmorTexture(): THREE.CanvasTexture {
  return createCachedCanvasTexture('scifi_armor', 256, 256, (ctx, w, h) => {
    // Dark cyber carbon fiber base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Hexagonal cyber plating
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    const hexSize = 24;
    for (let y = 0; y < h + hexSize; y += hexSize * 1.5) {
      for (let x = 0; x < w + hexSize; x += hexSize * 1.732) {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 3) * a;
          const px = x + hexSize * Math.cos(angle);
          const py = y + hexSize * Math.sin(angle);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Glowing cyan cyber power traces
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 80);
    ctx.lineTo(80, 130);
    ctx.lineTo(80, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(128, 80);
    ctx.lineTo(176, 130);
    ctx.lineTo(176, 256);
    ctx.stroke();
  });
}

// ==========================================
// 3. TERRAIN, MOUNTAIN & CASTLE TEXTURES
// ==========================================

export function getStylizedGrassTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('stylized_grass', 512, 512, (ctx, w, h) => {
    // Lush emerald green base
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, w, h);

    // Soft organic tonal patches
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 20 + Math.random() * 60;
      const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.4)');
      grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clover tufts & flower petals
    for (let f = 0; f < 80; f++) {
      const fx = Math.random() * w;
      const fy = Math.random() * h;
      ctx.fillStyle = f % 3 === 0 ? '#fde047' : f % 3 === 1 ? '#f43f5e' : '#ffffff';
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  tex.repeat.set(8, 8);
  return tex;
}

export function getMountainCliffTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('mountain_cliff', 512, 512, (ctx, w, h) => {
    // Slate geological strata
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, w, h);

    // Horizontal rock sedimentary strata bands
    for (let y = 0; y < h; y += 12 + Math.random() * 16) {
      const shade = Math.floor(60 + Math.random() * 50);
      ctx.fillStyle = `rgb(${shade}, ${shade + 8}, ${shade + 18})`;
      ctx.fillRect(0, y, w, 8 + Math.random() * 12);

      // Cracks and stone fissures
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y + 5);
      for (let x = 0; x < w; x += 30) {
        ctx.lineTo(x, y + 5 + (Math.random() - 0.5) * 8);
      }
      ctx.stroke();
    }

    // Moss highlights on ledge crevices
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
    for (let m = 0; m < 25; m++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 30 + Math.random() * 40, 8);
    }
  });
  tex.repeat.set(4, 4);
  return tex;
}

export function getCastleBrickTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('castle_brick', 512, 512, (ctx, w, h) => {
    // Ashlar masonry light stone
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, w, h);

    const brickH = 32;
    const brickW = 64;

    for (let y = 0; y < h; y += brickH) {
      const row = Math.floor(y / brickH);
      const offsetX = (row % 2) * (brickW / 2);

      for (let x = -brickW; x < w + brickW; x += brickW) {
        const bx = x + offsetX;
        // Individual stone color variance
        const val = 140 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgb(${val}, ${val + 5}, ${val + 10})`;
        ctx.fillRect(bx + 2, y + 2, brickW - 4, brickH - 4);

        // Mortar shadow
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, y, brickW, brickH);
      }
    }
  });
  tex.repeat.set(2, 2);
  return tex;
}

export function getCobblestonePathTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('cobblestone_path', 512, 512, (ctx, w, h) => {
    // Earthy mortar background
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, w, h);

    // Rounded river pebbles / flagstones
    for (let py = 16; py < h; py += 32) {
      for (let px = 16; px < w; px += 32) {
        const cx = px + (Math.random() - 0.5) * 8;
        const cy = py + (Math.random() - 0.5) * 8;
        const rx = 12 + Math.random() * 4;
        const ry = 10 + Math.random() * 4;

        const stoneTone = 170 + Math.floor(Math.random() * 50);
        ctx.fillStyle = `rgb(${stoneTone}, ${stoneTone - 10}, ${stoneTone - 25})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 3D highlight top edge
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, rx - 3, Math.PI * 1.1, Math.PI * 1.8);
        ctx.stroke();
      }
    }
  });
  tex.repeat.set(6, 2);
  return tex;
}

export function getRunePlatformTexture(status: 'completed' | 'current' | 'locked'): THREE.CanvasTexture {
  const key = `rune_platform_${status}`;
  return createCachedCanvasTexture(key, 512, 512, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;

    // Dark polished obsidian / carved stone dais
    ctx.fillStyle = status === 'completed' ? '#064e3b' : status === 'current' ? '#451a03' : '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 10, 0, Math.PI * 2);
    ctx.fill();

    // Concentric magic circles
    const ringColor =
      status === 'completed' ? '#10b981' : status === 'current' ? '#f59e0b' : '#64748b';
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 60, 0, Math.PI * 2);
    ctx.stroke();

    // Ancient runic / mathematical glyph markings around ring
    ctx.fillStyle = ringColor;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const glyphs = ['∑', 'π', 'λ', 'Ω', '∆', '∫', '∞', '√', '≈', '≠', '⚡', '★'];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const gx = cx + Math.cos(angle) * (cx - 48);
      const gy = cy + Math.sin(angle) * (cx - 48);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(glyphs[i], 0, 0);
      ctx.restore();
    }

    // Inner glowing core emblem
    const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, cx - 75);
    coreGrad.addColorStop(
      0,
      status === 'completed'
        ? 'rgba(52, 211, 153, 0.9)'
        : status === 'current'
        ? 'rgba(251, 191, 36, 0.95)'
        : 'rgba(100, 116, 139, 0.4)'
    );
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 75, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Realistic 3D Eyeball Iris texture with radial striae, limbal ring, and dark pupil
 */
export function getRealisticIrisTexture(irisColor = '#0284c7'): THREE.CanvasTexture {
  return createCachedCanvasTexture(`iris_${irisColor}`, 256, 256, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 4;

    // Dark limbal ring
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Iris base radial gradient
    const grad = ctx.createRadialGradient(cx, cy, 15, cx, cy, r - 4);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.35, irisColor);
    grad.addColorStop(0.85, '#0c4a6e');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
    ctx.fill();

    // Radial striae / muscle fibers
    ctx.save();
    ctx.translate(cx, cy);
    for (let a = 0; a < 64; a++) {
      ctx.rotate((Math.PI * 2) / 64);
      ctx.strokeStyle = a % 2 === 0 ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(r - 6, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Deep black pupil
    ctx.fillStyle = '#050508';
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();

    // Bright primary catchlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Soft secondary catchlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(cx + 18, cy + 14, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Dressing Room 360 Pedestal Texture
 */
export function getWardrobePedestalTexture(): THREE.CanvasTexture {
  return createCachedCanvasTexture('wardrobe_pedestal', 512, 512, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;

    // Dark sleek high-tech marble finish
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Glowing concentric rings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, 210, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 160, 0, Math.PI * 2);
    ctx.stroke();

    // 12 glowing tick marks
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 12; i++) {
      const rad = (Math.PI * 2 * i) / 12;
      const tx = cx + Math.cos(rad) * 185;
      const ty = cy + Math.sin(rad) * 185;
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central circular ambient glow
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Warm golden sandy beach texture with delicate wind/water ripples
 */
export function getSandBeachTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('sand_beach', 512, 512, (ctx, w, h) => {
    // Warm golden sand tone
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(0, 0, w, h);

    // Subtle grain and ripples
    for (let y = 0; y < h; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? 'rgba(217, 119, 6, 0.12)' : 'rgba(254, 240, 138, 0.2)';
      ctx.fillRect(0, y, w, 4);
    }

    // Micro specks and crushed shells
    for (let s = 0; s < 120; s++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      ctx.fillStyle = s % 4 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(180, 83, 9, 0.25)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  tex.repeat.set(4, 4);
  return tex;
}

/**
 * Rustic wooden planks for bridges, docks, and walkways
 */
export function getWoodPlankTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('wood_planks', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, w, h);

    const plankH = 48;
    for (let y = 0; y < h; y += plankH) {
      // Grain gradient
      const tone = 120 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${tone}, ${tone - 40}, ${tone - 75})`;
      ctx.fillRect(2, y + 2, w - 4, plankH - 4);

      // Wood grain streaks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let g = 0; g < 6; g++) {
        ctx.fillRect(0, y + 6 + g * 7, w, 1.5);
      }

      // Dark seam between planks
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, y, w, 3);

      // Iron nails on edges
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(24, y + plankH / 2, 3, 0, Math.PI * 2);
      ctx.arc(w - 24, y + plankH / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  tex.repeat.set(2, 4);
  return tex;
}

/**
 * Directional wooden signpost plate texture with crisp label
 */
export function getSignboardTexture(title: string, subtitle: string, icon = '📍'): THREE.CanvasTexture {
  const key = `signboard_${title}_${subtitle}`;
  return createCachedCanvasTexture(key, 512, 256, (ctx, w, h) => {
    // Rich carved timber plank
    ctx.fillStyle = '#5c2d12';
    ctx.fillRect(0, 0, w, h);

    // Beveled border
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(16, 16, w - 32, h - 32);

    // Icon & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${icon} ${title}`, w / 2, h / 2 - 25);

    // Subtitle
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 24px "Nunito", sans-serif';
    ctx.fillText(subtitle, w / 2, h / 2 + 35);
  });
}

/**
 * Gothic stained glass castle window with stone tracery and warm golden-amber interior glow
 */
export function getCastleWindowTexture(): THREE.CanvasTexture {
  return createCachedCanvasTexture('castle_window', 256, 512, (ctx, w, h) => {
    // Dark stone casing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Arched stained glass aperture
    ctx.beginPath();
    ctx.moveTo(32, h - 32);
    ctx.lineTo(32, 160);
    ctx.bezierCurveTo(32, 40, w - 32, 40, w - 32, 160);
    ctx.lineTo(w - 32, h - 32);
    ctx.closePath();

    // Warm luminous golden-amber interior glow
    const glow = ctx.createLinearGradient(0, 40, 0, h - 32);
    glow.addColorStop(0, '#fef08a');
    glow.addColorStop(0.4, '#f59e0b');
    glow.addColorStop(0.8, '#d97706');
    glow.addColorStop(1, '#92400e');
    ctx.fillStyle = glow;
    ctx.fill();

    // Stone tracery and lead came mullions
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Diamond leaded lattice panes
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    for (let y = 60; y < h - 30; y += 32) {
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(w - 32, y + 24);
      ctx.moveTo(w - 32, y);
      ctx.lineTo(32, y + 24);
      ctx.stroke();
    }
  });
}

/**
 * Faceted shimmering magical crystal texture with emissive glow
 */
export function getCrystalTexture(hexColor = '#8b5cf6'): THREE.CanvasTexture {
  const key = `crystal_${hexColor}`;
  return createCachedCanvasTexture(key, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, w, h);

    // Facet lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(128, 0);
    ctx.lineTo(256, 128);
    ctx.lineTo(128, 256);
    ctx.closePath();
    ctx.stroke();

    // Inner bright specular highlight
    const radial = ctx.createRadialGradient(128, 128, 5, 128, 128, 110);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    radial.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);
  });
}

/**
 * Animated water ripples and foam texture
 */
export function getWaterFoamTexture(): THREE.CanvasTexture {
  const tex = createCachedCanvasTexture('water_foam', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, w, h);

    // Soft cellular foam patterns
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const r = 12 + Math.random() * 28;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Specular sparkles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let s = 0; s < 60; s++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  tex.repeat.set(4, 4);
  return tex;
}


