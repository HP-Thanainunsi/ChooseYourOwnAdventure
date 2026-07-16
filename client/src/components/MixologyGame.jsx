/**
 * MixologyGame.jsx — Thai Street-Style Plastic Bag · Comic Sticker Ingredients
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   question  { id, type, content, options: [{id, label}, ...] }
 *   onSelect  (optionId: number) => void
 *
 * Design:
 *   • Drop zone: retro Thai plastic bag (ถุงพลาสติก) with red rubber band
 *     rendered as an SVG — liquid fill rises with spring animation on drop
 *   • Ingredient cards: comic-book stickers with thick white border + black
 *     drop-shadow, representing Thai herbs/ingredients with bright gradients
 *   • SPLASH!/PLOP!/SPLAT! pop-art burst animation over the bag when an
 *     item lands inside
 *
 * Behaviour:
 *   • @dnd-kit PointerSensor + TouchSensor handle drag
 *   • Hovering the bag → bag glows + subtle pulse scale
 *   • Drop → SPLASH! starburst animation → confirm button appears
 *   • Confirm → onSelect(item.id); reset button lets user re-pick
 *
 * APIs:
 *   @dnd-kit/core   DndContext, useDraggable, useDroppable, DragOverlay
 *   framer-motion   motion.div, AnimatePresence, motion.rect (SVG fill)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Ingredient sticker themes ────────────────────────────────────────────────
// Mapped to Thai ingredients; cycles for any number of options.
const STICKER_THEMES = [
  {
    emoji:    '🌿',
    name:     'Pandan',
    subtext:  'ใบเตย',
    bg:       'linear-gradient(145deg, #22c55e 0%, #15803d 100%)',
    glow:     'rgba(34,197,94,0.6)',
    liquid:   '#4ade80',
    pop:      'SPLASH!',
    rotate:   -8,
  },
  {
    emoji:    '🌶️',
    name:     "Bird's Eye",
    subtext:  'พริกขี้หนู',
    bg:       'linear-gradient(145deg, #ef4444 0%, #b91c1c 100%)',
    glow:     'rgba(239,68,68,0.6)',
    liquid:   '#f87171',
    pop:      'PLOP!',
    rotate:   5,
  },
  {
    emoji:    '🍋',
    name:     'Kaffir Lime',
    subtext:  'มะกรูด',
    bg:       'linear-gradient(145deg, #eab308 0%, #a16207 100%)',
    glow:     'rgba(234,179,8,0.6)',
    liquid:   '#fbbf24',
    pop:      'SPLAT!',
    rotate:   -4,
  },
  {
    emoji:    '🌱',
    name:     'Thai Basil',
    subtext:  'โหระพา',
    bg:       'linear-gradient(145deg, #8b5cf6 0%, #6d28d9 100%)',
    glow:     'rgba(139,92,246,0.6)',
    liquid:   '#a78bfa',
    pop:      'ZAP!',
    rotate:   9,
  },
  {
    emoji:    '🧄',
    name:     'Lemongrass',
    subtext:  'ตะไคร้',
    bg:       'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
    glow:     'rgba(245,158,11,0.6)',
    liquid:   '#fcd34d',
    pop:      'BOOF!',
    rotate:   -6,
  },
];

// ─── SVG Thai Plastic Bag ─────────────────────────────────────────────────────
// Bag SVG constants
const BW = 120;    // total svg width
const BH = 190;    // total svg height
const BCX = 60;    // body centre x
const BCY = 130;   // body centre y
const BRX = 52;    // body rx
const BRY = 58;    // body ry
const CLIP_ID = 'bag-body-clip-mg';

function ThaiPlasticBag({ fillPercent, liquidColor, isOver, hasItem }) {
  // y of liquid top: fillPercent=0 → rect starts below bag; 100% → fills bag
  const liquidTopY = BCY + BRY - (fillPercent / 100) * (BRY * 2);

  const bagStroke  = isOver ? liquidColor : 'rgba(140,200,240,0.55)';
  const bagDash    = !hasItem && !isOver ? '5 3' : '0';

  return (
    <svg
      width={BW}
      height={BH}
      viewBox={`0 0 ${BW} ${BH}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Clip to bag ellipse for liquid fill */}
        <clipPath id={CLIP_ID}>
          <ellipse cx={BCX} cy={BCY} rx={BRX} ry={BRY} />
        </clipPath>

        {/* Liquid gradient */}
        <linearGradient id="liquid-gradient-mg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={liquidColor} stopOpacity="0.88" />
          <stop offset="100%" stopColor={liquidColor} stopOpacity="0.38" />
        </linearGradient>

        {/* Plastic sheen on bag body */}
        <linearGradient id="plastic-sheen-mg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.0)" />
          <stop offset="28%"  stopColor="rgba(255,255,255,0.22)" />
          <stop offset="55%"  stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
        </linearGradient>

        {/* Glow filter when isOver */}
        <filter id="bag-glow-filter">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Rubber band — stacked red ellipses to show twist ──────────────── */}
      {/* Bottom ring (thickest) */}
      <ellipse cx={BCX} cy={30} rx={14} ry={5.5}
        fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
      {/* Middle ring */}
      <ellipse cx={BCX} cy={24} rx={12} ry={4.5}
        fill="none" stroke="#ef4444" strokeWidth="3.5" />
      {/* Top ring (thinnest) */}
      <ellipse cx={BCX} cy={18} rx={10} ry={3.5}
        fill="none" stroke="#dc2626" strokeWidth="2.5" opacity="0.8" />
      {/* Highlight on rubber band */}
      <ellipse cx={BCX - 3} cy={22} rx={4} ry={2}
        fill="rgba(255,200,200,0.35)" />

      {/* ── Neck — gathered plastic lines ─────────────────────────────────── */}
      <path
        d={`M ${BCX - 10},33 C ${BCX - 10},50 ${BCX - BRX},60 ${BCX - BRX},72`}
        fill="none" stroke="rgba(150,200,230,0.35)" strokeWidth="1.2"
      />
      <path
        d={`M ${BCX + 10},33 C ${BCX + 10},50 ${BCX + BRX},60 ${BCX + BRX},72`}
        fill="none" stroke="rgba(150,200,230,0.35)" strokeWidth="1.2"
      />
      {/* Central gather lines */}
      {[-4, 0, 4].map((off) => (
        <path key={off}
          d={`M ${BCX + off},33 C ${BCX + off * 3},55 ${BCX + off * 5},65 ${BCX + off * 6},72`}
          fill="none" stroke="rgba(150,200,230,0.2)" strokeWidth="0.8"
        />
      ))}

      {/* ── Bag body background (clear plastic tint) ──────────────────────── */}
      <ellipse cx={BCX} cy={BCY} rx={BRX} ry={BRY}
        fill="rgba(210,235,255,0.08)"
      />

      {/* ── Liquid fill (animated with framer-motion) ──────────────────────── */}
      <motion.rect
        x={0}
        width={BW}
        height={BH}
        fill="url(#liquid-gradient-mg)"
        clipPath={`url(#${CLIP_ID})`}
        animate={{ y: liquidTopY }}
        initial={{ y: BCY + BRY + 5 }}
        transition={{ type: 'spring', stiffness: 70, damping: 14 }}
      />

      {/* ── Bag outline ───────────────────────────────────────────────────── */}
      {isOver && (
        <ellipse cx={BCX} cy={BCY} rx={BRX} ry={BRY}
          fill="none"
          stroke={liquidColor}
          strokeWidth="6"
          opacity="0.28"
          filter="url(#bag-glow-filter)"
        />
      )}
      <ellipse cx={BCX} cy={BCY} rx={BRX} ry={BRY}
        fill="url(#plastic-sheen-mg)"
        stroke={bagStroke}
        strokeWidth={isOver ? 2.5 : 1.8}
        strokeDasharray={bagDash}
        style={{ transition: 'stroke 0.2s, stroke-width 0.2s, stroke-dasharray 0.25s' }}
      />

      {/* ── Plastic highlight (left sheen) ────────────────────────────────── */}
      <ellipse
        cx={BCX - BRX * 0.42}
        cy={BCY - BRY * 0.3}
        rx={BRX * 0.18}
        ry={BRY * 0.28}
        fill="rgba(255,255,255,0.20)"
      />
    </svg>
  );
}

