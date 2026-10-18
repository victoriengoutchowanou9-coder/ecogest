const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Générer le fichier SVG vectoriel parfait
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="ecogestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="50%" stop-color="#0f2b5c" />
      <stop offset="100%" stop-color="#091b3a" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background Rounded Rect -->
  <rect width="512" height="512" rx="112" fill="url(#ecogestGrad)" />

  <!-- Subtle Inner Border -->
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="6" />

  <!-- Brand Symbol 'E' with Graduation/Tech Accent -->
  <g filter="url(#shadow)" transform="translate(106, 86)">
    <!-- Main Emblem 'E' -->
    <path d="M 40 40 L 260 40 L 260 95 L 115 95 L 115 145 L 235 145 L 235 195 L 115 195 L 115 245 L 260 245 L 260 300 L 40 300 Z" fill="#ffffff" />
    
    <!-- Modern Cyan/Blue Accent Bar -->
    <rect x="40" y="318" width="220" height="18" rx="9" fill="url(#accentGrad)" />

    <!-- Small Sparkle / Graduation Accent Top Right -->
    <circle cx="260" cy="50" r="14" fill="#38bdf8" />
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent, 'utf8');
console.log('Created icon.svg');

// 2. Encodeur PNG pur en Node.js (sans dépendance externe)
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xEDB88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcPayload = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(crcPayload), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePngBuffer(width, height, isMaskable = false) {
  // Signature PNG
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines RGBA
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;

  // Couleurs de base ECOGEST : #0F2B5C (15, 43, 92) et Accent #2563EB (37, 99, 235)
  // Blanc pour 'E' : (255, 255, 255)
  const cornerRadius = isMaskable ? 0 : width * 0.22;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // No filter for this scanline

    const ny = y / height;

    for (let x = 0; x < width; x++) {
      const nx = x / width;

      // Vérifier si le pixel est dans les coins arrondis
      let inCorner = false;
      if (!isMaskable) {
        if (x < cornerRadius && y < cornerRadius) {
          const dx = cornerRadius - x;
          const dy = cornerRadius - y;
          if (dx * dx + dy * dy > cornerRadius * cornerRadius) inCorner = true;
        } else if (x >= width - cornerRadius && y < cornerRadius) {
          const dx = x - (width - cornerRadius);
          const dy = cornerRadius - y;
          if (dx * dx + dy * dy > cornerRadius * cornerRadius) inCorner = true;
        } else if (x < cornerRadius && y >= height - cornerRadius) {
          const dx = cornerRadius - x;
          const dy = y - (height - cornerRadius);
          if (dx * dx + dy * dy > cornerRadius * cornerRadius) inCorner = true;
        } else if (x >= width - cornerRadius && y >= height - cornerRadius) {
          const dx = x - (width - cornerRadius);
          const dy = y - (height - cornerRadius);
          if (dx * dx + dy * dy > cornerRadius * cornerRadius) inCorner = true;
        }
      }

      if (inCorner) {
        // Transparent outside rounded corner
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      // Dessin de la lettre 'E'
      // Zone de la lettre 'E' (ajustée à 20% - 80% en x, 22% - 78% en y)
      const ex = (x - width * 0.22) / (width * 0.56);
      const ey = (y - height * 0.20) / (height * 0.60);

      let isE = false;
      if (ex >= 0 && ex <= 1 && ey >= 0 && ey <= 1) {
        // Colonne verticale gauche
        if (ex <= 0.26 && ey >= 0 && ey <= 0.88) isE = true;
        // Barre supérieure
        if (ey <= 0.18 && ex >= 0 && ex <= 1.0) isE = true;
        // Barre médiane
        if (ey >= 0.35 && ey <= 0.52 && ex >= 0 && ex <= 0.85) isE = true;
        // Barre inférieure
        if (ey >= 0.70 && ey <= 0.88 && ex >= 0 && ex <= 1.0) isE = true;
      }

      // Barre d'accent cyan/bleu sous le E
      let isAccent = false;
      if (ex >= 0 && ex <= 1 && ey >= 0.93 && ey <= 0.99) {
        isAccent = true;
      }

      // Point cyan distinctif en haut à droite
      let isDot = false;
      const dotX = width * 0.78;
      const dotY = height * 0.26;
      const dotR = width * 0.045;
      const ddx = x - dotX;
      const ddy = y - dotY;
      if (ddx * ddx + ddy * ddy <= dotR * dotR) {
        isDot = true;
      }

      if (isDot || isAccent) {
        // Cyan / Sky Blue accent #38BDF8 -> #2563EB
        rawData[offset++] = 56;
        rawData[offset++] = 189;
        rawData[offset++] = 248;
        rawData[offset++] = 255;
      } else if (isE) {
        // Blanc pur
        rawData[offset++] = 255;
        rawData[offset++] = 255;
        rawData[offset++] = 255;
        rawData[offset++] = 255;
      } else {
        // Dégradé de fond bleu marine officiel ECOGEST #1E3A8A -> #0F2B5C -> #091B3A
        const r = Math.round(30 - ny * 20);
        const g = Math.round(58 - ny * 30);
        const b = Math.round(138 - ny * 80);
        rawData[offset++] = Math.max(12, Math.min(255, r));
        rawData[offset++] = Math.max(30, Math.min(255, g));
        rawData[offset++] = Math.max(70, Math.min(255, b));
        rawData[offset++] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 3. Générer les différentes résolutions requises
const p192 = generatePngBuffer(192, 192, false);
fs.writeFileSync(path.join(outDir, 'icon-192x192.png'), p192);
console.log('Created icon-192x192.png');

const p512 = generatePngBuffer(512, 512, false);
fs.writeFileSync(path.join(outDir, 'icon-512x512.png'), p512);
console.log('Created icon-512x512.png');

const pMaskable = generatePngBuffer(512, 512, true);
fs.writeFileSync(path.join(outDir, 'icon-maskable-512x512.png'), pMaskable);
console.log('Created icon-maskable-512x512.png');

const pApple = generatePngBuffer(180, 180, false);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), pApple);
console.log('Created apple-touch-icon.png');

// Copier également vers favicon.png
fs.writeFileSync(path.join(outDir, 'favicon.png'), p192);
console.log('All PWA icons generated successfully.');
