// Generates all Nutrivue app icons from the chosen "Variation D" design:
// a teal "N" monogram with a white leaf on a dark navy background.
// Run:  node scripts/make-icon.js
const sharp = require('sharp');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets');
const TEAL = '#2DD4BF';
const NAVY = '#0F172A';
const VEIN = '#0F766E';

// The N + leaf mark, drawn in a 0..120 coordinate space.
// bbox is roughly x:37-98, y:27-84  -> center (67.5, 55.5)
function symbol(mono) {
  const n = mono || TEAL;
  const leaf = mono || '#ffffff';
  return `
    <rect x="37" y="36" width="9" height="48" rx="2.5" fill="${n}"/>
    <rect x="74" y="36" width="9" height="48" rx="2.5" fill="${n}"/>
    <polygon points="46,36 55,36 83,84 74,84" fill="${n}"/>
    <path d="M78 34 C 89 27 98 32 95 43 C 86 47 79 42 78 34 Z" fill="${leaf}"/>
    ${mono ? '' : `<path d="M81 40 C 85 36 90 33 94 33" stroke="${VEIN}" stroke-width="2" fill="none" stroke-linecap="round"/>`}
  `;
}

// Center the mark on the canvas and scale it.
function centered(scale, mono) {
  return `<g transform="translate(60,60) scale(${scale}) translate(-67.5,-55.5)">${symbol(mono)}</g>`;
}

function doc(size, inner, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">${
    bg ? `<rect width="120" height="120" fill="${bg}"/>` : ''
  }${inner}</svg>`;
}

async function png(size, inner, bg, file) {
  await sharp(Buffer.from(doc(size, inner, bg))).png().toFile(path.join(dir, file));
  console.log('  wrote', file);
}

(async () => {
  // Main app icon (iOS rounds the corners itself; Android legacy uses as-is)
  await png(1024, centered(0.92), NAVY, 'icon.png');
  // Android adaptive foreground: transparent, mark inside the safe zone.
  // (app.json sets adaptiveIcon.backgroundColor to navy)
  await png(1024, centered(0.62), null, 'adaptive-icon.png');
  // Splash: mark centered on navy
  await png(1200, centered(0.5), NAVY, 'splash.png');
  // Notification icon: white silhouette on transparent (Android tints it)
  await png(96, centered(0.72, '#ffffff'), null, 'notification-icon.png');
  // Web favicon
  await png(48, centered(0.92), NAVY, 'favicon.png');
  console.log('All icons generated from Variation D.');
})();