// ─── Comic starburst burst shape (12-pointed) ─────────────────────────────────
const STARBURST_CLIP =
  'polygon(50% 0%, 60% 38%, 98% 22%, 74% 50%, 98% 78%, 60% 62%, 50% 100%, 40% 62%, 2% 78%, 26% 50%, 2% 22%, 40% 38%)';

function ComicBurst({ word, color, onExited }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -22, opacity: 1 }}
      animate={{ scale: [0, 2.2, 1.7], rotate: [-22, 10, -6, 0] }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      onAnimationComplete={onExited}
      style={{
        position:       'absolute',
        inset:          0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         30,
        pointerEvents:  'none',
      }}
    >
      {/* Starburst background */}
      <div style={{
        position:  'absolute',
        width:     130,
        height:    130,
        background: color,
        clipPath:  STARBURST_CLIP,
        opacity:   0.92,
      }} />
      {/* Action word */}
      <p style={{
        position:      'relative',
        fontFamily:    '"Bangers", Impact, "Arial Black", cursive',
        fontSize:      '1.8rem',
        letterSpacing: '0.05em',
        color:         '#ffffff',
        textShadow:    '3px 3px 0 #1a1a1a, -1px -1px 0 #1a1a1a, 1px -1px 0 #1a1a1a, -1px 1px 0 #1a1a1a',
        margin:        0,
        userSelect:    'none',
      }}>
        {word}
      </p>
    </motion.div>
  );
}

