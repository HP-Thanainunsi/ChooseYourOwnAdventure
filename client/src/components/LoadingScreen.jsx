/**
 * LoadingScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Garden of Siam — 5-Star Luxury Hotel Bar Loading & Transition Screen
 * Features glassmorphism panels, golden lotus animation, and cinematic lighting.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'ต้อนรับสู่ Garden of Siam...', mystical = false, progressPercent = null }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-10 px-6 bg-[#041410] overflow-hidden select-none">
      
      {/* Background Cinematic Glow & Golden Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#0a4f37_0%,transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#d4af37]/15 via-[#043927]/30 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* Floating Gold Dust Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]"
            style={{
              top: `${15 + (i * 7)}%`,
              left: `${10 + (i * 7)}%`,
            }}
          />
        ))}
      </div>

      {/* ── Visual Indicator: Golden Lotus & Glass Ring ────── */}
      <div className="relative flex items-center justify-center w-52 h-52 z-10">
        
        {/* Outer Thin Gold Glass Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-[#d4af37]/40 shadow-[0_0_35px_rgba(212,175,55,0.2)] bg-[#043927]/20 backdrop-blur-md flex items-center justify-center"
        >
          {/* 4 Elegant Gold Accents */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"
              style={{
                transform: `rotate(${deg}deg) translateY(-102px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Middle Counter-Spinning Emerald/Gold Ring */}
        <motion.div
          animate={{ rotate: -360, scale: [0.96, 1.04, 0.96] }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
            scale:  { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute w-38 h-38 rounded-full border border-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
          style={{ width: '152px', height: '152px' }}
        />

        {/* Center Glowing Golden Lotus / Sparkles */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            y: [-3, 3, -3]
          }}
          transition={{
            scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="relative z-20 flex flex-col items-center justify-center text-6xl md:text-7xl filter drop-shadow-[0_0_30px_rgba(212,175,55,0.7)]"
        >
          <span>{mystical ? '✨' : '🪷'}</span>
        </motion.div>
      </div>

      {/* ── Message & Progress Bar in Glass Panel ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-5 max-w-md w-full z-10 px-6 py-8 rounded-3xl bg-[#043927]/40 border border-[#d4af37]/40 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        <div className="inline-block bg-[#0b132b]/80 border border-[#d4af37]/60 rounded-full px-5 py-1.5 shadow-[0_4px_15px_rgba(212,175,55,0.15)]">
          <span className="font-['Cinzel'] text-[#d4af37] text-xs md:text-sm tracking-[0.25em] uppercase font-medium">
            {mystical ? '✨ THE HIDDEN SANCTUARY ✨' : '🌿 GARDEN OF SIAM • 5-STAR BAR 🌿'}
          </span>
        </div>

        <p
          className="text-[#f8fafc] font-['Playfair_Display'] text-xl md:text-2xl tracking-wide leading-relaxed font-light"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
        >
          {message}
        </p>

        {progressPercent !== null && (
          <div className="w-full bg-[#0b132b]/80 p-1 rounded-full border border-[#d4af37]/40 shadow-inner">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-[#047857] via-[#d4af37] to-[#f59e0b] transition-all duration-500 ease-out shadow-[0_0_15px_#d4af37]"
              style={{ width: `${Math.max(6, Math.min(100, progressPercent))}%` }}
            />
          </div>
        )}

        {/* Elegant Gold Dots */}
        <div className="flex gap-3 justify-center pt-2">
          {['#047857', '#d4af37', '#f59e0b'].map((color, idx) => (
            <motion.div
              key={color}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: idx * 0.3, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ background: color, color }}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
