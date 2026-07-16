/**
 * TarotGame.jsx — Thai Mystical Yant · Vintage Thai Comic Book
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   question  { id, type, content, options: [{id, label}, ...] }
 *   onSelect  (optionId: number) => void
 *
 * Design:
 *   Card BACKS  — Three distinct Thai Yantra (ยันต์) patterns drawn with SVG:
 *     1. Ashtamangala Star (8-pointed ✦) on deep navy
 *     2. Dhamma Chakra (8-spoke wheel + lotus) on deep crimson
 *     3. Sri Yantra (interlocking triangles + hexagon) on deep forest
 *   All backs: comic-book coloring — flat fills, thick gold outlines, halftone
 *   dots overlay. Thick black border with golden inner ring.
 *
 *   Card FRONTS — Vintage Thai comic book cover (1960s-80s style):
 *     - Colored publisher header strip ("SIAMESE TALES")
 *     - Halftone dot illustration area + floating mythological emoji character
 *     - Bold Bangers font character name + Thai script subtitle
 *     - Option label as the "story hook" text
 *     - Linear progress bar sweeping 0→100% over 1.5 s (countdown timer)
 *
 * Behaviour:
 *   • Cards displayed face-down in a fan/arc
 *   • Hover → spring lift (whileHover)
 *   • Click → rotateY 0→180° flip (preserve-3d, backfaceVisibility hidden)
 *   • 1.5 s after flip completes → onSelect(id) fires automatically
 *   • Other cards dim to 0.18 opacity when one is flipped
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_W    = 92;
const CARD_H    = 148;
const COMIC_FONT = '"Bangers", Impact, "Arial Black", cursive';
const GOLD      = '#ffd700';
const GOLD_DIM  = 'rgba(255,215,0,0.18)';

// ─── Per-card theme ────────────────────────────────────────────────────────────
const CARD_THEMES = [
  {
    // Back
    backGrad:     'linear-gradient(160deg, #111e3a 0%, #060c1c 100%)',
    yant:         'star',          // which Yant to render
    dotColor:     'rgba(0,80,180,0.22)',
    accentGold:   GOLD,
    accentColor:  '#60a5fa',       // blue
    borderGlow:   '#3b82f6',

    // Front
    mythEmoji:    '🐍',
    charName:     'The Naga',
    charThai:     'พญานาค',
    headerBg:     '#1e3a8a',
    illusBg:      'linear-gradient(160deg, #2d1b69 0%, #0f0823 100%)',
    illusDot:     'rgba(30,58,138,0.28)',
    frontBorder:  '#3b82f6',
    frontAccent:  '#93c5fd',
    issueNo:      '#01',
  },
  {
    backGrad:     'linear-gradient(160deg, #3d0c12 0%, #140306 100%)',
    yant:         'wheel',
    dotColor:     'rgba(180,20,20,0.22)',
    accentGold:   GOLD,
    accentColor:  '#f97316',       // orange
    borderGlow:   '#ef4444',

    mythEmoji:    '🦅',
    charName:     'The Garuda',
    charThai:     'ครุฑ',
    headerBg:     '#7f1d1d',
    illusBg:      'linear-gradient(160deg, #7c2d12 0%, #1c0800 100%)',
    illusDot:     'rgba(120,40,10,0.28)',
    frontBorder:  '#ef4444',
    frontAccent:  '#fca5a5',
    issueNo:      '#02',
  },
  {
    backGrad:     'linear-gradient(160deg, #0a2910 0%, #030e05 100%)',
    yant:         'triangle',
    dotColor:     'rgba(10,120,30,0.22)',
    accentGold:   GOLD,
    accentColor:  '#34d399',       // emerald
    borderGlow:   '#10b981',

    mythEmoji:    '🐒',
    charName:     'Hanuman',
    charThai:     'หนุมาน',
    headerBg:     '#064e3b',
    illusBg:      'linear-gradient(160deg, #1e3a2a 0%, #071210 100%)',
    illusDot:     'rgba(5,100,40,0.28)',
    frontBorder:  '#10b981',
    frontAccent:  '#6ee7b7',
    issueNo:      '#03',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── SVG Yant Patterns ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yant 1 — Ashtamangala Star (อัษฎาวุธ ยันต์)
 * Eight-pointed star formed by two overlapping squares, outer / inner circles,
 * radiating spokes, lotus buds at cardinal points, and a central glyph.
 */