// ─── Ingredient sticker card ───────────────────────────────────────────────────
function IngredientSticker({ item, theme, isDropped, isActiveOverlay }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id:       item.id,
    data:     { item, theme },
    disabled: isDropped,
  });

  const translateStyle = { transform: CSS.Translate.toString(transform) };

  const baseCard = (
    <motion.div
      whileHover={!isDropped && !isActiveOverlay ? {
        scale: 1.08,
        y: -6,
        boxShadow: '0 0 20px #00f0ff, 0 0 35px #ff007f, 0 0 0 3px #00f0ff',
        transition: { type: 'spring', stiffness: 450, damping: 15 }
      } : undefined}
      whileTap={!isDropped ? { scale: 0.92 } : undefined}
      style={{
        background:   theme.bg,
        border:       '4px solid #ffffff',
        borderRadius: '14px',
        boxShadow:    isActiveOverlay
          ? `0 0 0 2.5px #1a1a1a, 8px 8px 0 rgba(0,0,0,0.5), 0 0 28px ${theme.glow}`
          : isDragging
          ? 'none'
          : `0 0 0 2.5px #1a1a1a, 4px 4px 0 #1a1a1a`,
        padding:      '0.65rem 0.6rem',
        display:      'flex',
        flexDirection:'column',
        alignItems:   'center',
        gap:          '0.25rem',
        width:        '88px',
        cursor:       isActiveOverlay ? 'grabbing' : isDropped ? 'default' : 'grab',
        transform:    isActiveOverlay ? 'none' : `rotate(${theme.rotate}deg)`,
        opacity:      isDropped ? 0.22 : 1,
        transition:   'opacity 0.3s, box-shadow 0.2s',
        userSelect:   'none',
      }}
    >
      {/* Emoji */}
      <span style={{
        fontSize:  '2.2rem',
        lineHeight: 1,
        filter:    isActiveOverlay ? `drop-shadow(0 0 10px ${theme.glow})` : 'drop-shadow(1px 2px 0 rgba(0,0,0,0.3))',
      }}>
        {theme.emoji}
      </span>

      {/* Name */}
      <p style={{
        fontFamily:    '"Bangers", Impact, "Arial Black", cursive',
        fontSize:      '0.72rem',
        letterSpacing: '0.07em',
        color:         '#ffffff',
        textShadow:    '1px 1px 0 rgba(0,0,0,0.5)',
        margin:        0,
        textAlign:     'center',
        lineHeight:    1.1,
      }}>
        {theme.name}
      </p>

      {/* Thai sub-label */}
      <p style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize:   '0.55rem',
        color:      'rgba(255,255,255,0.7)',
        margin:     0,
        letterSpacing: '0.04em',
      }}>
        {theme.subtext}
      </p>
    </motion.div>
  );

  // For the overlay (dragging copy) we don't need dnd ref/listeners
  if (isActiveOverlay) return baseCard;

  return (
    <div
      ref={setNodeRef}
      style={{ ...translateStyle, touchAction: 'none', flexShrink: 0 }}
      {...listeners}
      {...attributes}
    >
      {baseCard}
    </div>
  );
}

