/**
 * SwipeGame.jsx — Comic Book Panel · Thai Cultural Theme
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   question  { id, type, content, options: [{id, label}, ...] }
 *   onSelect  (optionId: number) => void
 *
 * Design:
 *   • Comic book panel card with 5px black border + offset box-shadow depth
 *   • Thai cultural scenes per question (Tuk-Tuk, Street Food, Temple, etc.)
 *   • Halftone Ben-Day dot overlay using CSS radial-gradient
 *   • Classic speech bubble above the card (Bangers font, thick border, CSS tail)
 *   • "YEAH!" / "NOPE!" comic stamps fade in during swipe direction
 *   • Speed lines SVG overlay when near commit threshold
 *
 * Behaviour:
 *   • Swipe RIGHT → onSelect(options[1])   (energetic / higher-score option)
 *   • Swipe LEFT  → onSelect(options[0])   (calm / lower-score option)
 *   • Flick velocity ≥ 420 px/s  OR  offset ≥ 95 px  → commit
 *   • Below threshold  → spring snap-back to centre
 *   • Tap buttons below card act as accessible fallback
 *
 * Framer Motion APIs:
 *   useMotionValue   – raw x position, zero re-renders
 *   useTransform     – rotate, stamp opacity, speed-line opacity
 *   animate()        – imperative fly-out on commit
 *   motion.div       – draggable card, deck shadow cards, entrance animations
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';

// ─── Thai cultural scene catalog ───────────────────────────────────────────────
const THAI_SCENES = [
  {
    id:         'tuk-tuk',
    gradFrom:   '#FF6B35',
    gradTo:     '#C84B11',
    dotColor:   'rgba(200,40,0,0.18)',
    emoji:      '🛺',
    extras:     ['💨', '⚡', '🌃'],
    panelTitle: 'BANGKOK NIGHTS',
    panelSub:   'Neon streets never sleep!',
    stamp:      'VROOM!',
    stampColor: '#FF6B35',
  },
  {
    id:         'street-food',
    gradFrom:   '#F9C74F',
    gradTo:     '#F3722C',
    dotColor:   'rgba(200,100,0,0.18)',
    emoji:      '🍜',
    extras:     ['🔥', '💨', '🌶️'],
    panelTitle: 'STREET FOOD FEVER',
    panelSub:   'Wok hei fills the air!',
    stamp:      'SIZZLE!',
    stampColor: '#F3722C',
  },
  {
    id:         'temple',
    gradFrom:   '#43AA8B',
    gradTo:     '#264653',
    dotColor:   'rgba(0,120,80,0.18)',
    emoji:      '🏯',
    extras:     ['🌅', '🪷', '✨'],
    panelTitle: 'WAT ARUN DAWN',
    panelSub:   'Monks chant in the mist...',
    stamp:      'NAMASTE!',
    stampColor: '#43AA8B',
  },
  {
    id:         'traffic',
    gradFrom:   '#EF233C',
    gradTo:     '#8D0801',
    dotColor:   'rgba(180,0,20,0.18)',
    emoji:      '🚦',
    extras:     ['🚗', '🏍️', '🌆'],
    panelTitle: 'RUSH HOUR CHAOS',
    panelSub:   'BKK gridlock, baby!',
    stamp:      'HONK!!',
    stampColor: '#EF233C',
  },
  {
    id:         'floating-market',
    gradFrom:   '#4CC9F0',
    gradTo:     '#4361EE',
    dotColor:   'rgba(0,80,200,0.18)',
    emoji:      '⛵',
    extras:     ['🌊', '🍑', '🌺'],
    panelTitle: 'FLOATING MARKET',
    panelSub:   'Trade on the Chao Phraya!',
    stamp:      'SPLASH!',
    stampColor: '#4361EE',
  },
  {
    id:         'lantern-festival',
    gradFrom:   '#7B2D8B',
    gradTo:     '#200A3A',
    dotColor:   'rgba(140,0,200,0.18)',
    emoji:      '🏮',
    extras:     ['✨', '🎆', '🌙'],
    panelTitle: 'YI PENG FESTIVAL',
    panelSub:   'Lanterns light the sky!',
    stamp:      'WOW!',
    stampColor: '#9B5DE5',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const OFFSET_THRESHOLD   = 95;
const VELOCITY_THRESHOLD = 420;
const FLY_OUT_X          = 700;

const SPRING_SNAP  = { type: 'spring', stiffness: 400, damping: 30 };
const SPRING_FLY   = { type: 'spring', stiffness: 280, damping: 26 };
const SPRING_ENTER = { type: 'spring', stiffness: 300, damping: 24, delay: 0.06 };

// Comic font stack (Bangers loaded via index.html Google Fonts link)
const COMIC_FONT = '"Bangers", Impact, "Arial Black", cursive';

// ─── Halftone dot overlay ─────────────────────────────────────────────────────
function HalftoneDots({ color = 'rgba(0,0,0,0.14)', size = 10 }) {
  return (
    <div
      style={{
        position:            'absolute',
        inset:               0,
        backgroundImage:     `radial-gradient(circle, ${color} 1.8px, transparent 1.8px)`,
        backgroundSize:      `${size}px ${size}px`,
        pointerEvents:       'none',
        borderRadius:        'inherit',
      }}
    />
  );
}

// ─── Speech bubble ────────────────────────────────────────────────────────────
// Classic comic speech bubble with CSS triangle tail pointing downward.
function SpeechBubble({ text }) {
  return (
    <div style={{ position: 'relative', textAlign: 'center', padding: '0 1.25rem', zIndex: 2 }}>
      {/* Bubble body */}
      <div style={{
        display:        'inline-block',
        background:     '#ffffff',
        border:         '4px solid #1a1a1a',
        borderRadius:   '22px',
        padding:        '0.65rem 1.25rem',
        position:       'relative',
        maxWidth:       '90%',
        boxShadow:      '4px 4px 0 #1a1a1a',
      }}>
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      'clamp(1.1rem, 4vw, 1.45rem)',
          letterSpacing: '0.04em',
          color:         '#1a1a1a',
          lineHeight:    1.15,
          margin:        0,
        }}>
          {text}
        </p>

        {/* Tail — outer black triangle */}
        <div style={{
          position:    'absolute',
          bottom:      -22,
          left:        '50%',
          transform:   'translateX(-50%)',
          width:       0,
          height:      0,
          borderLeft:  '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop:   '22px solid #1a1a1a',
        }} />
        {/* Tail — inner white triangle (sits on top, slightly above) */}
        <div style={{
          position:    'absolute',
          bottom:      -14,
          left:        '50%',
          transform:   'translateX(-50%)',
          width:       0,
          height:      0,
          borderLeft:  '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop:   '16px solid #ffffff',
        }} />
      </div>
    </div>
  );
}