function YantStar({ gold, accent }) {
  const spokes = [0, 45, 90, 135];
  return (
    <g>
      {/* Dashed outer ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke={gold} strokeWidth="0.6"
        strokeDasharray="4 3" opacity="0.45" />

      {/* Radiating spokes (4 lines through center = 8 directions) */}
      {spokes.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={deg}
            x1={50 - 45 * Math.sin(rad)} y1={50 - 45 * Math.cos(rad)}
            x2={50 + 45 * Math.sin(rad)} y2={50 + 45 * Math.cos(rad)}
            stroke={gold} strokeWidth="0.7" opacity="0.35"
          />
        );
      })}

      {/* 8-pointed star — two overlapping squares */}
      {/* Square 1 (diamond) */}
      <polygon
        points="50,8 92,50 50,92 8,50"
        fill={`${accent}18`}
        stroke={gold} strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Square 2 (upright, inset ~0.7×) */}
      <polygon
        points="20,20 80,20 80,80 20,80"
        fill="none"
        stroke={gold} strokeWidth="1.4"
        strokeLinejoin="round" opacity="0.7"
      />

      {/* Inner protective circle */}
      <circle cx="50" cy="50" r="20" fill={GOLD_DIM}
        stroke={gold} strokeWidth="1.5" />

      {/* Lotus buds at 4 cardinal points (ellipses rotated to each direction) */}
      {[0, 90, 180, 270].map((deg) => (
        <ellipse key={deg}
          cx="50" cy="22" rx="5" ry="10"
          fill={`${accent}30`} stroke={gold} strokeWidth="1.2"
          transform={`rotate(${deg}, 50, 50)`}
        />
      ))}

      {/* 8 small circles at star outer points */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle key={deg}
            cx={50 + 45 * Math.sin(rad)}
            cy={50 - 45 * Math.cos(rad)}
            r="2.5" fill={gold}
          />
        );
      })}

      {/* Central Om / unalome circle */}
      <circle cx="50" cy="50" r="7" fill={gold} />
      <circle cx="50" cy="50" r="4" fill="#1a1a1a" />
      <circle cx="50" cy="50" r="2" fill={gold} />
    </g>
  );
}

/**
 * Yant 2 — Dhamma Chakra (ธรรมจักร ยันต์)
 * An 8-spoked Dharma wheel with surrounding lotus petals and a central triangle.
 */
function YantWheel({ gold, accent }) {
  const spokes8 = [0, 45, 90, 135];   // 4 lines = 8 spokes
  const petals  = [0, 45, 90, 135, 180, 225, 270, 315];  // 8 petals

  return (
    <g>
      {/* Outer toothed rim (dashed) */}
      <circle cx="50" cy="50" r="45" fill="none"
        stroke={gold} strokeWidth="1.2" strokeDasharray="6 2" />

      {/* 8 lotus petals between rim and inner circle */}
      {petals.map((deg) => (
        <ellipse key={deg}
          cx="50" cy="26" rx="7" ry="15"
          fill={`${accent}25`} stroke={gold} strokeWidth="1"
          transform={`rotate(${deg}, 50, 50)`}
        />
      ))}

      {/* Inner solid circle (hub) */}
      <circle cx="50" cy="50" r="18" fill={GOLD_DIM}
        stroke={gold} strokeWidth="1.8" />

      {/* 8 spokes */}
      {spokes8.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={deg}
            x1={50 - 18 * Math.sin(rad)} y1={50 - 18 * Math.cos(rad)}
            x2={50 + 18 * Math.sin(rad)} y2={50 + 18 * Math.cos(rad)}
            stroke="#1a1a1a" strokeWidth="1.5"
          />
        );
      })}

      {/* Central upward triangle */}
      <polygon
        points="50,37 62,58 38,58"
        fill={gold} stroke="#1a1a1a" strokeWidth="1.2"
      />

      {/* Concentric accent ring */}
      <circle cx="50" cy="50" r="28" fill="none"
        stroke={gold} strokeWidth="0.8" opacity="0.5" />

      {/* 8 dots at petal tips (just outside lotus) */}
      {petals.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle key={deg}
            cx={50 + 41 * Math.sin(rad)}
            cy={50 - 41 * Math.cos(rad)}
            r="2" fill={gold} opacity="0.9"
          />
        );
      })}
    </g>
  );
}

