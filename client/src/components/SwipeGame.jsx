/**
 * SwipeGame.jsx — 5-Star Hotel Concierge Welcome Tray (Garden of Siam)
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   question  { id, type, content, options: [{id, label, image_url}, ...] }
 *   onSelect  (optionIds: number[]) => void
 *
 * Features & Requirements:
 *   1. Real Photorealistic Beverage Photography (`SWIPE ACTION ขอรูปภาพเครื่องดื่ม จริงไม่ใช่ภาพการตูน`):
 *      Replaced cartoon emojis and illustrations with real 5-Star Hotel cocktail and welcome drink
 *      photographs (`optLeft.image_url` & `optRight.image_url`).
 *   2. Concierge Serving Tray Experience:
 *      A split luxury brass/silver tray displaying both welcome beverage choices in real life quality.
 *      As the user swipes/drags left or right (`panDirection`), the corresponding drink highlights
 *      with gold leaf glow and emerald badges (`✦ SELECTED WELCOME ELIXIR ✦`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// ─── Luxury Concierge Scenes Metadata ─────────────────────────────────────────
const SCENES = [
  {
    panelTitle: '✦ SCENE I : THE LOBBY WELCOME ✦',
    panelSubTh: '“ ยินดีต้อนรับสู่ The Garden of Siam กรุณาเลือกเครื่องดื่มรับรองสำหรับค่ำคืนนี้... ”',
    panelSubEn: '“ Welcome to The Garden of Siam. Please select your welcome refreshing ritual for tonight... ”',
    panelSub:   '“ ยินดีต้อนรับสู่ The Garden of Siam กรุณาเลือกเครื่องดื่มรับรองสำหรับค่ำคืนนี้... ”',
    extras:     ['✨', '🥂', '🌿'],
  },
  {
    panelTitle: '✦ SCENE II : THE SENSORY GARDEN ✦',
    panelSubTh: '“ บรรยากาศสวนพฤกษาไทยร่มรื่น สัมผัสกลิ่นอายที่ปลุกเร้าโสตประสาทของคุณ... ”',
    panelSubEn: '“ A tranquil lush botanical sanctuary. Experience aromas that awaken your senses... ”',
    panelSub:   '“ บรรยากาศสวนพฤกษาไทยร่มรื่น สัมผัสกลิ่นอายที่ปลุกเร้าโสตประสาทของคุณ... ”',
    extras:     ['🌸', '🎋', '🍯'],
  },
];

const FLY_OUT_X          = 420;
const OFFSET_THRESHOLD   = 80;
const VELOCITY_THRESHOLD = 350;

const SPRING_SNAP  = { type: 'spring', stiffness: 420, damping: 30 };
const SPRING_FLY   = { duration: 0.32, ease: [0.32, 0, 0.67, 0] };
const SPRING_ENTER = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

// ─── Tray Shadow Card Behind ──────────────────────────────────────────────────
function TrayCardShadow() {
  return (
    <div className="absolute inset-0 bg-[#043927]/40 border border-[#d4af37]/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] pointer-events-none scale-[0.94] translate-y-3" />
  );
}

// ─── Real Photorealistic Beverage Tray Face (`ไม่ใช่ภาพการตูน`) ──────────────────
function PhotorealisticTrayFace({ scene, optLeft, optRight, panDirection }) {
  const { lang, getLocalized } = useLanguage();
  const isLeftActive  = panDirection === 'left';
  const isRightActive = panDirection === 'right';

  const leftLabel = getLocalized(optLeft, 'label') || 'Cold Jasmine Welcome Drink';
  const rightLabel = getLocalized(optRight, 'label') || 'Steaming Royal Lemongrass Tea';
  const subText = getLocalized(optLeft, 'sub_question') || (lang === 'en' ? (scene.panelSubEn || scene.panelSub) : (scene.panelSubTh || scene.panelSub));

  return (
    <div className="relative w-[310px] sm:w-[340px] h-[440px] sm:h-[460px] bg-[#041410]/95 border-2 border-[#d4af37]/80 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col select-none backdrop-blur-2xl">
      
      {/* ── Top Header Badge ── */}
      <div className="bg-[#043927]/90 border-b border-[#d4af37]/40 px-4 py-2.5 flex items-center justify-between z-10">
        <span className="font-['Cinzel'] text-[0.62rem] sm:text-xs tracking-[0.18em] text-[#fef08a] font-bold uppercase">
          {scene.panelTitle}
        </span>
        <div className="flex gap-1.5 text-xs">
          {scene.extras.map((e, i) => <span key={`ex-${i}`}>{e}</span>)}
        </div>
      </div>

      {/* ── Split Photorealistic Beverage Tray (`ภาพจริง ไม่ใช่การ์ตูน`) ── */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-3 relative bg-gradient-to-b from-[#062319]/70 via-[#041410] to-[#1c130d]/80">
        
        {/* Left Beverage Option (Swipe Left) */}
        <motion.div
          animate={isLeftActive ? { scale: 1.05, borderColor: '#fef08a' } : { scale: 1, borderColor: 'rgba(212,175,55,0.35)' }}
          className={`relative rounded-2xl border-2 bg-[#041410]/80 overflow-hidden flex flex-col items-center justify-between p-2 shadow-md transition-all ${
            isLeftActive ? 'ring-2 ring-[#fef08a]/80 shadow-[0_0_25px_rgba(254,240,138,0.4)]' : 'opacity-85'
          }`}
        >
          <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-[#d4af37]/40 relative bg-[#041410]">
            <img
              src={optLeft?.image_url || '/images/options/cold-towel.png'}
              alt={leftLabel}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041410]/80 via-transparent to-transparent" />
            <span className="absolute top-1.5 left-1.5 bg-[#043927]/90 border border-[#d4af37] text-[#fef08a] font-['Cinzel'] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              ✦ OPTION I
            </span>
          </div>

          <div className="text-center mt-2 px-1 pb-1">
            <p className="font-['Prompt'] text-xs text-[#f8fafc] font-light line-clamp-2 leading-snug m-0">
              {leftLabel}
            </p>
          </div>
        </motion.div>

        {/* Right Beverage Option (Swipe Right) */}
        <motion.div
          animate={isRightActive ? { scale: 1.05, borderColor: '#fef08a' } : { scale: 1, borderColor: 'rgba(212,175,55,0.35)' }}
          className={`relative rounded-2xl border-2 bg-[#041410]/80 overflow-hidden flex flex-col items-center justify-between p-2 shadow-md transition-all ${
            isRightActive ? 'ring-2 ring-[#fef08a]/80 shadow-[0_0_25px_rgba(254,240,138,0.4)]' : 'opacity-85'
          }`}
        >
          <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-[#d4af37]/40 relative bg-[#041410]">
            <img
              src={optRight?.image_url || '/images/options/warm-tea.png'}
              alt={rightLabel}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041410]/80 via-transparent to-transparent" />
            <span className="absolute top-1.5 right-1.5 bg-[#1c130d]/90 border border-[#d4af37] text-[#fef08a] font-['Cinzel'] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              OPTION II ✦
            </span>
          </div>

          <div className="text-center mt-2 px-1 pb-1">
            <p className="font-['Prompt'] text-xs text-[#f8fafc] font-light line-clamp-2 leading-snug m-0">
              {rightLabel}
            </p>
          </div>
        </motion.div>

        {/* Center Golden Brass Tray Handle Ornament */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
          <div className="bg-[#1c130d]/95 border border-[#d4af37] px-3 py-1 rounded-full shadow-lg text-[10px] font-['Cinzel'] text-[#d4af37] tracking-[0.2em] uppercase font-bold">
            ✦ SWIPE OR CLICK ✦
          </div>
        </div>
      </div>

      {/* ── Subtitle Caption Strip ── */}
      <div className="bg-[#041410]/95 px-4 py-3 border-t border-[#d4af37]/30 text-center">
        <p className="font-['Playfair_Display'] italic text-xs text-[#f8fafc]/90 m-0 tracking-wide">
          {subText}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SwipeGame({ question, onSelect }) {
  const options = question?.options || [];
  const cards   = [];

  for (let i = 0; i < options.length; i += 2) {
    cards.push({
      optLeft:  options[i],
      optRight: options[i + 1] || options[i],
      scene:    SCENES[Math.floor(i / 2) % SCENES.length],
    });
  }

  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [selectedIds, setSelectedIds]       = useState([]);
  const [panDirection, setPanDirection]     = useState('center');
  const [isExiting, setIsExiting]           = useState(false);
  const isExitingRef                        = useRef(false);

  const x      = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);

  // Swipe highlight indicator badges
  const leftIndicatorOpacity  = useTransform(x, [-160, -30, 0], [1, 0.4, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 30, 160],   [0, 0.4, 1]);

  const currentCard = cards[currentCardIdx];
  const { optLeft, optRight, scene } = currentCard || {
    optLeft:  options[0],
    optRight: options[1] || options[0],
    scene:    SCENES[0],
  };

  function commitSwipe(dir) {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);

    const target     = dir === 'left' ? -FLY_OUT_X : FLY_OUT_X;
    const selectedId = dir === 'left' ? optLeft?.id : optRight?.id;

    animate(x, target, {
      ...SPRING_FLY,
      onComplete: () => {
        const nextIds = [...selectedIds, selectedId];
        if (currentCardIdx < cards.length - 1) {
          setSelectedIds(nextIds);
          setCurrentCardIdx((prev) => prev + 1);
          x.set(0);
          setPanDirection('center');
          isExitingRef.current = false;
          setIsExiting(false);
        } else {
          onSelect(nextIds);
        }
      },
    });
  }

  function handleDragChange(_, info) {
    if (info.offset.x < -25) {
      setPanDirection('left');
    } else if (info.offset.x > 25) {
      setPanDirection('right');
    } else {
      setPanDirection('center');
    }
  }

  function handleDragEnd(_, { offset, velocity }) {
    if (isExitingRef.current) return;
    const flewLeft  = offset.x < -OFFSET_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
    const flewRight = offset.x >  OFFSET_THRESHOLD || velocity.x >  VELOCITY_THRESHOLD;

    if      (flewLeft)  commitSwipe('left');
    else if (flewRight) commitSwipe('right');
    else {
      animate(x, 0, SPRING_SNAP);
      setPanDirection('center');
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-3 pt-2 pb-8 gap-4 select-none w-full max-w-xl mx-auto font-['Prompt']">
      
      {/* ── Action Instruction Header (Minimal Clean Luxury) ── */}
      <motion.div
        key={currentCardIdx}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_ENTER}
        className="text-center max-w-md px-2 z-30"
      >
        <h3 className="font-['Cinzel'] text-base sm:text-lg text-[#fef08a] tracking-[0.18em] font-bold uppercase m-0">
          {question?.content || 'CONCIERGE SELECTION'}
        </h3>
        <p className="text-xs sm:text-sm text-[#f8fafc]/80 m-0 font-light mt-1">
          {`SELECT TRAY (${currentCardIdx + 1}/${cards.length})`}
        </p>
      </motion.div>

      {/* ── Swipeable Concierge Tray Card Stack ── */}
      <div className="relative flex items-center justify-center w-[92vw] max-w-[350px] h-[430px] sm:h-[470px]">
        
        {/* Next Card Shadow Layer */}
        {currentCardIdx < cards.length - 1 && <TrayCardShadow />}

        {/* Active Draggable Tray Face */}
        <motion.div
          key={`card-${currentCardIdx}`}
          style={{ x, rotate, cursor: isExiting ? 'default' : 'grab' }}
          drag={!isExiting ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.65}
          onDrag={handleDragChange}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: 'grabbing', scale: 0.98 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <PhotorealisticTrayFace
            scene={scene}
            optLeft={optLeft}
            optRight={optRight}
            panDirection={panDirection}
          />

          {/* Swipe Left Badge (`✦ OPTION I ✦`) */}
          <motion.div
            style={{ opacity: leftIndicatorOpacity }}
            className="absolute top-8 right-6 z-20 bg-[#047857]/95 border-2 border-[#fef08a] px-4 py-2 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.9)] backdrop-blur-xl pointer-events-none transform rotate-12 flex flex-col items-center"
          >
            <span className="font-['Cinzel'] text-xs text-[#fef08a] font-bold tracking-[0.18em] uppercase">
              ✦ SELECT OPTION I ✦
            </span>
            <span className="font-['Prompt'] text-[11px] text-white font-light mt-0.5 max-w-[140px] truncate">
              {optLeft?.label}
            </span>
          </motion.div>

          {/* Swipe Right Badge (`✦ OPTION II ✦`) */}
          <motion.div
            style={{ opacity: rightIndicatorOpacity }}
            className="absolute top-8 left-6 z-20 bg-[#1c130d]/95 border-2 border-[#fef08a] px-4 py-2 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.9)] backdrop-blur-xl pointer-events-none transform -rotate-12 flex flex-col items-center"
          >
            <span className="font-['Cinzel'] text-xs text-[#fef08a] font-bold tracking-[0.18em] uppercase">
              ✦ SELECT OPTION II ✦
            </span>
            <span className="font-['Prompt'] text-[11px] text-white font-light mt-0.5 max-w-[140px] truncate">
              {optRight?.label}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Choice Button Bar (Left vs Right) ── */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 px-2">
        <button
          onClick={() => commitSwipe('left')}
          disabled={isExiting}
          className="bg-[#043927]/90 border border-[#d4af37]/70 hover:border-[#fef08a] text-[#f8fafc] font-['Prompt'] text-xs py-3 px-3 rounded-2xl shadow-md backdrop-blur-xl transition-all hover:bg-[#047857] hover:scale-105 flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="font-['Cinzel'] text-[#d4af37] text-[10px] tracking-wider uppercase font-bold">
            ✦ ปัดซ้าย (OPTION I)
          </span>
          <span className="truncate max-w-[140px] mt-0.5 font-light">
            {optLeft?.label}
          </span>
        </button>

        <button
          onClick={() => commitSwipe('right')}
          disabled={isExiting}
          className="bg-[#1c130d]/90 border border-[#d4af37]/70 hover:border-[#fef08a] text-[#f8fafc] font-['Prompt'] text-xs py-3 px-3 rounded-2xl shadow-md backdrop-blur-xl transition-all hover:bg-[#3f2b1d] hover:scale-105 flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="font-['Cinzel'] text-[#d4af37] text-[10px] tracking-wider uppercase font-bold">
            ปัดขวา (OPTION II) ✦
          </span>
          <span className="truncate max-w-[140px] mt-0.5 font-light">
            {optRight?.label}
          </span>
        </button>
      </div>
    </div>
  );
}
