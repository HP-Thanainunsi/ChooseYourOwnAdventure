/**
 * StoryScrollContainer.jsx — Scrollytelling 3D Parallax Game Flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically renders GameStages fetched from /api/game-flow in our luxury
 * "Garden of Siam — 5-Star Hotel Bar" aesthetic.
 *
 * Requirements Met:
 *   1. Full-viewport section (100vh): Each chamber renders vertically with luxury spacing.
 *   2. Luxury Serif Typography: Displays story_text using 'Playfair Display' font inside
 *      frosted glass panels with golden trim.
 *   3. Dynamic Mini-Game Component: Reads game_type ('swipe', 'mixology', 'tarot')
 *      and renders exact matching component (<SwipeGame />, <MixologyGame />, <TarotGame />).
 *   4. Strict Scrolling Logic: 1 Chamber = 1 Action. Only stages up to
 *      unlockedIndex + 1 are rendered/accessible.
 *   5. 3D Parallax Effects: Background layer (`translateZ(-250px)`) displays custom
 *      background_image_url with smooth parallax alongside ambient luxury floating lights.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

import SwipeGame from './SwipeGame';
import MixologyGame from './MixologyGame';
import TarotGame from './TarotGame';

// ─── Map question/stage game_type → React component ───────────────────────────
const COMPONENT_MAP = {
  swipe: SwipeGame,
  mixology: MixologyGame,
  drag_drop: MixologyGame,
  tarot: TarotGame,
};

// ─── Luxury Glass Message Panel Component ─────────────────────────────────────
function LuxuryMessageCard({ text }) {
  if (!text) return null;
  return (
    <div className="relative text-center px-4 z-10 mb-8 w-full flex justify-center">
      <div className="inline-block bg-[#043927]/65 border border-[#d4af37]/50 rounded-3xl px-8 py-6 relative max-w-[92%] shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-2xl">
        {/* Subtle gold corner accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#d4af37]/70" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#d4af37]/70" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#d4af37]/70" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#d4af37]/70" />

        <p className="font-['Playfair_Display'] italic text-lg sm:text-2xl md:text-3xl text-[#f8fafc] leading-relaxed m-0 tracking-wide font-light">
          {text}
        </p>

        {/* Elegant Gold Dividing Line underneath */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-4 opacity-70" />
      </div>
    </div>
  );
}