/**
 * Yant 3 — Trimurti Yantra (ตรีมูรติ ยันต์)
 * Two interlocking equilateral triangles (one up / one down), the inner
 * hexagon they form, and a border of small protective triangles.
 */
function YantTriangle({ gold, accent }) {
  // Pre-computed hexagon from the two triangle intersections (see comments in design)
  const hex = '23,50 41,20 59,20 77,50 59,80 41,80';
  // Small border triangles (pointing inward) at 12 clock positions
  const borderTris = Array.from({ length: 12 }, (_, i) => {
    const deg  = i * 30;
    const rad  = (deg * Math.PI) / 180;
    const r1 = 43, r2 = 37;
    const ax = 50 + r2 * Math.sin(rad);
    const ay = 50 - r2 * Math.cos(rad);
    const bRad = ((deg - 8) * Math.PI) / 180;
    const cRad = ((deg + 8) * Math.PI) / 180;
    const bx = 50 + r1 * Math.sin(bRad);
    const by = 50 - r1 * Math.cos(bRad);
    const cx2 = 50 + r1 * Math.sin(cRad);
    const cy2 = 50 - r1 * Math.cos(cRad);
    return `${ax},${ay} ${bx},${by} ${cx2},${cy2}`;
  });

  return (
    <g>
      {/* Border ring */}
      <circle cx="50" cy="50" r="45" fill="none"
        stroke={gold} strokeWidth="0.6" opacity="0.4" />

      {/* 12 small protective border triangles */}
      {borderTris.map((pts) => (
        <polygon key={pts} points={pts}
          fill={`${accent}22`} stroke={gold} strokeWidth="0.7" />
      ))}

      {/* Upward triangle */}
      <polygon
        points="50,8 92,77 8,77"
        fill={`${accent}15`} stroke={gold} strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Downward triangle */}
      <polygon
        points="50,92 8,23 92,23"
        fill={`${accent}10`} stroke={gold} strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Inner hexagon */}
      <polygon
        points={hex}
        fill={GOLD_DIM} stroke={gold} strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 6 hexagon vertex dots */}
      {hex.split(' ').map((pt) => {
        const [x, y] = pt.split(',').map(Number);
        return <circle key={pt} cx={x} cy={y} r="2.5" fill={gold} />;
      })}

      {/* Central bindu (dot) */}
      <circle cx="50" cy="50" r="6" fill={gold} />
      <circle cx="50" cy="50" r="3" fill="#1a1a1a" />
    </g>
  );
}

