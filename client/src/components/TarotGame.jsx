/**
 * TarotGame.jsx — 5-Star Hotel Royal Divination Cards (Garden of Siam)
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   question  { id, type, content, options: [{id, label}, ...] }
 *   onSelect  (optionIds: number[]) => void
 *
 * Features & Requirements:
 *   1. Continuous Circular Floating Carousel (`TAROT ACTION ให้การ์ด ให้ลอย หมุน รอบเป็นวงกลมเรียบต่อกัน`):
 *      The divination cards levitate and orbit smoothly in a continuous circular wheel
 *      around a glowing central Yantra seal (`framer-motion` circular orbit physics).
 *   2. Interactive Flip & Reveal:
 *      Touching/clicking any orbiting card pauses the circular wheel, centers the chosen card,
 *      flips it 180° to reveal the 5-Star Hotel Royal Destiny, and confirms the choice!
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const GOLD = '#d4af37';
const GOLD_LIGHT = '#fef08a';

const CARD_THEMES = [
  {
    yant:       'star',
    backGrad:   'linear-gradient(150deg, #043927 0%, #021e14 100%)',
    frontGrad:  'linear-gradient(150deg, #061e16 0%, #043927 100%)',
    accentGold: GOLD,
    mythEmoji:  '🐍',
    charName:   'THE ROYAL NAGA',
    charThai:   'พญานาคราช · ผู้พิทักษ์แห่งสายน้ำ',
    charEn:     'The Royal Naga · Guardian of Sacred Waters',
  },
  {
    yant:       'wheel',
    backGrad:   'linear-gradient(150deg, #1c130d 0%, #0b132b 100%)',
    frontGrad:  'linear-gradient(150deg, #180f0a 0%, #1c130d 100%)',
    accentGold: GOLD,
    mythEmoji:  '🦅',
    charName:   'CELESTIAL GARUDA',
    charThai:   'พญาครุฑสุบรรณ · เจ้าแห่งเวหา',
    charEn:     'Celestial Garuda · Lord of the Heavens',
  },
  {
    yant:       'triangle',
    backGrad:   'linear-gradient(150deg, #0b132b 0%, #043927 100%)',
    frontGrad:  'linear-gradient(150deg, #070d1e 0%, #0b132b 100%)',
    accentGold: GOLD,
    mythEmoji:  '🪷',
    charName:   'SACRED LOTUS',
    charThai:   'ปทุมมาศ · รัตนบงกชสวรรค์',
    charEn:     'Sacred Lotus · Celestial Golden Flower',
  },
];

// ─── SVG Sacred Yantra Backs ──────────────────────────────────────────────────
function YantStar({ gold }) {
  const spokes = [0, 45, 90, 135];
  return (
    <g>
      <circle cx="50" cy="50" r="44" fill="none" stroke={gold} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6" />
      {spokes.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={50 - 44 * Math.sin(rad)} y1={50 - 44 * Math.cos(rad)}
            x2={50 + 44 * Math.sin(rad)} y2={50 + 44 * Math.cos(rad)}
            stroke={gold} strokeWidth="0.6" opacity="0.4"
          />
        );
      })}
      <polygon points="50,10 88,50 50,90 12,50" fill="rgba(212,175,55,0.08)" stroke={gold} strokeWidth="1.5" />
      <polygon points="22,22 78,22 78,78 22,78" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.8" />
      <circle cx="50" cy="50" r="18" fill="rgba(4,57,39,0.6)" stroke={gold} strokeWidth="1.5" />
      {[0, 90, 180, 270].map((deg) => (
        <ellipse
          key={deg}
          cx="50" cy="24" rx="4" ry="8"
          fill="rgba(212,175,55,0.25)" stroke={gold} strokeWidth="1"
          transform={`rotate(${deg}, 50, 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="5" fill={GOLD_LIGHT} />
      <circle cx="50" cy="50" r="2.5" fill="#043927" />
    </g>
  );
}

function YantWheel({ gold }) {
  const spokes = [0, 30, 60, 90, 120, 150];
  return (
    <g>
      <circle cx="50" cy="50" r="45" fill="none" stroke={gold} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={gold} strokeWidth="0.6" strokeDasharray="3 2" />
      {spokes.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={50 - 45 * Math.sin(rad)} y1={50 - 45 * Math.cos(rad)}
            x2={50 + 45 * Math.sin(rad)} y2={50 + 45 * Math.cos(rad)}
            stroke={gold} strokeWidth="0.7" opacity="0.45"
          />
        );
      })}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path
          key={deg}
          d="M 50 30 C 44 40, 44 45, 50 50 C 56 45, 56 40, 50 30 Z"
          fill="rgba(212,175,55,0.18)" stroke={gold} strokeWidth="1"
          transform={`rotate(${deg}, 50, 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="14" fill="#1c130d" stroke={gold} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="6" fill={gold} />
      <circle cx="50" cy="50" r="2.5" fill="#fef08a" />
    </g>
  );
}

function YantTriangle({ gold }) {
  return (
    <g>
      <circle cx="50" cy="50" r="44" fill="none" stroke={gold} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="40" fill="rgba(212,175,55,0.06)" stroke={gold} strokeWidth="0.6" strokeDasharray="5 3" />
      <polygon points="50,12 85,73 15,73" fill="rgba(212,175,55,0.12)" stroke={gold} strokeWidth="1.4" />
      <polygon points="50,88 15,27 85,27" fill="none" stroke={gold} strokeWidth="1.4" opacity="0.85" />
      <polygon points="50,26 71,63 29,63" fill="rgba(4,57,39,0.5)" stroke={gold} strokeWidth="1" />
      <polygon points="50,74 29,37 71,37" fill="none" stroke={gold} strokeWidth="1" />
      <circle cx="50" cy="50" r="13" fill="#0b132b" stroke={gold} strokeWidth="1.2" />
      <circle cx="50" cy="50" r="4" fill={GOLD_LIGHT} />
    </g>
  );
}

function YantraGraphic({ yant, gold }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {yant === 'star' && <YantStar gold={gold} />}
      {yant === 'wheel' && <YantWheel gold={gold} />}
      {yant === 'triangle' && <YantTriangle gold={gold} />}
    </svg>
  );
}

// ─── Orbiting Divination Card Item (`การ์ดลอย หมุนรอบเป็นวงกลมเรียบต่อกัน แบบ GPU Accelerated`) ─────
function OrbitingDivinationCard({ option, idx, total, flippedId, onFlip }) {
  const { lang, getLocalized } = useLanguage();
  const theme = CARD_THEMES[idx % CARD_THEMES.length];
  const isFlipped = flippedId === option.id;
  const isOtherFlipped = flippedId !== null && !isFlipped;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isFlipped) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4.5;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isFlipped]);

  // Pre-calculate 3D orbit keyframes once (Eliminates React State updates & mobile lag)
  const { keyframesX, keyframesY, keyframesZ } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const radius = isMobile ? 140 : 175;
    const yRadius = radius * 0.58;
    const startAngle = idx * (360 / Math.max(1, total));
    
    const kx = [], ky = [], kz = [];
    for (let i = 0; i <= 360; i += 5) {
      const rad = ((startAngle + i) * Math.PI) / 180;
      kx.push(Math.round(Math.cos(rad) * radius));
      ky.push(Math.round(Math.sin(rad) * yRadius));
      kz.push(Math.round(Math.sin(rad) * 60));
    }
    return { keyframesX: kx, keyframesY: ky, keyframesZ: kz };
  }, [idx, total]);

  const cardLabel = getLocalized(option, 'label') || option.label;
  const tapText = lang === 'en' ? 'Tap to reveal destiny' : 'แตะเพื่อเปิดคำทำนาย';
  const charSub = lang === 'en' ? (theme.charEn || theme.charThai) : theme.charThai;

  return (
    <motion.div
      onClick={() => !isOtherFlipped && onFlip(option.id)}
      animate={
        isFlipped
          ? { x: 0, y: 0, z: 100, scale: 1.15, opacity: 1 }
          : isOtherFlipped
          ? { scale: 0.7, opacity: 0.35 } // freeze movement, just scale down
          : { x: keyframesX, y: keyframesY, z: keyframesZ, scale: 0.95, opacity: 1 }
      }
      transition={
        isFlipped || isOtherFlipped
          ? { type: 'spring', stiffness: 120, damping: 18 }
          : { duration: 15, ease: 'linear', repeat: Infinity }
      }
      className={`absolute w-[190px] sm:w-[230px] h-[300px] sm:h-[355px] cursor-pointer select-none transition-all ${
        isOtherFlipped ? 'pointer-events-none' : 'hover:brightness-110'
      }`}
      style={{ perspective: 1000, zIndex: isFlipped ? 50 : 20 }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.75, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
      >
        {/* ── CARD BACK (Gold Yantra Pattern) ── */}
        <div
          style={{ background: theme.backGrad, backfaceVisibility: 'hidden' }}
          className="absolute inset-0 rounded-3xl border-2 border-[#d4af37] p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner"
        >
          <div className="w-full flex justify-between items-center opacity-85">
            <span className="font-['Cinzel'] text-[9px] sm:text-[10px] text-[#fef08a] tracking-widest font-bold">✦ DESTINY</span>
            <span className="font-['Cinzel'] text-[9px] sm:text-[10px] text-[#fef08a] font-bold">[{idx + 1}]</span>
          </div>

          <div className="w-28 h-28 sm:w-36 sm:h-36 my-auto filter drop-shadow-[0_5px_15px_rgba(212,175,55,0.4)]">
            <YantraGraphic yant={theme.yant} gold={GOLD} />
          </div>

          <div className="text-center w-full bg-[#041410]/80 border border-[#d4af37]/40 rounded-xl py-2 px-2 backdrop-blur-sm">
            <span className="font-['Cinzel'] text-[10px] sm:text-[11px] text-[#fef08a] tracking-[0.16em] uppercase block font-semibold">
              ✦ PATHWAY #{idx + 1} ✦
            </span>
            <span className="font-['Prompt'] text-[9px] sm:text-[10px] text-[#d4af37] tracking-wider block mt-0.5">
              {tapText}
            </span>
          </div>
        </div>

        {/* ── CARD FRONT (Gold Foil Divination Reveal) ── */}
        <div
          style={{ background: theme.frontGrad, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          className="absolute inset-0 rounded-3xl border-2 border-[#fef08a] p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(254,240,138,0.3)]"
        >
          <div className="bg-[#041410]/90 border border-[#d4af37]/60 rounded-xl px-3 py-1 flex items-center justify-between">
            <span className="font-['Cinzel'] text-[9px] sm:text-[10px] text-[#fef08a] font-bold tracking-widest">
              ✦ UNLOCKED DESTINY
            </span>
            <span className="text-sm">{theme.mythEmoji}</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center my-auto px-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#041410]/90 border border-[#d4af37] flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-2">
              {theme.mythEmoji}
            </div>
            <span className="font-['Cinzel'] text-[10px] sm:text-xs text-[#d4af37] tracking-[0.18em] font-bold uppercase block">
              {theme.charName}
            </span>
            <p className="font-['Prompt'] text-[10px] sm:text-[11px] text-[#fef08a] font-light mt-0.5 mb-2">
              {charSub}
            </p>
            <div className="w-10 sm:w-12 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-2.5" />
            <h4 className="font-['Prompt'] text-[11px] sm:text-sm text-[#f8fafc] font-light leading-snug m-0 line-clamp-3">
              {cardLabel}
            </h4>
          </div>

          <div className="w-full pt-2 border-t border-[#d4af37]/30 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-['Cinzel'] text-[#d4af37] font-semibold">
              <span>✦ CONFIRMING...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#041410] rounded-full overflow-hidden border border-[#d4af37]/40">
              <div
                className="h-full bg-gradient-to-r from-[#047857] via-[#d4af37] to-[#fef08a] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TarotGame({ question, onSelect }) {
  const { lang, getLocalized } = useLanguage();
  const options = question?.options || [];
  const [flippedId, setFlippedId] = useState(null);

  function handleFlip(id) {
    if (flippedId !== null) return;
    setFlippedId(id);

    setTimeout(() => {
      if (onSelect) {
        onSelect([id]);
      }
    }, 1700);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-3 pt-2 pb-10 gap-4 select-none w-full max-w-4xl mx-auto font-['Prompt'] overflow-hidden">
      
      {/* Header Title (Clean Minimal Luxury) */}
      <div className="text-center w-full px-2 z-30">
        <h3 className="font-['Cinzel'] text-base sm:text-lg text-[#fef08a] tracking-[0.18em] font-bold uppercase m-0">
          {getLocalized(question, 'content') || question?.content || 'SACRED DESTINY'}
        </h3>
        <p className="text-xs sm:text-sm text-[#f8fafc]/80 m-0 font-light mt-1 max-w-md mx-auto">
          {flippedId === null
            ? (lang === 'en' ? 'Tap an orbiting card to reveal your destiny.' : 'แตะเลือกไพ่ยันต์มงคลหนึ่งใบเพื่อเปิดคำทำนาย')
            : (lang === 'en' ? '✦ Revealing signature destiny... ✦' : '✦ กำลังเปิดเผยคำทำนาย... ✦')}
        </p>
      </div>

      {/* ── Circular Orbiting Carousel Arena (`การ์ดลอย หมุนรอบเป็นวงกลมเรียบต่อกัน`) ── */}
      <div className="relative w-full h-[410px] sm:h-[450px] flex items-center justify-center my-2">
        
        {/* Center Glowing Yantra Seal Ornament */}
        <div className="absolute w-28 h-28 rounded-full border border-[#d4af37]/30 bg-[#043927]/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.25)] pointer-events-none animate-pulse">
          <div className="w-16 h-16 text-3xl flex items-center justify-center opacity-80">
            {flippedId === null ? '☸️' : '✨'}
          </div>
        </div>

        {/* Orbiting Cards */}
        {options.map((opt, idx) => (
          <OrbitingDivinationCard
            key={opt.id}
            option={opt}
            idx={idx}
            total={options.length}
            flippedId={flippedId}
            onFlip={handleFlip}
          />
        ))}
      </div>

      {/* Bottom Hint */}
      <div className="text-center z-30">
        <span className="font-['Cinzel'] text-[0.66rem] text-[#d4af37]/80 tracking-[0.2em] uppercase font-semibold">
          ✦ GARDEN OF SIAM · 5-STAR LUXURY INTERACTIVE ORBITAL EXPERIENCE ✦
        </span>
      </div>
    </div>
  );
}
