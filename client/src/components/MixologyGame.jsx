/**
 * MixologyGame.jsx — 5-Star Hotel Benjarong Crystal Alchemy Jar (Garden of Siam)
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   question  { id, type, content, options: [{id, label, image_url}, ...] }
 *   onSelect  (optionIds: number[]) => void
 *
 * Features & Requirements:
 *   1. Floating Ingredients Surrounding the Glass Jar (`วัตถุดิบ ให้ลอยรอบๆ โหลแก้ว`):
 *      Transparent borderless PNG options levitate in an orbital ring ALL AROUND
 *      the central Benjarong Crystal Jar with independent bobbing and rotating physics.
 *   2. Multiple Ingredient Infusion (`มาผสมกันหลายๆตัว และเก็บ Score`):
 *      Users Drag & Drop OR Click multiple ingredients into the crystal decanter.
 *   3. Dynamic Color Blending Glass Decanter (`ขวดโหลแก้วใสผสมสีตามสีวัตถุดิบ`):
 *      Liquid color dynamically blends RGB channels of all dropped botanical colors!
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Dynamic Botanical Color Palette & Fallback Icons ─────────────────────────
const PALETTE = [
  { color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)', icon: '🌿', name: 'Siamese Pandan' },
  { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', icon: '🥃', name: 'Wild Cinnamon & Ylang' },
  { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', icon: '🪷', name: 'Silver Needle & Jasmine' },
  { color: '#fde047', glow: 'rgba(253, 224, 71, 0.6)', icon: '🍯', name: 'Cardamom & Wild Honey' },
  { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)',  icon: '🌺', name: 'Royal Lotus Dew' },
  { color: '#a3e635', glow: 'rgba(163, 230, 53, 0.6)', icon: '🍋', name: 'Kaffir Lime Zest' },
];

function getBotanicalTheme(idx = 0) {
  return PALETTE[idx % PALETTE.length];
}

// ─── Dynamic RGB Color Blending Engine (`ผสมสีตาม สี วัสถุดิบ`) ────────────────
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = Number.parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function blendIngredientColors(items = []) {
  if (!items || items.length === 0) return '#34d399'; // default emerald
  if (items.length === 1) return items[0].elixirColor || '#34d399';

  let totalR = 0, totalG = 0, totalB = 0;
  items.forEach(item => {
    const { r, g, b } = hexToRgb(item.elixirColor || '#34d399');
    totalR += r;
    totalG += g;
    totalB += b;
  });

  const count = items.length;
  return rgbToHex(totalR / count, totalG / count, totalB / count);
}

// ─── Orbital Positioning Map Around Central Jar (`ลอยรอบๆ โหลแก้ว`) ─────────────
function getOrbitalPosition(idx, total) {
  // Pre-calculated orbital coordinates around the central vessel
  const ORBITAL_SLOTS = [
    { top: '-4%', left: '4%' },     // 0: Top-Left
    { top: '-4%', right: '4%' },    // 1: Top-Right
    { top: '38%', left: '-5%' },    // 2: Middle-Left
    { top: '38%', right: '-5%' },   // 3: Middle-Right
    { bottom: '-2%', left: '25%' }, // 4: Bottom-Center
    { bottom: '-2%', right: '15%' } // 5: Extra Slot
  ];
  return ORBITAL_SLOTS[idx % ORBITAL_SLOTS.length];
}

// ─── Crystal Clear Benjarong Glass Decanter (`SVG ขวดโหลใส`) ────────────────
const VW  = 180;
const VH  = 240;
const VCX = 90;
const VCY = 155;
const VRX = 72;
const VRY = 72;
const CLIP_ID = 'crystal-jar-clip-orbital';

function CrystalDecanter({ fillPercent, blendedColor, isOver, droppedItems }) {
  const liquidTopY = VCY + VRY - (fillPercent / 100) * (VRY * 2);
  const vesselStroke = isOver ? '#fef08a' : 'rgba(212, 175, 55, 0.85)';

  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} className="overflow-visible select-none">
      <defs>
        <clipPath id={CLIP_ID}>
          <ellipse cx={VCX} cy={VCY} rx={VRX} ry={VRY} />
        </clipPath>

        <linearGradient id="jar-liquid-grad-orbital" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={blendedColor} stopOpacity="0.95" />
          <stop offset="50%"  stopColor={blendedColor} stopOpacity="0.75" />
          <stop offset="100%" stopColor="#041410" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="jar-crystal-sheen-orbital" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
          <stop offset="25%"  stopColor="rgba(255,255,255,0.1)" />
          <stop offset="50%"  stopColor="rgba(255,255,255,0.0)" />
          <stop offset="80%"  stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
        </linearGradient>
      </defs>

      {/* Hover Pulse Ring around Jar */}
      {isOver && (
        <ellipse
          cx={VCX}
          cy={VCY}
          rx={VRX + 16}
          ry={VRY + 16}
          fill="none"
          stroke={blendedColor}
          strokeWidth="3.5"
          strokeOpacity="0.8"
          strokeDasharray="8 4"
          className="animate-pulse"
        />
      )}

      {/* Golden Teakwood Base Pedestal */}
      <path d="M 50 226 L 130 226 L 120 214 L 60 214 Z" fill="#1c130d" stroke="#d4af37" strokeWidth="2" />
      <path d="M 56 214 L 124 214 L 114 204 L 66 204 Z" fill="#043927" stroke="#d4af37" strokeWidth="1.5" />

      {/* Crystal Jar Neck & Gold Seal */}
      <rect x="76" y="48" width="28" height="38" rx="6" fill="rgba(255,255,255,0.15)" stroke={vesselStroke} strokeWidth="2" />
      <ellipse cx="90" cy="48" rx="18" ry="7" fill="#1c130d" stroke="#d4af37" strokeWidth="2" />
      <ellipse cx="90" cy="68" rx="15" ry="4" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.6" />

      {/* Dynamic Blended Liquid Fill */}
      <g clipPath={`url(#${CLIP_ID})`}>
        <motion.rect
          x={VCX - VRX}
          y={liquidTopY}
          width={VRX * 2}
          height={VH}
          fill="url(#jar-liquid-grad-orbital)"
          initial={{ y: VCY + VRY }}
          animate={{ y: liquidTopY }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        />

        {/* Floating Botanical Bubbles & Color Particles Inside Liquid */}
        {droppedItems?.length > 0 && (
          <>
            {droppedItems.map((item, i) => (
              <motion.circle
                key={`bubble-${item.id}-${i}`}
                cx={VCX - 35 + ((i * 27) % 70)}
                cy={liquidTopY + 18 + ((i * 15) % 45)}
                r={4 + (i % 4)}
                fill={item.elixirColor || '#fef08a'}
                opacity="0.85"
                animate={{
                  y: [0, -18, 0],
                  scale: [1, 1.25, 1],
                  opacity: [0.8, 1, 0.6],
                }}
                transition={{ duration: 2.2 + (i * 0.4), repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            <ellipse cx={VCX} cy={liquidTopY} rx={VRX - 10} ry={8} fill="rgba(255,255,255,0.28)" />
          </>
        )}
      </g>

      {/* Transparent Crystal Glass Bowl Outer Shell */}
      <ellipse
        cx={VCX}
        cy={VCY}
        rx={VRX}
        ry={VRY}
        fill="url(#jar-crystal-sheen-orbital)"
        stroke={vesselStroke}
        strokeWidth={isOver || (droppedItems?.length || 0) > 0 ? '3.5' : '2.5'}
        strokeDasharray={(droppedItems?.length || 0) === 0 && !isOver ? '6 4' : '0'}
      />

      {/* Elegant Benjarong Gold Leaf Trim on Glass */}
      <path d="M 54 155 Q 90 178 126 155" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.8" />
      <path d="M 62 138 Q 90 158 118 138" fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="90" cy="158" r="4.5" fill="#d4af37" opacity="0.9" />
    </svg>
  );
}

// ─── Droppable Center Vessel Zone (`โหลแก้วตรงกลาง`) ────────────────────────────
function DroppableVesselZone({ isOver, droppedItems, onRemoveItem, onClearAll }) {
  const { setNodeRef } = useDroppable({ id: 'benjarong-vessel-zone' });
  const fillPercent = Math.min(96, droppedItems.length * 32);
  const blendedColor = blendIngredientColors(droppedItems);

  return (
    <motion.div
      ref={setNodeRef}
      animate={isOver ? { scale: 1.06 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className="relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl border border-[#d4af37]/60 bg-[#041410]/85 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(212,175,55,0.25)] backdrop-blur-2xl w-[260px] sm:w-[290px] z-20"
    >
      {/* Crystal Decanter */}
      <CrystalDecanter
        fillPercent={fillPercent}
        blendedColor={blendedColor}
        isOver={isOver}
        droppedItems={droppedItems}
      />

      {/* Dynamic Blended Status Badge */}
      <AnimatePresence>
        {droppedItems.length > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-3 bg-[#043927]/95 border border-[#d4af37] px-3.5 py-1 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: blendedColor }} />
            <span className="font-['Cinzel'] text-[11px] text-[#fef08a] tracking-[0.16em] font-bold uppercase">
              ✦ {droppedItems.length === 1 ? 'SINGLE INFUSION' : `BLENDED ${droppedItems.length} BOTANICALS`} ✦
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropped Botanical Tags inside Jar (Removable) */}
      {droppedItems.length > 0 && (
        <div className="w-full mt-3 flex flex-wrap items-center justify-center gap-1.5 max-h-24 overflow-y-auto px-1">
          {droppedItems.map((item, idx) => (
            <motion.div
              key={`dropped-${item.id}-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-[#1c130d]/95 border border-[#d4af37]/70 rounded-full py-0.5 px-2.5 flex items-center gap-1.5 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.elixirColor }} />
              <span className="font-['Prompt'] text-[11px] text-[#f8fafc] max-w-[110px] truncate font-light">
                {item.label}
              </span>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-xs text-[#d4af37] hover:text-[#f43f5e] font-bold px-1 transition-colors"
                title="Remove ingredient"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {droppedItems.length > 1 && (
        <button
          onClick={onClearAll}
          className="mt-2.5 font-['Cinzel'] text-[0.65rem] text-[#d4af37]/70 hover:text-[#fef08a] tracking-[0.2em] uppercase transition-colors"
        >
          [ ✕ CLEAR ALL ]
        </button>
      )}
    </motion.div>
  );
}

// ─── Floating Surrounding Ingredient Item (`ลอยรอบๆ โหลแก้ว`) ────────────────
function OrbitalFloatingItem({ option, themeIdx, isDropped, onToggle, total }) {
  const theme = getBotanicalTheme(themeIdx);
  const orbitalPos = getOrbitalPosition(themeIdx, total);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: option.id,
    data: { option, themeIdx, elixirColor: theme.color, icon: theme.icon },
  });

  let itemOpacity = 1;
  if (isDragging) itemOpacity = 0.3;
  else if (isDropped) itemOpacity = 0.4;

  const style = {
    ...orbitalPos,
    transform: CSS.Translate.toString(transform),
    opacity: itemOpacity,
  };

  // Graceful orbital floating & rotation physics around the center jar
  const floatAnimation = isDropped
    ? {}
    : {
        y: [0, -12, 0, 10, 0],
        x: [0, (themeIdx % 2 === 0 ? 8 : -8), 0, (themeIdx % 2 === 0 ? -6 : 6), 0],
        rotate: [-3, 3.5, -1.5, 2.5, -3],
        scale: [1, 1.05, 1],
      };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      animate={floatAnimation}
      transition={{
        duration: 4.2 + (themeIdx % 3) * 0.9,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.15, zIndex: 50 }}
      onClick={() => onToggle(option, themeIdx, theme)}
      className={`absolute z-30 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl cursor-pointer select-none transition-all w-28 sm:w-32 ${
        isDropped ? 'grayscale opacity-50' : 'hover:brightness-115'
      }`}
    >
      {/* Borderless Image OR Glowing Botanical Icon (`png ไม่เอากรอบ ลอยรอบๆ`) */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1 pointer-events-none">
        {option.image_url ? (
          <img
            src={option.image_url}
            alt={option.label}
            className="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(212,175,55,0.5)] filter"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl sm:text-4xl drop-shadow-[0_10px_20px_rgba(212,175,55,0.45)]"
            style={{ backgroundColor: 'rgba(4, 57, 39, 0.7)', border: `1px solid ${theme.color}` }}
          >
            {theme.icon}
          </div>
        )}

        {/* Selected Checkmark Badge */}
        {isDropped && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#047857] border border-[#fef08a] flex items-center justify-center text-white text-[10px] font-bold shadow-md">
            ✓
          </div>
        )}
      </div>

      {/* Glowing Floating Label (No Card Box Border!) */}
      <div className="text-center w-full pointer-events-none bg-[#041410]/75 backdrop-blur-md px-2 py-1 rounded-xl border border-[#d4af37]/40 shadow-sm">
        <span className="font-['Cinzel'] text-[0.58rem] text-[#d4af37] tracking-[0.14em] font-bold uppercase block truncate">
          ✦ {theme.name}
        </span>
        <p className="font-['Prompt'] text-[11px] text-[#f8fafc] font-light leading-snug m-0 line-clamp-1">
          {option.label}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MixologyGame({ question, onSelect }) {
  const options = question?.options || [];
  const [droppedItems, setDroppedItems] = useState([]);
  const [activeDragItem, setActiveDragItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  function handleDragStart(event) {
    setActiveDragItem(event.active.data.current);
  }

  function handleDragEnd(event) {
    const { over, active } = event;
    setActiveDragItem(null);
    if (over?.id === 'benjarong-vessel-zone') {
      const { option, themeIdx, elixirColor, icon } = active.data.current;
      addItemToVessel(option, themeIdx, { color: elixirColor, icon });
    }
  }

  function addItemToVessel(option, themeIdx, theme) {
    setDroppedItems((prev) => {
      if (prev.some((item) => item.id === option.id)) return prev;
      return [
        ...prev,
        {
          ...option,
          themeIdx,
          elixirColor: theme?.color || getBotanicalTheme(themeIdx).color,
          icon: theme?.icon || getBotanicalTheme(themeIdx).icon,
        },
      ];
    });
  }

  function removeItemFromVessel(optionId) {
    setDroppedItems((prev) => prev.filter((item) => item.id !== optionId));
  }

  function toggleItem(option, themeIdx, theme) {
    const isAlreadyIn = droppedItems.some((item) => item.id === option.id);
    if (isAlreadyIn) {
      removeItemFromVessel(option.id);
    } else {
      addItemToVessel(option, themeIdx, theme);
    }
  }

  function handleConfirmAlchemy() {
    if (droppedItems.length > 0 && onSelect) {
      onSelect(droppedItems.map((item) => item.id));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col items-center justify-between px-3 pt-2 pb-10 gap-4 select-none w-full max-w-4xl mx-auto font-['Prompt']">
        
        {/* Header Title */}
        <div className="text-center w-full px-2 z-30">
          <div className="inline-block bg-[#0b132b]/95 border border-[#d4af37]/60 rounded-full px-5 py-1.5 shadow-md mb-2">
            <span className="font-['Cinzel'] text-[#d4af37] text-xs sm:text-sm tracking-[0.2em] uppercase font-bold">
              ✨ ORBITAL BOTANICAL ALCHEMY · MULTI-INFUSION ✨
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#f8fafc]/85 m-0 font-light max-w-lg mx-auto">
            กดคลิก หรือ ลากวัตถุดิบลอยตัวรอบๆ โหลแก้ว (Surrounding Botanicals) ลงโถแก้วใสเบญจรงค์ตรงกลาง เพื่อปรุงสูตรลับเฉพาะคุณ
          </p>
        </div>

        {/* ── Orbital Floating Arena (Vessel Center + Surrounding Botanicals) ── */}
        <div className="relative w-full h-[470px] sm:h-[510px] flex items-center justify-center my-1 max-w-3xl">
          
          {/* Central Crystal Decanter (`โหลแก้วตรงกลาง`) */}
          <DroppableVesselZone
            isOver={!!activeDragItem}
            droppedItems={droppedItems}
            onRemoveItem={removeItemFromVessel}
            onClearAll={() => setDroppedItems([])}
          />

          {/* Surrounding Orbital Floating Borderless Ingredients (`ลอยรอบๆ โหลแก้ว`) */}
          {options.map((opt, idx) => {
            const isDropped = droppedItems.some((item) => item.id === opt.id);
            return (
              <OrbitalFloatingItem
                key={opt.id}
                option={opt}
                themeIdx={idx}
                isDropped={isDropped}
                onToggle={toggleItem}
                total={options.length}
              />
            );
          })}
        </div>

        {/* Confirm Alchemy Action Button */}
        <AnimatePresence>
          {droppedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md mt-2 z-30"
            >
              <button
                onClick={handleConfirmAlchemy}
                className="w-full bg-gradient-to-r from-[#047857] via-[#043927] to-[#d4af37] border-2 border-[#fef08a] text-white font-['Cinzel'] font-bold py-4 px-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.4)] tracking-[0.2em] uppercase transition-all hover:brightness-110 flex items-center justify-center gap-3 text-sm sm:text-base cursor-pointer"
              >
                <span>⚱️ CONFIRM ALCHEMY ({droppedItems.length} INGREDIENTS)</span>
                <span>✨</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}
