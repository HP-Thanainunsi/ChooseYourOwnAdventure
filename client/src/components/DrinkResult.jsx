/**
 * DrinkResult.jsx — Full-Page Comic Book Splash Page & 3D Interactive Reveal
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   result    { drink: { id, name, description, image_url, abv, sweetness, location_id, location },
 *               location: { id, name, address, latitude, longitude, google_maps_link },
 *               totalScore: number }
 *   onRestart () => void
 *
 * Design & Interactions:
 *   1. 3D Interactive Reveal: Rises from bottom (`y: 380, opacity: 0, scale: 0.6` → `y: 0`)
 *      with fluid 3D spring physics (`useMotionValue`, `useSpring`, `useTransform`)
 *      that tilts the entire drink profile panel dynamically with mouse movement.
 *   2. The Drink Profile: Customized drink panel matching user selections,
 *      styled with jagged pop-art frame, Ben-Day halftone dots, comic narration log,
 *      ABV '💥 BAM!' bubbles, and Thai spicy chili icons (🌶️).
 *   3. The Destination Ticket ('Secret Coordinates'): Designed as a classified retro
 *      VIP ticket displaying the bar's name, Lat/Lon coordinates (`13.7388° N, 100.5144° E`),
 *      address, and a neon-glowing 'NAVIGATE' button (`target="_blank"`).
 *   4. Comic Splash Page Aesthetic: Radiating action lines (`ActionLinesBackground`),
 *      Chonburi 3D title extrusion, and sound effect stickers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import FinalDestination from './FinalDestination';

// ─── Per-Drink Comic Themes ───────────────────────────────────────────────────
const COMIC_THEMES = {
  'Sparkling Water': {
    primary:     '#00f5ff',
    secondary:   '#ffde00',
    accent:      '#ff007f',
    bgStart:     '#003b46',
    bgEnd:       '#07575b',
    emoji:       '💧',
    titleBadge:  'ISSUE #01 • THE PURE AWAKENING',
    soundText:   'SPLASH!',
    character:   'THE CRYSTAL SIPPER',
  },
  'Tropical Smoothie': {
    primary:     '#ff2a85',
    secondary:   '#00e5ff',
    accent:      '#ffd700',
    bgStart:     '#4a001f',
    bgEnd:       '#1f0030',
    emoji:       '🍹',
    titleBadge:  'ISSUE #02 • SUNSHINE OVERDRIVE',
    soundText:   'KA-POW!',
    character:   'THE TROPICAL HERO',
  },
  'Dark Espresso': {
    primary:     '#ffae00',
    secondary:   '#ff3b00',
    accent:      '#00e5ff',
    bgStart:     '#2b1100',
    bgEnd:       '#110500',
    emoji:       '☕',
    titleBadge:  'ISSUE #03 • MIDNIGHT TURBO',
    soundText:   'ZAP-BOOM!',
    character:   'THE CAFFEINE TITAN',
  },
};

const DEFAULT_COMIC_THEME = {
  primary:     '#38b6ff',
  secondary:   '#ffde59',
  accent:      '#ff1616',
  bgStart:     '#0e1b2c',
  bgEnd:       '#050811',
  emoji:       '🥂',
  titleBadge:  'SPECIAL EDITION • SPIRIT UNLEASHED',
  soundText:   'BAM-ZOOM!',
  character:   'THE LEGENDARY MIX',
};

// ─── Jagged Action Frame Polygon ──────────────────────────────────────────────
const JAGGED_POLYGON =
  'polygon(50% 0%, 58% 12%, 73% 3%, 75% 18%, 93% 14%, 86% 29%, 100% 38%, 88% 50%, 100% 62%, 86% 71%, 93% 86%, 75% 82%, 73% 97%, 58% 88%, 50% 100%, 42% 88%, 27% 97%, 25% 82%, 7% 86%, 14% 71%, 0% 62%, 12% 50%, 0% 38%, 14% 29%, 7% 14%, 25% 18%, 27% 3%, 42% 12%)';

const INNER_JAGGED_POLYGON =
  'polygon(50% 3%, 57% 14%, 71% 6%, 73% 20%, 90% 17%, 84% 31%, 97% 39%, 86% 50%, 97% 61%, 84% 69%, 90% 83%, 73% 80%, 71% 94%, 57% 86%, 50% 97%, 43% 86%, 29% 94%, 27% 80%, 10% 83%, 16% 69%, 3% 61%, 14% 50%, 3% 39%, 16% 31%, 10% 17%, 27% 20%, 29% 6%, 43% 14%)';

// ─── SVG Speed / Action Lines Background ──────────────────────────────────────
function ActionLinesBackground({ color = '#ffd700' }) {
  const lines = Array.from({ length: 24 }, (_, i) => {
    const angle1 = (i * 15 * Math.PI) / 180;
    const angle2 = ((i * 15 + 6) * Math.PI) / 180;
    const r = 100;
    const x1 = 60 + r * Math.cos(angle1);
    const y1 = 60 + r * Math.sin(angle1);
    const x2 = 60 + r * Math.cos(angle2);
    const y2 = 60 + r * Math.sin(angle2);
    return `60,60 ${x1},${y1} ${x2},${y2}`;
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full object-cover origin-center"
        preserveAspectRatio="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <g opacity="0.18">
          {lines.map((pts) => (
            <polygon key={pts} points={pts} fill={color} />
          ))}
        </g>
      </motion.svg>
      {/* Halftone Dot Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.35) 1.8px, transparent 1.8px)`,
          backgroundSize: '12px 12px',
        }}
      />
    </div>
  );
}

// ─── Main Comic Splash Page Component ─────────────────────────────────────────
export default function DrinkResult({ result, onRestart }) {
  const [copied, setCopied] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);

  // Mouse tracking values for 3D spring tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [14, -14]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-14, 14]), {
    stiffness: 260,
    damping: 24,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const drink = result?.drink ?? {
    name:        'Legendary Spirit',
    description: 'An electrifying concoction brewed from the cosmic depths of flavour!',
    image_url:   null,
    abv:         4,
    sweetness:   4,
  };

  const location = result?.location ?? result?.drink?.location ?? {
    name:             'Teens of Thailand',
    address:          '76 Soi Nana, Charoen Krung Rd, Pom Prap, Bangkok 10100',
    latitude:         13.7388,
    longitude:        100.5144,
    google_maps_link: 'https://maps.app.goo.gl/TeensOfThailandBangkok',
  };

  const theme = COMIC_THEMES[drink.name] ?? DEFAULT_COMIC_THEME;

  const abvScore       = Math.max(1, Math.min(5, Number(drink.abv ?? 3)));
  const sweetnessScore = Math.max(1, Math.min(5, Number(drink.sweetness ?? 3)));

  // Comic sound effect bubbles for ABV ratings
  const BAM_BUBBLES = ['POW!', 'ZAP!', 'BAM!', 'BOOM!', 'CRASH!'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `💥 My Spirit Drink is ${drink.name}! Meet me at ${location?.name} in Bangkok! 🥂`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    }
  };

  if (showCinematic) {
    return (
      <FinalDestination
        drinkImage={drink?.image_url || '/images/drinks/tropical-smoothie.png'}
        drinkName={drink?.name || 'THE BANGKOK ALCHEMIST'}
        storyText={drink?.description || 'ค่ำคืนอันยาวนานสิ้นสุดลงที่นี่... สปิริตของคุณตรงกับความเย้ายวน ลึกลับ และเต็มไปด้วยชีวิตชีวาของมหานครที่ไม่เคยหลับใหล'}
        barName={location?.name || 'HIDDEN SPEAKEASY'}
        googleMapsUrl={location?.google_maps_link || `https://maps.google.com/?q=${encodeURIComponent(location?.name || '')}`}
        onRestart={onRestart}
      />
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-8 overflow-x-hidden select-none"
      style={{
        background: `radial-gradient(circle at 50% 40%, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
        perspective: '1400px',
      }}
    >
      {/* Dynamic Radiating Action Lines */}
      <ActionLinesBackground color={theme.secondary} />

      {/* Comic Corner Crop Marks & Issue Stamp */}
      <div className="absolute top-3 left-3 md:top-5 md:left-5 z-20 pointer-events-none flex items-center gap-2">
        <div className="bg-[#1a1a1a] text-white px-2.5 py-1 border-2 border-white font-['Bangers'] tracking-wider text-xs md:text-sm shadow-[3px_3px_0_#ffde59]">
          COMIC SPLASH PAGE
        </div>
      </div>
      <div className="absolute top-3 right-3 md:top-5 md:right-5 z-20 pointer-events-none">
        <div className="bg-[#ff1616] text-white px-3 py-1 border-2 border-[#1a1a1a] font-['Bangers'] tracking-widest text-xs md:text-sm rotate-3 shadow-[3px_3px_0_#1a1a1a]">
          {theme.titleBadge}
        </div>
      </div>

      {/* ─── TOP HEADER / COMIC BANNER ────────────────────────────────────── */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-10"
      >
        <div className="relative inline-block px-4 py-2">
          {/* 3D Pop-Art Extruded Title */}
          <h1
            className="font-['Chonburi'] text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase tracking-wider leading-none"
            style={{
              textShadow: `
                2px 2px 0 #1a1a1a,
                4px 4px 0 #1a1a1a,
                6px 6px 0 ${theme.primary},
                8px 8px 0 #1a1a1a,
                11px 11px 0 ${theme.secondary},
                14px 14px 0 #1a1a1a,
                18px 18px 20px rgba(0,0,0,0.8)
              `,
              transform: 'rotate(-2deg)',
            }}
          >
            {drink.name}
          </h1>

          {/* Sound Effect Badge overlaying title */}
          <motion.div
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: [0, 1.3, 1], rotate: [20, -12, -8] }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute -top-4 -right-4 md:-top-6 md:-right-8 z-20 bg-[#ff1616] text-white font-['Bangers'] text-lg md:text-2xl px-3 py-1 border-3 border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] tracking-widest"
          >
            {theme.soundText}
          </motion.div>
        </div>

        {/* Character Title Cutout */}
        <div className="bg-white text-[#1a1a1a] font-['Bangers'] text-xs md:text-sm tracking-[0.25em] px-3 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
          HERO ALIAS: {theme.character}
        </div>
      </motion.div>

      {/* ─── 3D INTERACTIVE REVEAL CONTAINER (DRINK PROFILE PANEL) ─────────── */}
      <motion.div
        initial={{ y: 380, opacity: 0, scale: 0.6 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.15 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 w-full max-w-4xl my-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10"
      >
        {/* Jagged Comic-Style Action Frame (`translateZ(40px)`) */}
        <motion.div
          style={{ transform: 'translateZ(40px)' }}
          className="relative flex-shrink-0 flex items-center justify-center w-[250px] h-[250px] sm:w-[280px] sm:h-[280px]"
        >
          {/* Outer Jagged Shadow */}
          <div
            className="absolute inset-0 bg-[#1a1a1a]"
            style={{
              clipPath: JAGGED_POLYGON,
              transform: 'translate(6px, 8px) scale(1.03)',
            }}
          />

          {/* Outer Jagged Starburst Background */}
          <div
            className="absolute inset-0 bg-white"
            style={{ clipPath: JAGGED_POLYGON }}
          />

          {/* Inner Jagged Frame with Color & Halftone */}
          <div
            className="absolute inset-[6px] flex items-center justify-center overflow-hidden"
            style={{
              clipPath: INNER_JAGGED_POLYGON,
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            }}
          >
            {/* Ben-Day Dots inside frame */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #000 2px, transparent 2px)`,
                backgroundSize: '10px 10px',
              }}
            />

            {/* Drink Image or High-Impact Comic Illustration */}
            {drink.image_url ? (
              <img
                src={drink.image_url}
                alt={drink.name}
                className="w-4/5 h-4/5 object-contain z-10 filter drop-shadow-[4px_6px_0_rgba(0,0,0,0.6)]"
              />
            ) : (
              <motion.div
                animate={{ rotate: [-4, 4, -4], scale: [0.98, 1.05, 0.98] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex flex-col items-center justify-center"
              >
                <span className="text-8xl md:text-9xl filter drop-shadow-[5px_6px_0_#1a1a1a]">
                  {theme.emoji}
                </span>
                <span className="bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-base px-2 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] mt-2 -rotate-3">
                  THAI HERO SPECIAL
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Comic Narration Box (Description & Stats) (`translateZ(25px)`) */}
        <motion.div
          style={{ transform: 'translateZ(25px)' }}
          className="flex-1 w-full max-w-md flex flex-col gap-4"
        >
          {/* Story Box / Description */}
          <div className="bg-white border-4 border-[#1a1a1a] p-4 md:p-5 shadow-[6px_6px_0_#1a1a1a] relative">
            {/* Comic Narration Tag */}
            <div className="absolute -top-3.5 left-4 bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-xs tracking-widest px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
              NARRATION LOG
            </div>
            <p className="font-['Outfit'] font-semibold text-[#1a1a1a] text-sm md:text-base leading-relaxed mt-1">
              {drink.description}
            </p>
          </div>

          {/* ─── STATS PANEL: COMIC 'BAM!' BUBBLES & THAI CHILI ICONS ────────── */}
          <div className="grid grid-cols-2 gap-3.5">
            
            {/* ABV Stat Panel (Comic BAM! Bubbles) */}
            <div className="bg-[#ffde59] border-3 border-[#1a1a1a] p-3 shadow-[4px_4px_0_#1a1a1a] flex flex-col items-center justify-between">
              <span className="font-['Bangers'] text-[#1a1a1a] text-xs tracking-wider border-b-2 border-[#1a1a1a] pb-0.5 w-full text-center">
                ABV INTENSITY ({abvScore}/5)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const filled = i < abvScore;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: filled ? 1 : 0.8 }}
                      transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 450 }}
                      className={`font-['Bangers'] text-xs px-1.5 py-0.5 border-2 border-[#1a1a1a] ${
                        filled
                          ? 'bg-[#ff1616] text-white shadow-[2px_2px_0_#1a1a1a] -rotate-6'
                          : 'bg-white/50 text-[#1a1a1a]/30 border-dashed'
                      }`}
                    >
                      {filled ? BAM_BUBBLES[i % BAM_BUBBLES.length] : '◦'}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Sweetness Stat Panel (Thai Spicy Chili Icons 🌶️) */}
            <div className="bg-[#ff2a85] border-3 border-[#1a1a1a] p-3 shadow-[4px_4px_0_#1a1a1a] flex flex-col items-center justify-between">
              <span className="font-['Bangers'] text-white text-xs tracking-wider border-b-2 border-white/60 pb-0.5 w-full text-center">
                SWEET & SPICE ({sweetnessScore}/5)
              </span>
              <div className="flex items-center justify-center gap-1 py-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const filled = i < sweetnessScore;
                  return (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: filled ? 1.25 : 0.75, rotate: filled ? [0, 15, -5, 0] : 0 }}
                      transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 400 }}
                      className="text-xl md:text-2xl filter drop-shadow-[2px_2px_0_#1a1a1a]"
                      style={{ opacity: filled ? 1 : 0.25 }}
                    >
                      🌶️
                    </motion.span>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* ─── THE DESTINATION TICKET ('SECRET COORDINATES') ──────────────────── */}
      {location && (
        <motion.div
          initial={{ y: 80, opacity: 0, rotate: -1 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.35 }}
          className="relative z-20 w-full max-w-2xl bg-[#1a1a1a] border-4 border-white p-5 md:p-6 rounded-2xl shadow-[0_0_0_4px_#1a1a1a,10px_10px_0_#ffde59] my-4 overflow-hidden"
        >
          {/* Halftone & Barcode Background Stub Effect */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #00f5ff 2px, transparent 2px)`,
              backgroundSize: '12px 12px',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left/Main Ticket Info */}
            <div className="flex-1 text-left w-full border-b-2 md:border-b-0 md:border-r-2 border-white/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#ff1616] text-white font-['Bangers'] text-xs tracking-widest px-2.5 py-0.5 border border-white">
                  ★ CLASSIFIED DESTINATION TICKET ★
                </span>
                <span className="font-['Bangers'] text-[#00f5ff] text-sm tracking-wider">
                  COORDS VERIFIED
                </span>
              </div>

              <h3 className="font-['Chonburi'] text-2xl md:text-3xl text-[#ffde59] leading-tight">
                {location.name}
              </h3>

              {/* Retro Coordinates Lat/Lon */}
              <div className="mt-2 inline-flex items-center gap-2 bg-black/60 border border-white/30 px-3 py-1 font-mono text-xs md:text-sm text-[#00f5ff] tracking-widest">
                <span>🛰️ COORDS:</span>
                <span className="font-bold">
                  {Number(location.latitude).toFixed(4)}° N, {Number(location.longitude).toFixed(4)}° E
                </span>
              </div>

              <p className="font-['Outfit'] text-xs md:text-sm text-white/80 mt-2 line-clamp-2">
                📍 {location.address}
              </p>
            </div>

            {/* Right: Neon Glowing NAVIGATE Button */}
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
              <motion.a
                whileHover={{ scale: 1.06, rotate: -2 }}
                whileTap={{ scale: 0.94 }}
                href={location.google_maps_link || `https://maps.google.com/?q=${encodeURIComponent(location.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto py-4 px-6 bg-[#00f5ff] hover:bg-[#00e5ff] text-[#1a1a1a] font-['Bangers'] text-lg md:text-xl tracking-widest uppercase border-4 border-[#1a1a1a] shadow-[0_0_20px_rgba(0,245,255,0.7),4px_4px_0_#1a1a1a] rounded-xl flex items-center justify-center gap-2.5 transition-all text-center"
              >
                <span className="text-2xl animate-pulse">🚀</span>
                <span>NAVIGATE NOW →</span>
              </motion.a>
              <span className="font-['Outfit'] text-[10px] text-white/50 tracking-widest uppercase mt-2">
                OPENS IN GOOGLE MAPS
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── BOTTOM ACTION BUTTONS: COMIC SOUND EFFECT STICKERS ────────────── */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.45 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center justify-center gap-3 mt-4 mb-2"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCinematic(true)}
          className="w-full py-3.5 px-4 bg-[#00f5ff] hover:bg-[#00e5ff] text-[#1a1a1a] font-['Bangers'] text-lg tracking-widest uppercase border-4 border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform"
        >
          <span>🎬</span> VIEW FULLSCREEN CINEMATIC FINALE (ดูหน้าผลลัพธ์แบบหนัง)
        </motion.button>

        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Replay Journey Sticker Button */}
          <motion.button
          whileHover={{ scale: 1.05, rotate: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="w-full sm:w-1/2 py-3.5 px-4 bg-gradient-to-r from-[#ffde59] to-[#ff9100] text-[#1a1a1a] font-['Bangers'] text-lg tracking-widest uppercase border-4 border-white shadow-[0_0_0_3px_#1a1a1a,5px_5px_0_#1a1a1a] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform -rotate-1"
        >
          <span>🔄</span> REPLAY JOURNEY
        </motion.button>

        {/* Share To Story Sticker Button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="w-full sm:w-1/2 py-3.5 px-4 bg-gradient-to-r from-[#ff2a85] to-[#ff007f] text-white font-['Bangers'] text-lg tracking-widest uppercase border-4 border-white shadow-[0_0_0_3px_#1a1a1a,5px_5px_0_#1a1a1a] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform rotate-1"
          >
            <span>📸</span> SHARE TO STORY
          </motion.button>
        </div>
      </motion.div>

      {/* Toast notification for Share copy */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-base px-6 py-2 border-3 border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] tracking-widest uppercase rounded-lg"
          >
            ★ COPIED TO CLIPBOARD! SHARE THE VIBE! ★
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