// ─── Luxury Velvet & Gold Screen Wipe Transition Overlay ──────────────────────
function LuxuryTransitionOverlay({ isWiping, text }) {
  return (
    <AnimatePresence>
      {isWiping && (
        <motion.div
          key="wipe-overlay"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto overflow-hidden bg-[#021e14]/95 border-y border-[#d4af37]/60 shadow-[0_0_100px_rgba(212,175,55,0.4)] backdrop-blur-3xl"
        >
          {/* Ambient golden dust in transition */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Dynamic Gold Text Box */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 px-10 py-8 bg-[#043927]/80 border border-[#d4af37]/70 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.25)] max-w-lg text-center mx-4 backdrop-blur-2xl"
          >
            <div className="text-3xl mb-3">✨ 🪷 ✨</div>
            <p className="font-['Cinzel'] text-xl sm:text-2xl md:text-3xl text-[#d4af37] tracking-[0.15em] m-0 uppercase leading-relaxed font-semibold">
              {text || 'SANCTUARY GATE UNLOCKED'}
            </p>
            <div className="w-16 h-0.5 bg-[#d4af37]/60 mx-auto mt-4" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Luxury Chamber Themes per Section ────────────────────────────────────────
const LUXURY_CHAMBERS = [
  {
    bgGrad: 'linear-gradient(135deg, #021e14 0%, #043927 100%)',
    bgAccent: '#d4af37',
    issueTitle: 'CHAMBER I • THE CONCIERGE SANCTUARY',
    soundLeft: '🌿 Jasmine Breeze',
    soundRight: '✨ Golden Dew',
    thaiIcon1: '🪷',
    thaiIcon2: '🍸',
  },
  {
    bgGrad: 'linear-gradient(135deg, #1c130d 0%, #2c1810 100%)',
    bgAccent: '#f59e0b',
    issueTitle: 'CHAMBER II • BENJARONG ALCHEMY LAB',
    soundLeft: '🥃 Smoked Teakwood',
    soundRight: '🍯 Royal Honey',
    thaiIcon1: '⚱️',
    thaiIcon2: '🌿',
  },
  {
    bgGrad: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)',
    bgAccent: '#d4af37',
    issueTitle: 'CHAMBER III • THE BRASS KEY VAULT',
    soundLeft: '🗝️ Secret Gate',
    soundRight: '✨ Emerald Glow',
    thaiIcon1: '🗝️',
    thaiIcon2: '🪷',
  },
];

const DEFAULT_STAGE_BGS = [
  '/images/stages/morning-bangkok.png',
  '/images/stages/sukhumvit-bts.png',
  '/images/stages/nana-speakeasy.png',
];

// ─── Individual Parallax Scrolly Section Component ────────────────────────────
function ScrollySection({
  question,
  index,
  total,
  isUnlocked,
  isCompleted,
  onSelectOption,
  registerRef,
}) {
  const sectionRef = useRef(null);

  // Register section ref for auto-scrolling
  useEffect(() => {
    if (registerRef && sectionRef.current) {
      registerRef(index, sectionRef.current);
    }
  }, [index, registerRef]);

  // Track scroll progress within this specific section (`0` at entry, `1` at exit)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // ── 1. Background Layer (Slowest) `translateZ(-250px)` ─────────────────────
  const bgY = useTransform(scrollYProgress, [0, 1], [-140, 140]);

  // ── 1.5. Middle Parallax Layer (`translateZ(-140px)`) ──
  const midY = useTransform(scrollYProgress, [0, 1], [-70, 70]);
  const wireY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  // ── 3. Foreground Layer (Fastest) `translateZ(180px)` ──────────────────────
  const fgY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const { lang, getLocalized } = useLanguage();
  const theme = LUXURY_CHAMBERS[index % LUXURY_CHAMBERS.length];
  const gameType = question?.game_type || question?.type || 'swipe';
  const QuestionComponent = COMPONENT_MAP[gameType] ?? SwipeGame;

  const handleSelection = (optionId) => {
    if (!isUnlocked) return;
    onSelectOption(index, optionId);
  };

  const storyText =
    getLocalized(question, 'content') ||
    getLocalized(question, 'story_text') ||
    question?.content ||
    question?.story_text ||
    'Your spirit journey unfolds...';

  const chamberTitle =
    lang === 'th' && index === 0
      ? 'ห้องที่ 1 • วิหารต้อนรับส่วนตัว'
      : lang === 'th' && index === 1
        ? 'ห้องที่ 2 • โถงผสมโอสถเบญจรงค์'
        : lang === 'th' && index === 2
          ? 'ห้องที่ 3 • บานกุญแจลับแห่งสยาม'
          : theme.issueTitle;

  const stepNumber = question?.step_order || index + 1;
  const bgUrl = question?.background_image_url || DEFAULT_STAGE_BGS[index % DEFAULT_STAGE_BGS.length];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-[10vh] my-[12vh] px-4 overflow-visible"
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* ─── LAYER 1: SLOW BACKGROUND LAYER (`translateZ(-250px)`) ──────────── */}
      <motion.div
        style={{
          y: bgY,
          transform: 'translateZ(-250px) scale(1.28)',
          background: theme.bgGrad,
        }}
        className="absolute inset-0 rounded-3xl border border-[#d4af37]/35 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-none flex flex-col justify-between p-8"
      >
        {/* Custom or Fallback Background Image (`bgUrl`) */}
        {bgUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={bgUrl}
              alt="Chamber background"
              className="w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125"
            />
          </div>
        )}

        {/* Golden Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041410] via-transparent to-[#041410]/80 z-1" />

        {/* Big Watermark Chamber Number */}
        <div className="absolute -bottom-6 -right-6 font-['Cinzel'] text-8xl md:text-9xl text-[#d4af37]/10 select-none tracking-widest z-2 font-bold">
          {stepNumber}
        </div>

        {/* Chamber Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#d4af37]/30 pb-4">
          <span
            className="font-['Cinzel'] text-sm md:text-base tracking-[0.2em] font-semibold uppercase px-4 py-1.5 rounded-full border border-[#d4af37]/50 shadow-sm"
            style={{ backgroundColor: 'rgba(4, 57, 39, 0.7)', color: theme.bgAccent }}
          >
            {chamberTitle}
          </span>
          <span className="font-['Cinzel'] text-xs text-[#f8fafc]/60 uppercase tracking-widest">
            CHAMBER {stepNumber} OF {total}
          </span>
        </div>
      </motion.div>

      {/* ─── LAYER 1.5: MIDDLE CONTINUOUS LUXURY ATMOSPHERE BAR ─── */}
      <motion.div
        style={{
          y: wireY,
          transform: 'translateZ(-140px) scale(1.16)',
        }}
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex flex-col justify-between py-10"
      >
        {/* Luxury Sanctuary Ribbon 
        <div className="w-full opacity-80 border-y border-[#d4af37]/40 h-12 relative flex items-center justify-around bg-gradient-to-r from-[#041410] via-[#043927]/80 to-[#041410] shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <span className="text-lg text-[#d4af37] animate-pulse">✨</span>
          <span className="text-xs md:text-sm font-['Cinzel'] text-[#d4af37] tracking-[0.25em] uppercase">
            GARDEN OF SIAM SANCTUARY • EXCLUSIVE 5-STAR MIXOLOGY EXPERIENCE
          </span>
          <span className="text-lg text-[#d4af37] animate-pulse">✨</span>
        </div>
*/}
        {/* Floating Concierge & Signature Badges */}
        <motion.div style={{ y: midY }} className="flex justify-between w-full px-4 sm:px-10 opacity-85">
          <div className="bg-[#043927]/85 border border-[#d4af37]/50 px-4 py-1.5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-[#f8fafc] font-['Prompt'] text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md">
            <span className="text-[#d4af37]">🛎️</span>
            <span>บริการส่วนตัวระดับ 5 ดาว</span>
          </div>
          <div className="bg-[#1c130d]/85 border border-[#d4af37]/50 px-4 py-1.5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-[#f8fafc] font-['Prompt'] text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md">
            <span className="text-[#d4af37]">🍸</span>
            <span>เครื่องดื่มรังสรรค์พิเศษโดยมาสเตอร์บาร์เทนเดอร์</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── LAYER 2: MIDDLE LAYER (STORY TEXT & INTERACTIVE MINI-GAME) `translateZ(0px)` ── */}
      <div
        className={`relative z-20 w-full max-w-3xl flex flex-col items-center transition-all duration-500 ${!isUnlocked ? 'opacity-30 pointer-events-none filter blur-[4px]' : 'opacity-100'
          }`}
        style={{ transform: 'translateZ(0px)' }}
      >
        {/* Completion status badge */}
        {isCompleted && (
          <div className="self-end mb-3 z-30 bg-[#d4af37] text-[#041410] font-['Cinzel'] font-bold text-xs md:text-sm tracking-[0.2em] px-5 py-1.5 rounded-full border border-[#fef08a] shadow-[0_4px_15px_rgba(212,175,55,0.4)]">
            ★ CHAMBER {stepNumber} RESOLVED ★
          </div>
        )}

        {/* Story Text in Luxury Glass Panel */}
        <div className="mb-6 text-center w-full px-2 flex flex-col items-center">
          <div className="inline-block bg-[#0b132b]/90 border border-[#d4af37]/60 rounded-full px-5 py-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.5)] mb-5">
            <span className="font-['Cinzel'] text-[#d4af37] text-xs md:text-sm tracking-[0.25em] uppercase font-medium">
              ✨ CHAMBER {stepNumber} • {gameType.toUpperCase()} ACTION ✨
            </span>
          </div>
          <LuxuryMessageCard text={storyText} />
        </div>

        {/* Exact Matching Mini-Game Component */}
        <div className="w-full max-w-2xl flex justify-center">
          <QuestionComponent
            question={question}
            options={question?.options ?? []}
            onSelect={handleSelection}
          />
        </div>
      </div>

      {/* ─── LOCKED OVERLAY IF NOT UNLOCKED YET ─────────────────────────────── */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-4 text-center">
          <div className="bg-[#0b132b]/90 text-[#fef08a] font-['Cinzel'] text-lg md:text-xl tracking-[0.15em] px-8 py-5 rounded-3xl border border-[#d4af37]/70 shadow-[0_20px_50px_rgba(0,0,0,0.9)] uppercase font-medium backdrop-blur-xl">
            🔒 COMPLETE CHAMBER {index} ABOVE TO UNLOCK THIS GATE
          </div>
        </div>
      )}

      {/* ─── LAYER 3: FAST FOREGROUND LAYER (`translateZ(180px)`) ───────────── */}
      <motion.div
        style={{
          y: fgY,
          opacity: fgOpacity,
          transform: 'translateZ(180px)',
        }}
        className="absolute inset-0 pointer-events-none flex justify-between items-center px-4 md:px-12 z-40 overflow-visible"
      >
        {/* Left Floating Whisper Badge */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#043927]/90 text-[#f8fafc] font-['Cinzel'] text-sm px-4 py-2.5 border border-[#d4af37]/60 shadow-[0_10px_25px_rgba(0,0,0,0.7)] rounded-2xl -translate-x-4 backdrop-blur-md">
          <span className="text-[#d4af37] font-semibold">{theme.soundLeft}</span>
          <div className="flex items-center gap-1.5 mt-1 text-2xl">
            <span>{theme.thaiIcon1}</span>
          </div>
        </div>

        {/* Right Floating Whisper Badge */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#1c130d]/90 text-[#f8fafc] font-['Cinzel'] text-sm px-4 py-2.5 border border-[#d4af37]/60 shadow-[0_10px_25px_rgba(0,0,0,0.7)] rounded-2xl translate-x-4 backdrop-blur-md">
          <span className="text-[#d4af37] font-semibold">{theme.soundRight}</span>
          <div className="flex items-center gap-1.5 mt-1 text-2xl">
            <span>{theme.thaiIcon2}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Main Story Scroll Container Component ────────────────────────────────────
export default function StoryScrollContainer({
  questions = [],
  userSelections = [],
  onSelectOption,
  onCompleteAll,
}) {
  const { lang } = useLanguage();
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [selectionsMap, setSelectionsMap] = useState({});
  const [isWiping, setIsWiping] = useState(false);
  const [wipeText, setWipeText] = useState('');
  const sectionRefs = useRef({});

  const sortedStages = [...questions].sort((a, b) => {
    const orderA = Number(a.step_order) || 0;
    const orderB = Number(b.step_order) || 0;
    return orderA - orderB;
  });

  const registerRef = (index, domNode) => {
    sectionRefs.current[index] = domNode;
  };

  useEffect(() => {
    if (Array.isArray(userSelections) && userSelections.length > 0) {
      const map = {};
      userSelections.forEach((optId, idx) => {
        if (optId !== undefined && optId !== null) {
          map[idx] = optId;
        }
      });
      setSelectionsMap(map);
      setUnlockedIndex(Math.min(userSelections.length, sortedStages.length - 1));
    }
  }, [userSelections, sortedStages.length]);

  const handleSectionSelect = (index, optionId) => {
    const isLastQuestion = index === sortedStages.length - 1;
    setWipeText(
      isLastQuestion
        ? '✨ ALCHEMY COMPLETE • PRESENTING YOUR SIGNATURE DRINK ✨'
        : '🌿 CHAMBER RESOLVED • OPENING NEXT SANCTUARY GATE 🌿'
    );
    setIsWiping(true);

    setTimeout(() => {
      const updatedMap = { ...selectionsMap, [index]: optionId };
      setSelectionsMap(updatedMap);

      const updatedArray = Object.keys(updatedMap)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => updatedMap[k]);

      if (onSelectOption) {
        onSelectOption(index, optionId);
      }

      if (!isLastQuestion) {
        const nextIndex = Math.max(unlockedIndex, index + 1);
        setUnlockedIndex(nextIndex);

        setTimeout(() => {
          setIsWiping(false);
          const nextNode = sectionRefs.current[index + 1];
          if (nextNode) {
            nextNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 480);
      } else {
        setTimeout(() => {
          setIsWiping(false);
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          });

          setTimeout(() => {
            if (onCompleteAll) {
              onCompleteAll(updatedArray);
            }
          }, 600);
        }, 480);
      }
    }, 450);
  };

  const allCompleted =
    Object.keys(selectionsMap).length === sortedStages.length && sortedStages.length > 0;

  const renderedStages = sortedStages.slice(0, unlockedIndex + 2);

  return (
    <div
      className="relative w-full overflow-x-hidden flex flex-col items-center bg-[#041410]"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      <LuxuryTransitionOverlay isWiping={isWiping} text={wipeText} />

      {/* Render stages vertically */}
      <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {renderedStages.map((stage, index) => {
            const isUnlocked = index <= unlockedIndex;
            const isCompleted = selectionsMap[index] !== undefined;

            return (
              <motion.div
                key={stage.id ?? index}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -30 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="w-full flex flex-col items-center"
              >
                <ScrollySection
                  question={stage}
                  index={index}
                  total={sortedStages.length}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  onSelectOption={handleSectionSelect}
                  registerRef={registerRef}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Completion Banner before transitioning to result */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl my-24 bg-gradient-to-r from-[#043927] via-[#1c130d] to-[#043927] border border-[#d4af37]/70 p-10 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.25)] text-center text-white backdrop-blur-2xl"
          >
            <div className="text-6xl mb-4 animate-bounce">🥂✨</div>
            <h3
              className="text-3xl md:text-4xl font-['Cinzel'] uppercase tracking-[0.15em] font-bold text-[#d4af37]"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              {lang === 'th' ? 'เส้นทางแห่งวิหารลับเสร็จสมบูรณ์' : 'SANCTUARY JOURNEY RESOLVED'}
            </h3>
            <p className="font-['Playfair_Display'] italic text-lg text-[#f8fafc]/90 mt-3 font-light">
              {lang === 'th' ? 'มาสเตอร์บาร์เทนเดอร์กำลังรังสรรค์ค็อกเทลแก้วพิเศษของคุณ...' : 'Crafting your bespoke 5-star signature cocktail...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