// ─── Plastic bag drop zone ─────────────────────────────────────────────────────
function BagDropZone({ droppedItem, droppedTheme, showBurst, onBurstDone, isAnyDragging }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bag' });
  const fillPercent  = droppedItem ? 75 : 0;
  const liquidColor  = droppedTheme?.liquid ?? 'rgba(255,255,255,0.3)';

  return (
    <div
      ref={setNodeRef}
      style={{
        position:       'relative',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '0.5rem',
        padding:        '0.75rem 1rem 0.5rem',
        borderRadius:   '1.5rem',
        background:     isOver ? `${liquidColor}12` : 'transparent',
        transition:     'background 0.25s',
      }}
    >
      {/* Hint label above bag */}
      <AnimatePresence mode="wait">
        {!droppedItem && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOver ? 1 : isAnyDragging ? 0.7 : 0.35 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily:    '"Bangers", Impact, "Arial Black", cursive',
              fontSize:      '0.8rem',
              letterSpacing: '0.18em',
              color:         isOver ? liquidColor : 'rgba(255,255,255,0.5)',
              transition:    'color 0.2s',
              margin:        0,
            }}
          >
            {isOver ? '↓ DROP IT IN!' : isAnyDragging ? '↓ POUR IT HERE' : 'DRAG INGREDIENT'}
          </motion.p>
        )}
        {droppedItem && (
          <motion.p
            key="poured"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              fontFamily:    '"Bangers", Impact, "Arial Black", cursive',
              fontSize:      '0.8rem',
              letterSpacing: '0.12em',
              color:         liquidColor,
              textShadow:    `0 0 10px ${liquidColor}`,
              margin:        0,
            }}
          >
            {droppedTheme?.emoji} {droppedItem.label}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Bag SVG + burst animation */}
      <motion.div
        animate={isOver ? { scale: [1, 1.05, 1.03] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ position: 'relative' }}
      >
        <ThaiPlasticBag
          fillPercent={fillPercent}
          liquidColor={liquidColor}
          isOver={isOver}
          hasItem={!!droppedItem}
        />

        {/* SPLASH! burst animation */}
        <AnimatePresence>
          {showBurst && droppedTheme && (
            <ComicBurst
              key="burst"
              word={droppedTheme.pop}
              color={droppedTheme.liquid}
              onExited={onBurstDone}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* "Empty bag" label */}
      {!droppedItem && !isAnyDragging && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          style={{
            fontFamily: '"Bangers", Impact, cursive',
            fontSize:   '0.6rem',
            color:      'white',
            letterSpacing: '0.12em',
            margin:     0,
          }}
        >
          ถุงพลาสติก EMPTY
        </motion.p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MixologyGame({ question, onSelect }) {
  const options = question.options;

  const [activeId,    setActiveId]    = useState(null);
  const [droppedItem, setDroppedItem] = useState(null);
  const [showBurst,   setShowBurst]   = useState(false);
  const [confirmed,   setConfirmed]   = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 100, tolerance: 6 } }),
  );

  const activeOption = options.find((o) => o.id === activeId);
  const activeTheme  = activeOption
    ? STICKER_THEMES[options.indexOf(activeOption) % STICKER_THEMES.length]
    : null;

  const droppedTheme = droppedItem
    ? STICKER_THEMES[options.indexOf(droppedItem) % STICKER_THEMES.length]
    : null;

  // ── DnD handlers ──────────────────────────────────────────────────────────
  function handleDragStart({ active }) { setActiveId(active.id); }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (over?.id === 'bag' && !droppedItem) {
      const item = options.find((o) => o.id === active.id);
      setDroppedItem(item);
      setShowBurst(true);   // trigger pop-art burst animation
    }
  }

  // Called by ComicBurst when its exit animation completes
  function handleBurstDone() {
    setShowBurst(false);
  }

  // Confirm selection
  function handleConfirm() {
    if (confirmed || !droppedItem) return;
    setConfirmed(true);
    setTimeout(() => onSelect(droppedItem.id), 380);
  }

  // Reset
  function handleReset() {
    setDroppedItem(null);
    setShowBurst(false);
    setConfirmed(false);
  }

  const isAnyDragging = activeId !== null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex-1 flex flex-col items-center justify-between px-4 pt-4 pb-10 gap-5"
        style={{ userSelect: 'none' }}
      >

        {/* ── Action instruction header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.06 }}
          className="text-center max-w-md px-2"
        >
          <h3 className="text-xl md:text-2xl font-['Chonburi'] text-[#ffde59] leading-snug tracking-wide">
            {question.instruction || '⚡ ปรุงเครื่องดื่มสูตร Street Alchemist ⚡'}
          </h3>
          <p className="text-white/80 font-['Outfit'] text-sm mt-1">
            ลากวัตถุดิบนีออนลงในถุงพลาสติกเพื่อผสมเครื่องดื่มสุดขั้วของคุณ!
          </p>
        </motion.div>

        {/* ── Sticker cards ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.12 }}
          style={{
            display:        'flex',
            gap:            '0.6rem',
            justifyContent: 'center',
            flexWrap:       'wrap',
            padding:        '0.5rem 0',
          }}
        >
          {options.map((item, idx) => {
            const theme     = STICKER_THEMES[idx % STICKER_THEMES.length];
            const isDropped = droppedItem?.id === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.7, rotate: theme.rotate - 5 }}
                animate={{
                  opacity: confirmed && !isDropped ? 0 : 1,
                  scale:   1,
                  rotate:  theme.rotate,
                }}
                transition={{
                  type:      'spring',
                  stiffness: 320,
                  damping:   22,
                  delay:     0.1 + idx * 0.08,
                }}
              >
                <IngredientSticker
                  item={item}
                  theme={theme}
                  isDropped={!!droppedItem && !isDropped}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Thai plastic bag drop zone ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.2 }}
        >
          <BagDropZone
            droppedItem={droppedItem}
            droppedTheme={droppedTheme}
            showBurst={showBurst}
            onBurstDone={handleBurstDone}
            isAnyDragging={isAnyDragging}
          />
        </motion.div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div style={{ minHeight: '56px', width: '100%', maxWidth: '320px', display: 'flex', gap: '0.65rem' }}>
          <AnimatePresence>
            {droppedItem && !confirmed && (
              <>
                {/* Reset */}
                <motion.button
                  key="reset"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  onClick={handleReset}
                  style={{
                    flex:          '0 0 auto',
                    padding:       '0.85rem 1rem',
                    border:        '3px solid rgba(255,255,255,0.18)',
                    borderRadius:  '10px',
                    background:    'rgba(255,255,255,0.05)',
                    color:         'rgba(255,255,255,0.45)',
                    fontFamily:    '"Bangers", Impact, cursive',
                    fontSize:      '1rem',
                    cursor:        'pointer',
                    letterSpacing: '0.05em',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  ↩
                </motion.button>

                {/* Confirm */}
                <motion.button
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.06 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  style={{
                    flex:          1,
                    padding:       '0.85rem 1rem',
                    border:        `3px solid white`,
                    borderRadius:  '10px',
                    background:    droppedTheme?.bg ?? 'rgba(255,255,255,0.1)',
                    boxShadow:     `0 0 0 2px #1a1a1a, 4px 4px 0 #1a1a1a, 0 0 20px ${droppedTheme?.glow ?? 'transparent'}`,
                    color:         '#ffffff',
                    fontFamily:    '"Bangers", Impact, cursive',
                    fontSize:      '1.05rem',
                    letterSpacing: '0.1em',
                    cursor:        'pointer',
                    textShadow:    '1px 1px 0 rgba(0,0,0,0.5)',
                    transition:    'box-shadow 0.2s',
                  }}
                >
                  {droppedTheme?.emoji} POUR IT IN!
                </motion.button>
              </>
            )}

            {confirmed && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  flex:           1,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontFamily:     '"Bangers", Impact, cursive',
                  fontSize:       '1.1rem',
                  letterSpacing:  '0.1em',
                  color:          droppedTheme?.liquid ?? 'white',
                  textShadow:     `0 0 12px ${droppedTheme?.glow ?? 'white'}`,
                }}
              >
                ✓ MIXED! Moving on…
              </motion.div>
            )}

            {!droppedItem && !confirmed && (
              <motion.p
                key="empty-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  flex:      1,
                  textAlign: 'center',
                  alignSelf: 'center',
                  fontFamily: '"Bangers", Impact, cursive',
                  fontSize:  '0.85rem',
                  letterSpacing: '0.1em',
                  color:     'rgba(255,255,255,0.2)',
                }}
              >
                {isAnyDragging ? 'AIM FOR THE BAG...' : 'PICK AN INGREDIENT ABOVE'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── DragOverlay — floating sticker that follows cursor ───────────── */}
      <DragOverlay dropAnimation={null}>
        {activeOption && activeTheme ? (
          <IngredientSticker
            item={activeOption}
            theme={activeTheme}
            isDropped={false}
            isActiveOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
