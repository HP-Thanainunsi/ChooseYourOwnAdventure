/**
 * StoryScrollContainer.jsx — Scrollytelling 3D Parallax Game Flow
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamically renders GameStages fetched from /api/game-flow.
 *
 * Requirements Met:
 *   1. Full-viewport section (100vh): Each stage renders vertically with ample spacing.
 *   2. Thai-Comic Typography: Displays story_text using 'Chonburi' font at the top
 *      of each section in a dynamic 3D pop-art banner.
 *   3. Dynamic Mini-Game Component: Reads game_type ('swipe', 'mixology', 'tarot')
 *      and renders exact matching component (<SwipeGame />, <MixologyGame />, <TarotGame />)
 *      passing specific options to it.
 *   4. Strict Scrolling Logic: 1 Story Section = 1 Game Action. Only stages up to
 *      unlockedIndex + 1 are rendered/accessible, ensuring the user cannot scroll
 *      to Stage 2 until Stage 1 is completed.
 *   5. 3D Parallax Effects: Background layer (`translateZ(-250px)`) displays custom
 *      background_image_url with smooth parallax on scroll alongside foreground effects.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

import SwipeGame    from './SwipeGame';
import MixologyGame from './MixologyGame';
import TarotGame    from './TarotGame';

// ─── Map question/stage game_type → React component ───────────────────────────
const COMPONENT_MAP = {
  swipe:     SwipeGame,
  mixology:  MixologyGame,
  drag_drop: MixologyGame,
  tarot:     TarotGame,
};

// ─── Comic & Thai Foreground / Background Assets per Section ──────────────────
const SECTION_THEMES = [
  {
    bgGrad:     'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
    bgAccent:   '#00f5ff',
    issueTitle: 'ISSUE #01 • THE MORNING AWAKENING',
    soundLeft:  '💥 VROOM!',
    soundRight: '⚡ ZAP!',
    thaiIcon1:  '🛺',
    thaiIcon2:  '🌶️',
  },
  {
    bgGrad:     'linear-gradient(135deg, #2b0c1e 0%, #4a0e35 100%)',
    bgAccent:   '#ff2a85',
    issueTitle: 'ISSUE #02 • MIXING THE SPIRIT',
    soundLeft:  '💥 SPLASH!',
    soundRight: 'POP!',
    thaiIcon1:  '🐘',
    thaiIcon2:  '🌿',
  },
  {
    bgGrad:     'linear-gradient(135deg, #1b1b00 0%, #302600 100%)',
    bgAccent:   '#ffde59',
    issueTitle: 'ISSUE #03 • THE DESTINY TAROT',
    soundLeft:  '⚡ KA-POW!',
    soundRight: '✨ SHAZAM!',
    thaiIcon1:  '🏯',
    thaiIcon2:  '🃏',
  },
  {
    bgGrad:     'linear-gradient(135deg, #0a251c 0%, #163829 100%)',
    bgAccent:   '#00ff88',
    issueTitle: 'ISSUE #04 • BANGKOK NIGHTS',
    soundLeft:  '🔥 BOOM!',
    soundRight: '🍸 CHEERS!',
    thaiIcon1:  '🛶',
    thaiIcon2:  '🎇',
  },
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

  // ── 3. Foreground Layer (Fastest) `translateZ(180px)` ──────────────────────
  const fgY        = useTransform(scrollYProgress, [0, 1], [320, -320]);
  const fgRotate   = useTransform(scrollYProgress, [0, 1], [-18, 18]);
  const fgOpposite = useTransform(scrollYProgress, [0, 1], [18, -18]);

  const theme      = SECTION_THEMES[index % SECTION_THEMES.length];
  const gameType   = question?.game_type || question?.type || 'swipe';
  const QuestionComponent = COMPONENT_MAP[gameType] ?? SwipeGame;

  const handleSelection = (optionId) => {
    if (!isUnlocked) return;
    onSelectOption(index, optionId);
  };

  const storyText  = question?.story_text || question?.content || 'Your spirit journey unfolds...';
  const stepNumber = question?.step_order || index + 1;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-[10vh] my-[15vh] px-4 overflow-visible"
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
        className="absolute inset-0 rounded-3xl border-4 border-[#1a1a1a] shadow-[12px_12px_0_#1a1a1a] overflow-hidden pointer-events-none flex flex-col justify-between p-8"
      >
        {/* Custom Background Image if provided (`background_image_url`) */}
        {question?.background_image_url && (
          <div className="absolute inset-0 z-0">
            <img
              src={question.background_image_url}
              alt="Stage background"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
          </div>
        )}

        {/* Halftone Comic Pattern Texture */}
        <div
          className="absolute inset-0 opacity-25 z-1"
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.bgAccent} 2px, transparent 2px)`,
            backgroundSize: '14px 14px',
          }}
        />

        {/* Big Watermark Issue Number */}
        <div className="absolute -bottom-10 -right-10 font-['Bangers'] text-8xl md:text-9xl text-white/10 select-none tracking-widest z-2">
          #{stepNumber}
        </div>

        {/* Comic Banner Top */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-white/20 pb-3">
          <span
            className="font-['Bangers'] text-lg md:text-xl tracking-wider uppercase px-3 py-1 border-2 border-[#1a1a1a]"
            style={{ backgroundColor: theme.bgAccent, color: '#1a1a1a' }}
          >
            {theme.issueTitle}
          </span>
          <span className="font-['Outfit'] text-xs text-white/60 font-semibold uppercase tracking-widest">
            SCROLLYTELLING STAGE {stepNumber} OF {total}
          </span>
        </div>
      </motion.div>

      {/* ─── LAYER 2: MIDDLE LAYER (STORY TEXT & INTERACTIVE MINI-GAME) `translateZ(0px)` ── */}
      <div
        className={`relative z-20 w-full max-w-3xl flex flex-col items-center transition-all duration-500 ${
          !isUnlocked ? 'opacity-30 pointer-events-none filter blur-[4px]' : 'opacity-100'
        }`}
        style={{ transform: 'translateZ(0px)' }}
      >
        {/* Completion status badge */}
        {isCompleted && (
          <div className="self-end mb-2 z-30 bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-sm tracking-widest px-4 py-1 border-2 border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] rotate-2">
            ★ STAGE #{stepNumber} COMPLETED! ★
          </div>
        )}

        {/* Story Text Header in Thai-Comic / Pop Art Style ('Chonburi' font) */}
        <div className="mb-8 text-center w-full px-2">
          <div className="inline-block bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-sm md:text-base tracking-widest px-4 py-1 border-3 border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] uppercase -rotate-1 mb-3">
            ⚡ STAGE #{stepNumber} • {gameType.toUpperCase()} ACTION ⚡
          </div>
          <h2
            className="text-2xl md:text-4xl lg:text-5xl font-['Chonburi'] text-white leading-tight tracking-wide p-6 md:p-8 bg-[#1a1a1a]/90 border-4 border-white rounded-3xl shadow-[8px_8px_0_#ff1616,16px_16px_0_#1a1a1a] backdrop-blur-md relative overflow-hidden text-center"
            style={{
              textShadow: '2px 2px 0 #ff1616, -1px -1px 0 #1a1a1a',
            }}
          >
            {/* Speed lines pattern behind story text */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #ffde59 0, #ffde59 10px, transparent 10px, transparent 20px)',
              }}
            />
            <span className="relative z-10 block">{storyText}</span>
          </h2>
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
          <div className="bg-[#ff1616] text-white font-['Bangers'] text-xl md:text-2xl tracking-widest px-8 py-4 border-4 border-[#1a1a1a] shadow-[6px_6px_0_#1a1a1a] -rotate-2 uppercase animate-pulse">
            🔒 COMPLETE STAGE #{index} ABOVE TO UNLOCK THIS ACTION!
          </div>
        </div>
      )}

      {/* ─── LAYER 3: FAST FOREGROUND LAYER (`translateZ(180px)`) ───────────── */}
      <motion.div
        style={{
          y: fgY,
          transform: 'translateZ(180px)',
        }}
        className="absolute inset-0 pointer-events-none flex justify-between items-center px-4 md:px-12 z-40 overflow-visible"
      >
        {/* Left Floating Sound Sticker */}
        <motion.div
          style={{ rotate: fgRotate }}
          className="hidden md:flex flex-col items-center justify-center bg-[#ff1616] text-white font-['Bangers'] text-2xl px-4 py-2 border-3 border-white shadow-[4px_4px_0_#1a1a1a] rounded-xl -translate-x-6"
        >
          <span>{theme.soundLeft}</span>
          <span className="text-4xl mt-1">{theme.thaiIcon1}</span>
        </motion.div>

        {/* Right Floating Sound Sticker */}
        <motion.div
          style={{ rotate: fgOpposite }}
          className="hidden md:flex flex-col items-center justify-center bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-2xl px-4 py-2 border-3 border-white shadow-[4px_4px_0_#1a1a1a] rounded-xl translate-x-6"
        >
          <span>{theme.soundRight}</span>
          <span className="text-4xl mt-1">{theme.thaiIcon2}</span>
        </motion.div>
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
  // Track which section index is currently unlocked (`0` initially)
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [selectionsMap, setSelectionsMap] = useState({});
  const sectionRefs                       = useRef({});

  // Sort stages/questions strictly by step_order ASC
  const sortedStages = [...questions].sort((a, b) => {
    const orderA = Number(a.step_order) || 0;
    const orderB = Number(b.step_order) || 0;
    return orderA - orderB;
  });

  const registerRef = (index, domNode) => {
    sectionRefs.current[index] = domNode;
  };

  // Sync initial selections if passed in
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

  // Handle option selection in stage index
  const handleSectionSelect = (index, optionId) => {
    const updatedMap = { ...selectionsMap, [index]: optionId };
    setSelectionsMap(updatedMap);

    // Build ordered selections array up to current filled questions
    const updatedArray = Object.keys(updatedMap)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => updatedMap[k]);

    // Inform parent of choice
    if (onSelectOption) {
      onSelectOption(index, optionId);
    }

    const isLastQuestion = index === sortedStages.length - 1;

    if (!isLastQuestion) {
      // Unlock next stage (1 Story Section = 1 Game Action)
      const nextIndex = Math.max(unlockedIndex, index + 1);
      setUnlockedIndex(nextIndex);

      // Smoothly auto-scroll down to the next unlocked stage after selection
      setTimeout(() => {
        const nextNode = sectionRefs.current[index + 1];
        if (nextNode) {
          nextNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 550);
    } else {
      // Final question answered → Auto-scroll to bottom and complete
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });

        // Trigger onCompleteAll with full selections array
        setTimeout(() => {
          if (onCompleteAll) {
            onCompleteAll(updatedArray);
          }
        }, 850);
      }, 500);
    }
  };

  const allCompleted =
    Object.keys(selectionsMap).length === sortedStages.length && sortedStages.length > 0;

  // Strict scrolling logic: 1 Story Section = 1 Game Action.
  // We only render sections up to `unlockedIndex + 1` (where `unlockedIndex + 1` is displayed as locked).
  // The user physically cannot scroll down to Stage 2 until Stage 1 action is completed!
  const renderedStages = sortedStages.slice(0, unlockedIndex + 2);

  return (
    <div
      className="relative w-full overflow-x-hidden flex flex-col items-center"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top Banner Guide */}
      <div className="sticky top-4 z-50 bg-[#1a1a1a] border-3 border-white px-5 py-2 shadow-[4px_4px_0_#ffde59] rounded-full flex items-center gap-3">
        <span className="text-xl">📜</span>
        <span className="font-['Bangers'] text-white tracking-widest text-sm md:text-base uppercase">
          1 STORY = 1 ACTION • COMPLETE STAGE TO UNLOCK NEXT CHAPTER
        </span>
      </div>

      {/* Render stages vertically with 100vh full-viewport layout */}
      <div className="w-full flex flex-col items-center">
        {renderedStages.map((stage, index) => {
          const isUnlocked  = index <= unlockedIndex;
          const isCompleted = selectionsMap[index] !== undefined;

          return (
            <ScrollySection
              key={stage.id ?? index}
              question={stage}
              index={index}
              total={sortedStages.length}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              onSelectOption={handleSectionSelect}
              registerRef={registerRef}
            />
          );
        })}
      </div>

      {/* Bottom Completion Splash before transitioning to result */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl my-24 bg-gradient-to-r from-[#ff1616] via-[#ff2a85] to-[#ff9100] border-4 border-white p-8 rounded-3xl shadow-[0_0_0_4px_#1a1a1a,10px_10px_0_#1a1a1a] text-center text-white"
          >
            <div className="text-6xl mb-3 animate-bounce">⚡🚀</div>
            <h3
              className="text-4xl md:text-5xl font-['Chonburi'] uppercase tracking-wide"
              style={{
                textShadow: '3px 3px 0 #1a1a1a, 6px 6px 0 #ffd700',
              }}
            >
              JOURNEY COMPLETE!
            </h3>
            <p className="font-['Bangers'] text-xl tracking-widest text-[#ffde59] mt-2">
              SUMMONING YOUR DESTINED BANGKOK BAR & SPIRIT DRINK...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