// ─── Halftone Ben-Day dots (CSS background) ──────────────────────────────────
function HalftoneDots({ color = 'rgba(0,0,0,0.18)', size = 9 }) {
  return (
    <div style={{
      position:          'absolute',
      inset:             0,
      backgroundImage:   `radial-gradient(circle, ${color} 1.6px, transparent 1.6px)`,
      backgroundSize:    `${size}px ${size}px`,
      pointerEvents:     'none',
      borderRadius:      'inherit',
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Card BACK — Thai Yantra Pattern ──────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CardBack({ theme, isHovered }) {
  const YantComponent = {
    star:     YantStar,
    wheel:    YantWheel,
    triangle: YantTriangle,
  }[theme.yant];

  return (
    <div style={{
      width:          CARD_W,
      height:         CARD_H,
      position:       'absolute',
      inset:          0,
      borderRadius:   '12px',
      background:     theme.backGrad,
      border:         `3.5px solid #1a1a1a`,
      boxShadow:      isHovered
        ? `0 0 0 1.5px ${GOLD}90, 0 0 28px ${theme.borderGlow}80, 6px 8px 0 rgba(0,0,0,0.5)`
        : `5px 5px 0 #1a1a1a`,
      backfaceVisibility: 'hidden',
      overflow:       'hidden',
      transition:     'box-shadow 0.25s ease',
    }}>

      {/* Halftone dots */}
      <HalftoneDots color={theme.dotColor} size={9} />

      {/* Golden inner border ring */}
      <div style={{
        position:     'absolute',
        inset:        4,
        borderRadius: '9px',
        border:       `1.5px solid ${GOLD}60`,
        pointerEvents: 'none',
      }} />

      {/* Corner diamond ornaments */}
      {[
        { top: '5px',  left:  '5px'  },
        { top: '5px',  right: '5px'  },
        { bottom: '5px', left: '5px' },
        { bottom: '5px', right: '5px'},
      ].map((pos) => (
        <div key={pos.top + (pos.left || pos.right)} style={{
          position: 'absolute',
          width:    8, height: 8,
          background: GOLD,
          transform: 'rotate(45deg)',
          opacity: 0.75,
          ...pos,
        }} />
      ))}

      {/* Yant SVG pattern — centered */}
      <div style={{
        position: 'absolute',
        top:      '50%',
        left:     '50%',
        transform: 'translate(-50%, -56%)',
        width:    80,
        height:   80,
      }}>
        <svg
          viewBox="0 0 100 100"
          width="80"
          height="80"
          style={{ overflow: 'visible' }}
        >
          <YantComponent gold={theme.accentGold} accent={theme.accentColor} />
        </svg>
      </div>

      {/* Bottom label */}
      <div style={{
        position:       'absolute',
        bottom:         '8px',
        left:           0,
        right:          0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '1px',
      }}>
        <div style={{
          width:      '55%',
          height:     '1px',
          background: `linear-gradient(90deg, transparent, ${GOLD}80, transparent)`,
          marginBottom: '3px',
        }} />
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '0.62rem',
          letterSpacing: '0.28em',
          color:         `${GOLD}90`,
          margin:        0,
          textShadow:    `0 0 6px ${GOLD}`,
        }}>
          ยันต์
        </p>
        <p style={{
          fontFamily:    '"Outfit", sans-serif',
          fontSize:      '0.42rem',
          letterSpacing: '0.15em',
          color:         'rgba(255,255,255,0.25)',
          margin:        0,
          textTransform: 'uppercase',
        }}>
          Sacred Yantra
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Card FRONT — Vintage Thai Comic Book Cover ────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CardFront({ option, theme, isFlipped, onCountdownComplete }) {
  // 1.5 s auto-select after flip completes
  useEffect(() => {
    if (!isFlipped) return;
    const t = setTimeout(onCountdownComplete, 1500);
    return () => clearTimeout(t);
  }, [isFlipped]);

  // Parse option label: "The High Priestess – mystery and intuition"
  const parts    = (option.label ?? '').split(/[–-]/).map(s => s.trim());
  const cardName = parts[0] ?? option.label;
  const tagline  = parts[1] ?? '';

  return (
    <div style={{
      width:          CARD_W,
      height:         CARD_H,
      position:       'absolute',
      inset:          0,
      borderRadius:   '12px',
      border:         '3.5px solid #1a1a1a',
      boxShadow:      `0 0 0 1.5px ${theme.frontBorder}, 5px 5px 0 #1a1a1a, 0 0 30px ${theme.frontBorder}60`,
      backfaceVisibility: 'hidden',
      transform:      'rotateY(180deg)',
      overflow:       'hidden',
      display:        'flex',
      flexDirection:  'column',
      background:     '#fff9e6',
    }}>

      {/* ── Publisher header strip ─────────────────────────────────────────── */}
      <div style={{
        height:         22,
        background:     theme.headerBg,
        borderBottom:   '2.5px solid #1a1a1a',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 5px',
        flexShrink:     0,
      }}>
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '0.6rem',
          letterSpacing: '0.15em',
          color:         '#ffffff',
          margin:        0,
          lineHeight:    1,
        }}>
          SIAMESE TALES
        </p>
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '0.55rem',
          color:         GOLD,
          margin:        0,
          letterSpacing: '0.05em',
        }}>
          {theme.issueNo}
        </p>
      </div>

      {/* ── Illustration area ──────────────────────────────────────────────── */}
      <div style={{
        height:         70,
        background:     theme.illusBg,
        position:       'relative',
        overflow:       'hidden',
        flexShrink:     0,
        borderBottom:   '2.5px solid #1a1a1a',
      }}>
        {/* Halftone dots */}
        <HalftoneDots color={theme.illusDot} size={8} />

        {/* Panel marks — top corners (like comic crop marks) */}
        {[{ top: 3, left: 3 }, { top: 3, right: 3 }].map((pos) => (
          <div key={`crop-${pos.left || pos.right}`} style={{
            position: 'absolute',
            width: 6, height: 6,
            border: `1.5px solid ${theme.frontAccent}60`,
            borderRadius: 1,
            ...pos,
          }} />
        ))}

        {/* Floating mythological character emoji */}
        <motion.div
          animate={isFlipped ? { y: [0, -7, 0] } : { y: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '3.2rem',
            lineHeight:     1,
            filter:         `drop-shadow(0 0 12px ${theme.frontBorder}) drop-shadow(2px 3px 0 rgba(0,0,0,0.6))`,
          }}
        >
          {theme.mythEmoji}
        </motion.div>

        {/* Character name badge — bottom right of illustration */}
        <div style={{
          position:      'absolute',
          bottom:        4,
          right:         4,
          background:    theme.headerBg,
          border:        '2px solid #1a1a1a',
          borderRadius:  5,
          padding:       '1px 4px',
          transform:     'rotate(-3deg)',
          boxShadow:     '1.5px 1.5px 0 #1a1a1a',
        }}>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.52rem',
            color:         GOLD,
            letterSpacing: '0.1em',
            margin:        0,
          }}>
            {theme.charThai}
          </p>
        </div>
      </div>

      {/* ── Text info area ────────────────────────────────────────────────── */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        '5px 5px 8px',
        position:       'relative',
        gap:            '2px',
        overflow:       'hidden',
      }}>
        {/* Ben-Day dots on paper area */}
        <HalftoneDots color="rgba(0,0,0,0.05)" size={7} />

        {/* Character name (English) */}
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '0.82rem',
          letterSpacing: '0.06em',
          color:         '#1a1a1a',
          margin:        0,
          lineHeight:    1.1,
          position:      'relative',
          zIndex:        1,
        }}>
          {theme.charName}
        </p>

        {/* Divider */}
        <div style={{
          width:      '80%',
          height:     '1.5px',
          background: `linear-gradient(90deg, ${theme.frontBorder}, transparent)`,
          margin:     '1px 0',
        }} />

        {/* Card name (from option.label first part) */}
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '0.64rem',
          letterSpacing: '0.04em',
          color:         theme.headerBg,
          margin:        0,
          lineHeight:    1.15,
          position:      'relative',
          zIndex:        1,
        }}>
          {cardName}
        </p>

        {/* Tagline (from option.label second part) */}
        {tagline && (
          <p style={{
            fontFamily:  '"Outfit", sans-serif',
            fontSize:    '0.44rem',
            color:       'rgba(0,0,0,0.45)',
            margin:      0,
            lineHeight:  1.3,
            fontStyle:   'italic',
            position:    'relative',
            zIndex:      1,
          }}>
            {tagline}
          </p>
        )}

        {/* 1.5 s countdown progress bar */}
        {isFlipped && (
          <motion.div
            style={{
              position:     'absolute',
              bottom:       0,
              left:         0,
              height:       '4px',
              background:   theme.frontBorder,
              transformOrigin: 'left',
              boxShadow:    `0 0 6px ${theme.frontBorder}`,
            }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'linear' }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Arc geometry ─────────────────────────────────────────────────────────────
function getArcParams(idx, total) {
  const mid    = (total - 1) / 2;
  const spread = Math.min(18, 40 / Math.max(total - 1, 1));
  const angle  = (idx - mid) * spread;
  const yBase  = Math.pow(Math.abs(idx - mid), 1.15) * 16;
  return { angle, yBase };
}

// ─── Single Tarot Card ────────────────────────────────────────────────────────
function TarotCard({ option, cardTheme, idx, total, isFlipped, isDimmed, onFlip, onCountdownComplete }) {
  const [isHovered, setIsHovered] = useState(false);
  const { angle, yBase } = getArcParams(idx, total);

  return (
    <motion.div
      // Arc + hover lift wrapper
      style={{
        rotate:     angle,
        zIndex:     isFlipped ? 20 : isHovered ? 10 : 1,
        flexShrink: 0,
        cursor:     isDimmed ? 'default' : 'pointer',
      }}
      animate={{
        y:       isFlipped ? yBase - 26 : yBase,
        opacity: isDimmed  ? 0.18 : 1,
        scale:   isDimmed  ? 0.91 : 1,
      }}
      whileHover={
        !isFlipped && !isDimmed
          ? { y: yBase - 24, scale: 1.09, filter: 'drop-shadow(0 0 20px #00f0ff) drop-shadow(0 0 35px #ff007f)' }
          : undefined
      }
      whileTap={!isFlipped && !isDimmed ? { scale: 0.94 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      onClick={() => !isDimmed && onFlip(idx)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={()   => setIsHovered(false)}
    >
      {/* 3D flip container */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
        style={{
          transformStyle: 'preserve-3d',
          width:          CARD_W,
          height:         CARD_H,
          position:       'relative',
        }}
      >
        {/* Back face (Yantra) */}
        <CardBack theme={cardTheme} isHovered={isHovered && !isDimmed} />

        {/* Front face (Vintage Comic) */}
        <CardFront
          option={option}
          theme={cardTheme}
          isFlipped={isFlipped}
          onCountdownComplete={onCountdownComplete}
        />
      </motion.div>

      {/* Glow aura under the flipped card */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position:     'absolute',
              inset:        '-6px',
              borderRadius: '18px',
              boxShadow:    `0 0 0 2px ${cardTheme.frontBorder}, 0 0 40px ${cardTheme.frontBorder}80`,
              pointerEvents: 'none',
              zIndex:       -1,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TarotGame({ question, onSelect }) {
  const options = question.options;

  const [flippedIdx,  setFlippedIdx]  = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  function handleFlip(idx) {
    if (flippedIdx !== null || isSelecting) return;
    setFlippedIdx(idx);
  }

  function handleCountdownComplete() {
    if (isSelecting) return;
    setIsSelecting(true);
    onSelect(options[flippedIdx].id);
  }

  // ── Resolved card theme ────────────────────────────────────────────────────
  // If the question has more than 3 options, cycle through themes
  function getTheme(idx) {
    return CARD_THEMES[idx % CARD_THEMES.length];
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between px-4 pt-4 pb-10 gap-5 select-none"
    >

      {/* ── Action instruction header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.06 }}
        className="text-center max-w-md px-2"
      >
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '0.62rem',
          letterSpacing: '0.4em',
          color:         `${GOLD}70`,
          textShadow:    `0 0 10px ${GOLD}`,
          textTransform: 'uppercase',
          marginBottom:  '0.35rem',
        }}>
          ◈ นิยายโบราณสยาม ◈
        </p>
        <h3 className="text-xl md:text-2xl font-['Chonburi'] text-[#ffd700] leading-snug tracking-wide">
          {question.instruction || '🔮 เปิดไพ่ยิปซีชะตาค่ำคืน 🔮'}
        </h3>
        <p className="text-white/80 font-['Outfit'] text-sm mt-1">
          เลือกไพ่ 1 ใบเพื่อค้นหา Spirit Drink ที่ตรงกับดวงจิตของคุณ!
        </p>
      </motion.div>

      {/* ── Arc of cards ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.14 }}
        style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'center',
          gap:            '14px',
          paddingTop:     '20px',
          paddingBottom:  '55px',
        }}
      >
        {options.map((option, idx) => {
          const cardTheme = getTheme(idx);
          const isDimmed  = flippedIdx !== null && flippedIdx !== idx;

          return (
            <TarotCard
              key={option.id}
              option={option}
              cardTheme={cardTheme}
              idx={idx}
              total={options.length}
              isFlipped={flippedIdx === idx}
              isDimmed={isDimmed}
              onFlip={handleFlip}
              onCountdownComplete={handleCountdownComplete}
            />
          );
        })}
      </motion.div>

      {/* ── Status text ────────────────────────────────────────────────────── */}
      <div style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {flippedIdx === null && !isSelecting && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily:    COMIC_FONT,
                fontSize:      '0.8rem',
                letterSpacing: '0.18em',
                color:         'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                textAlign:     'center',
              }}
            >
              Choose a card to reveal your fate…
            </motion.p>
          )}

          {flippedIdx !== null && !isSelecting && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{
                fontFamily:    COMIC_FONT,
                fontSize:      '0.9rem',
                letterSpacing: '0.1em',
                color:         getTheme(flippedIdx).frontBorder,
                textShadow:    `0 0 12px ${getTheme(flippedIdx).frontBorder}`,
                margin:        0,
              }}>
                {getTheme(flippedIdx).charName}
              </p>
              <p style={{
                fontFamily:  '"Outfit", sans-serif',
                fontSize:    '0.65rem',
                color:       'rgba(255,255,255,0.35)',
                margin:      '2px 0 0',
                letterSpacing: '0.08em',
              }}>
                Reading the ancient scrolls…
              </p>
            </motion.div>
          )}

          {isSelecting && (
            <motion.p
              key="chosen"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                fontFamily:    COMIC_FONT,
                fontSize:      '0.9rem',
                letterSpacing: '0.1em',
                color:         GOLD,
                textShadow:    `0 0 14px ${GOLD}`,
                textTransform: 'uppercase',
              }}
            >
              ✦ The Scrolls Have Spoken ✦
            </motion.p>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