// ─── Comic stamp badge ("YEAH!" / "NOPE!") ────────────────────────────────────
function ComicStamp({ label, sub, color, rotation, opacity, side }) {
  const isLeft = side === 'left';
  return (
    <motion.div
      style={{
        position:       'absolute',
        top:            '18%',
        left:           isLeft ? '0.5rem' : undefined,
        right:          !isLeft ? '0.5rem' : undefined,
        opacity,
        rotate:         rotation,
        zIndex:         4,
        pointerEvents:  'none',
      }}
    >
      <div style={{
        background:     '#ffffff',
        border:         `4px solid ${color}`,
        borderRadius:   '10px',
        padding:        '0.3rem 0.55rem',
        boxShadow:      `3px 3px 0 ${color}`,
        lineHeight:     1,
      }}>
        <p style={{
          fontFamily:    COMIC_FONT,
          fontSize:      '1.35rem',
          letterSpacing: '0.05em',
          color,
          margin:        0,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily:  COMIC_FONT,
          fontSize:    '0.65rem',
          color:       '#1a1a1a',
          margin:      0,
          marginTop:   '1px',
          letterSpacing: '0.03em',
          opacity:     0.7,
          maxWidth:    '80px',
          lineHeight:  1.1,
          overflow:    'hidden',
          whiteSpace:  'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {sub}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Deck shadow cards ────────────────────────────────────────────────────────
function DeckShadow({ xMotion, layer }) {
  // layer 1 = closest to top, layer 2 = furthest back
  const deckOpacity = useTransform(
    xMotion,
    [-160, 0, 160],
    layer === 1 ? [0.62, 0.42, 0.62] : [0.35, 0.20, 0.35]
  );
  const deckScale = useTransform(
    xMotion,
    [-160, 0, 160],
    layer === 1 ? [0.97, 0.94, 0.97] : [0.93, 0.89, 0.93]
  );
  const yOffset = layer === 1 ? 11 : 22;

  return (
    <motion.div
      style={{
        opacity:       deckOpacity,
        scale:         deckScale,
        translateY:    yOffset,
        position:      'absolute',
        inset:         0,
        background:    '#fff9e8',
        border:        '5px solid #1a1a1a',
        borderRadius:  '16px',
        boxShadow:     '5px 5px 0 #1a1a1a',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Comic panel card face ────────────────────────────────────────────────────
function ComicPanelFace({ scene, optLeft, optRight }) {
  const CARD_W = 268;
  const CARD_H = 368;
  const ILLUS_H = Math.round(CARD_H * 0.58);   // illustration 58%
  const TEXT_H  = CARD_H - ILLUS_H;             // text area 42%

  return (
    <div style={{
      width:        CARD_W,
      height:       CARD_H,
      background:   '#fff9e8',
      border:       '5px solid #1a1a1a',
      borderRadius: '16px',
      boxShadow:    '6px 6px 0 #1a1a1a',
      overflow:     'hidden',
      position:     'relative',
      userSelect:   'none',
    }}>

      {/* ── Illustration area ──────────────────────────────────────────────── */}
      <div style={{
        height:        ILLUS_H,
        background:    `linear-gradient(150deg, ${scene.gradFrom} 0%, ${scene.gradTo} 100%)`,
        position:      'relative',
        overflow:      'hidden',
        borderBottom:  '4px solid #1a1a1a',
      }}>
        {/* Ben-Day halftone dots */}
        <HalftoneDots color={scene.dotColor} size={11} />

        {/* Panel title — top-left corner badge */}
        <div style={{
          position:   'absolute',
          top:        '0.55rem',
          left:       '0.55rem',
          background: '#1a1a1a',
          borderRadius: '6px',
          padding:    '0.2rem 0.5rem',
          zIndex:     2,
        }}>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.62rem',
            letterSpacing: '0.18em',
            color:         '#ffffff',
            margin:        0,
          }}>
            {scene.panelTitle}
          </p>
        </div>

        {/* Floating extra emojis — top-right */}
        <div style={{
          position:  'absolute',
          top:       '0.5rem',
          right:     '0.5rem',
          display:   'flex',
          gap:       '2px',
          fontSize:  '0.9rem',
          opacity:   0.55,
          zIndex:    2,
        }}>
          {scene.extras.map((e, i) => <span key={i}>{e}</span>)}
        </div>

        {/* Main scene emoji */}
        <div style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontSize:  '5.5rem',
              lineHeight: 1,
              filter:    'drop-shadow(3px 3px 0 rgba(0,0,0,0.35))',
            }}
          >
            {scene.emoji}
          </motion.div>
        </div>

        {/* Stamp badge — bottom-right of illustration */}
        <div style={{
          position:      'absolute',
          bottom:        '0.55rem',
          right:         '0.55rem',
          background:    '#ffffff',
          border:        `3px solid #1a1a1a`,
          borderRadius:  '8px',
          padding:       '0.15rem 0.4rem',
          transform:     'rotate(-4deg)',
          boxShadow:     '2px 2px 0 #1a1a1a',
          zIndex:        2,
        }}>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.72rem',
            letterSpacing: '0.1em',
            color:         '#1a1a1a',
            margin:        0,
          }}>
            {scene.stamp}
          </p>
        </div>

        {/* Caption strip — bottom of illustration */}
        <div style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          background: 'rgba(26,26,26,0.78)',
          padding:    '0.25rem 0.6rem',
          backdropFilter: 'blur(2px)',
        }}>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.68rem',
            letterSpacing: '0.07em',
            color:         '#ffffff',
            margin:        0,
          }}>
            {scene.panelSub}
          </p>
        </div>
      </div>

      {/* ── Choice text area ────────────────────────────────────────────────── */}
      <div style={{
        height:        TEXT_H,
        display:       'flex',
        position:      'relative',
        overflow:      'hidden',
      }}>
        {/* Subtle halftone on paper area */}
        <HalftoneDots color="rgba(0,0,0,0.06)" size={8} />

        {/* Left option */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          justifyContent: 'center',
          padding:       '0.5rem 0.5rem',
          borderRight:   '3px solid #1a1a1a',
          gap:           '0.2rem',
          position:      'relative',
          zIndex:        1,
        }}>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.8rem',
            letterSpacing: '0.08em',
            color:         '#6b7280',
            margin:        0,
          }}>
            ← SWIPE
          </p>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.85rem',
            letterSpacing: '0.04em',
            color:         '#1a1a1a',
            margin:        0,
            textAlign:     'center',
            lineHeight:    1.15,
          }}>
            {optLeft.label}
          </p>
        </div>

        {/* Right option */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          justifyContent: 'center',
          padding:       '0.5rem 0.5rem',
          gap:           '0.2rem',
          position:      'relative',
          zIndex:        1,
        }}>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.8rem',
            letterSpacing: '0.08em',
            color:         '#6b7280',
            margin:        0,
          }}>
            SWIPE →
          </p>
          <p style={{
            fontFamily:    COMIC_FONT,
            fontSize:      '0.85rem',
            letterSpacing: '0.04em',
            color:         '#1a1a1a',
            margin:        0,
            textAlign:     'center',
            lineHeight:    1.15,
          }}>
            {optRight.label}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SwipeGame({ question, onSelect }) {
  const [optLeft, optRight] = question.options;

  // Pick Thai scene based on question id (cycles through catalog)
  const scene = THAI_SCENES[question.id % THAI_SCENES.length];

  // ── Prevent double-commit ──────────────────────────────────────────────────
  const isExitingRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);

  // ── Core motion value ──────────────────────────────────────────────────────
  const x = useMotionValue(0);

  // ── Derived transforms ─────────────────────────────────────────────────────
  // Card rotation: tilts as you drag
  const rotate = useTransform(x, [-240, 0, 240], [-22, 0, 22]);

  // Comic stamp opacities
  const nopeFade = useTransform(x, [-180, -40, 0],  [1, 0.3, 0]);
  const yeahFade = useTransform(x, [0,   40, 180],  [0, 0.3, 1]);

  // Speed-line overlay — brightens when near commit
  const speedOpacity = useTransform(
    x,
    [-FLY_OUT_X * 0.55, -OFFSET_THRESHOLD, 0, OFFSET_THRESHOLD, FLY_OUT_X * 0.55],
    [0.5, 0, 0, 0, 0.5]
  );

  // Drag hint text — most visible at rest
  const hintOpacity = useTransform(x, [-60, 0, 60], [0, 0.3, 0]);

  // ── Commit swipe ──────────────────────────────────────────────────────────
  function commitSwipe(dir) {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);

    const target     = dir === 'left' ? -FLY_OUT_X : FLY_OUT_X;
    const selectedId = dir === 'left' ? optLeft.id  : optRight.id;

    animate(x, target, {
      ...SPRING_FLY,
      onComplete: () => onSelect(selectedId),
    });
  }

  // ── Drag end handler ──────────────────────────────────────────────────────
  function handleDragEnd(_, { offset, velocity }) {
    if (isExitingRef.current) return;
    const flewLeft  = offset.x < -OFFSET_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
    const flewRight = offset.x >  OFFSET_THRESHOLD || velocity.x >  VELOCITY_THRESHOLD;

    if      (flewLeft)  commitSwipe('left');
    else if (flewRight) commitSwipe('right');
    else                animate(x, 0, SPRING_SNAP);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex-1 flex flex-col items-center justify-between px-4 pt-3 pb-8 gap-4"
      style={{ userSelect: 'none' }}
    >

      {/* ── Action instruction header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_ENTER}
        className="text-center max-w-md px-2"
      >
        <h3 className="text-xl md:text-2xl font-['Chonburi'] text-[#ffde59] leading-snug tracking-wide">
          {question.instruction || '👉 ปัดซ้ายหรือขวาเพื่อเลือก Vibe ของคุณในค่ำคืนนี้!'}
        </h3>
        <p className="text-white/80 font-['Outfit'] text-sm mt-1">
          ปัดซ้าย (NOPE) หรือปัดขวา (YEAH) เพื่อเลือกเส้นทางที่ใช่สำหรับคุณ
        </p>
      </motion.div>

      {/* ── Card stack ─────────────────────────────────────────────────── */}
      <div
        style={{
          position:    'relative',
          width:       268,
          height:      368,
          marginTop:   '10px',
        }}
      >
        {/* Deck shadow cards (behind main) */}
        <DeckShadow xMotion={x} layer={2} />
        <DeckShadow xMotion={x} layer={1} />

        {/* ── Main draggable card ──────────────────────────────────────── */}
        <motion.div
          style={{
            x,
            rotate,
            touchAction:  'none',
            position:     'absolute',
            inset:        0,
            cursor:       isExiting ? 'default' : 'grab',
          }}
          drag={isExiting ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.82}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          whileDrag={{ cursor: 'grabbing', scale: 1.04 }}
          whileHover={!isExiting ? { scale: 1.015 } : undefined}
          initial={{ scale: 0.85, opacity: 0, y: 28 }}
          animate={{ scale: 1,    opacity: 1, y: 0  }}
          transition={SPRING_ENTER}
        >
          {/* Comic panel */}
          <ComicPanelFace
            scene={scene}
            optLeft={optLeft}
            optRight={optRight}
          />

          {/* NOPE stamp (left swipe) */}
          <ComicStamp
            label="NOPE!"
            sub={optLeft.label}
            color="#ef233c"
            rotation={-12}
            opacity={nopeFade}
            side="left"
          />

          {/* YEAH stamp (right swipe) */}
          <ComicStamp
            label="YEAH!"
            sub={optRight.label}
            color="#2ec4b6"
            rotation={12}
            opacity={yeahFade}
            side="right"
          />

          {/* "Drag me" micro-hint */}
          <motion.p
            style={{
              opacity:       hintOpacity,
              position:      'absolute',
              bottom:        '-1.75rem',
              left:          0,
              right:         0,
              textAlign:     'center',
              fontFamily:    COMIC_FONT,
              fontSize:      '0.78rem',
              letterSpacing: '0.12em',
              color:         'rgba(255,255,255,0.45)',
              pointerEvents: 'none',
            }}
          >
            ← DRAG TO CHOOSE →
          </motion.p>
        </motion.div>
      </div>

      {/* ── Tap / click fallback buttons ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_ENTER, delay: 0.2 }}
        style={{
          display:        'flex',
          gap:            '0.65rem',
          width:          '100%',
          maxWidth:       '320px',
          marginTop:      '0.5rem',
        }}
      >
        {/* Left / NOPE button */}
        <motion.button
          disabled={isExiting}
          onClick={() => commitSwipe('left')}
          whileHover={!isExiting ? { scale: 1.04, y: -2 } : undefined}
          whileTap={!isExiting ? { scale: 0.97 } : undefined}
          style={{
            flex:          1,
            padding:       '0.75rem 0.75rem',
            border:        '3px solid #1a1a1a',
            borderRadius:  '10px',
            background:    '#ffffff',
            boxShadow:     '3px 3px 0 #1a1a1a',
            fontFamily:    COMIC_FONT,
            fontSize:      '0.75rem',
            letterSpacing: '0.08em',
            color:         '#1a1a1a',
            cursor:        'pointer',
            textAlign:     'center',
            opacity:       isExiting ? 0.4 : 1,
            transition:    'opacity 0.25s',
            lineHeight:    1.2,
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '1px 1px 0 #1a1a1a';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '3px 3px 0 #1a1a1a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '3px 3px 0 #1a1a1a';
          }}
        >
          ← {optLeft.label}
        </motion.button>

        {/* Right / YEAH button */}
        <motion.button
          disabled={isExiting}
          onClick={() => commitSwipe('right')}
          whileHover={!isExiting ? { scale: 1.04, y: -2 } : undefined}
          whileTap={!isExiting ? { scale: 0.97 } : undefined}
          style={{
            flex:          1,
            padding:       '0.75rem 0.75rem',
            border:        '3px solid #1a1a1a',
            borderRadius:  '10px',
            background:    '#1a1a1a',
            boxShadow:     '3px 3px 0 rgba(0,0,0,0.4)',
            fontFamily:    COMIC_FONT,
            fontSize:      '0.75rem',
            letterSpacing: '0.08em',
            color:         '#ffffff',
            cursor:        'pointer',
            textAlign:     'center',
            opacity:       isExiting ? 0.4 : 1,
            transition:    'opacity 0.25s',
            lineHeight:    1.2,
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '1px 1px 0 rgba(0,0,0,0.4)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.4)';
          }}
        >
          {optRight.label} →
        </motion.button>
      </motion.div>

    </div>
  );
}
