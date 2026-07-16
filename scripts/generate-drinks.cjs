const fs = require('fs');
const path = require('path');

const drinks = [
  {
    filename: 'sparkling-water.png',
    name: 'Sparkling Soda & Lime',
    bgStart: '#00d2ff',
    bgEnd: '#004c8c',
    emoji: '🫧🍋',
    badge: 'CRYSTAL CLEAR ENERGY',
    subText: 'THAI SODA SPECIAL'
  },
  {
    filename: 'tropical-smoothie.png',
    name: 'Tropical Mango Smoothie',
    bgStart: '#ffde59',
    bgEnd: '#ff5722',
    emoji: '🥭🥥',
    badge: 'SUNSET ELIXIR',
    subText: 'STREET FRUIT MIX'
  },
  {
    filename: 'dark-espresso.png',
    name: 'Midnight Oliang Espresso',
    bgStart: '#2d1b14',
    bgEnd: '#0d0705',
    emoji: '☕🌶️',
    badge: 'CYBER AWAKENING',
    subText: 'SIAM COFFEE ROAST'
  }
];

const createSvg = (drink) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="grad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${drink.bgStart}" />
      <stop offset="100%" stop-color="${drink.bgEnd}" />
    </radialGradient>
    <pattern id="halftone" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="3" fill="#000000" opacity="0.25" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="500" height="500" rx="30" fill="url(#grad)" stroke="#1a1a1a" stroke-width="14" />
  <rect width="500" height="500" rx="30" fill="url(#halftone)" />

  <!-- Action lines radiating outward -->
  <g stroke="#ffffff" stroke-width="4" opacity="0.15">
    <line x1="250" y1="250" x2="0" y2="0" />
    <line x1="250" y1="250" x2="250" y2="0" />
    <line x1="250" y1="250" x2="500" y2="0" />
    <line x1="250" y1="250" x2="500" y2="250" />
    <line x1="250" y1="250" x2="500" y2="500" />
    <line x1="250" y1="250" x2="250" y2="500" />
    <line x1="250" y1="250" x2="0" y2="500" />
    <line x1="250" y1="250" x2="0" y2="250" />
  </g>

  <!-- Comic Badge Top -->
  <g transform="translate(250, 60) rotate(-3)">
    <rect x="-140" y="-24" width="280" height="48" rx="8" fill="#ff1616" stroke="#1a1a1a" stroke-width="5" />
    <text x="0" y="8" font-family="'Impact', 'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">${drink.badge}</text>
  </g>

  <!-- Giant Center Emoji / Illustration -->
  <g transform="translate(250, 240)">
    <circle r="110" fill="#ffffff" stroke="#1a1a1a" stroke-width="8" opacity="0.9" />
    <text x="0" y="30" font-size="110" text-anchor="middle">${drink.emoji}</text>
  </g>

  <!-- Comic Title Banner Bottom -->
  <g transform="translate(250, 410) rotate(2)">
    <rect x="-180" y="-35" width="360" height="70" rx="12" fill="#ffde59" stroke="#1a1a1a" stroke-width="6" />
    <text x="0" y="12" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#1a1a1a" text-anchor="middle" letter-spacing="2">${drink.subText}</text>
  </g>
</svg>`;

const outDirs = [
  path.join(__dirname, '../public/images/drinks'),
  path.join(__dirname, '../client/public/images/drinks')
];

outDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  drinks.forEach((drink) => {
    const svgContent = createSvg(drink);
    const filePathPng = path.join(dir, drink.filename);
    const filePathSvg = path.join(dir, drink.filename.replace('.png', '.svg'));
    fs.writeFileSync(filePathPng, svgContent, 'utf8');
    fs.writeFileSync(filePathSvg, svgContent, 'utf8');
    console.log(`Generated: ${filePathPng}`);
  });
});
