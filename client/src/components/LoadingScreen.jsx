/**
 * LoadingScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Thai Street-Pop & Mystical Loading Screen with Rotating Neon Lotus / Lai Thai pattern.
 * Eliminates generic spinners in favor of rich, glowing Bangkok night aesthetics.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'กำลังโหลดข้อมูลเมืองสยาม...', mystical = false, progressPercent = null }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-10 px-6 bg-[#0f0a18] overflow-hidden select-none">
      
      {/* Background Halftone & Neon Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ff007f 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#ff007f]/20 via-[#00f0ff]/15 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* ── Visual Indicator: Spinning Lai Thai / Rotating Neon Lotus ────── */}
      <div className="relative flex items-center justify-center w-48 h-48 z-10">
        
        {/* Outer Golden/Cyan Lai Thai Pattern Wheel */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-[3px] border-dashed border-[#ffde59]/60 shadow-[0_0_25px_rgba(255,222,89,0.3)] flex items-center justify-center"
        >
          {/* 8 Ornamental Lai Thai / Street-Pop cardinal dots */}
          {Array.from({ length: 8 }, (_, i) => i * 45).map((deg) => (
            <div
              key={`cardinal-${deg}`}
              className="absolute w-3 h-3 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]"
              style={{
                transform: `rotate(${deg}deg) translateY(-88px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Middle Counter-Spinning Neon Magenta Ring */}
        <motion.div
          animate={{ rotate: -360, scale: [0.95, 1.05, 0.95] }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
            scale:  { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute w-36 h-36 rounded-full border-4 border-t-[#ff007f] border-r-[#ffde59] border-b-[#00f0ff] border-l-transparent shadow-[0_0_30px_rgba(255,0,127,0.6)]"
        />

        {/* Inner Pulsing Thai Sacred Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 rounded-full border-2 border-[#ffde59] opacity-80"
        />

        {/* Center Rotating & Floating Neon Lotus */}
        <motion.div
          animate={{
            rotate: mystical ? [0, 15, -15, 0] : [0, 360],
            scale:  [1, 1.15, 1],
            y:      [-4, 4, -4]
          }}
          transition={{
            rotate: { duration: mystical ? 4 : 10, repeat: Infinity, ease: 'easeInOut' },
            scale:  { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            y:      { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="relative z-20 flex items-center justify-center text-6xl md:text-7xl filter drop-shadow-[0_0_25px_rgba(255,0,127,0.9)] cursor-pointer"
        >
          {mystical ? '🔮' : '🪷'}
        </motion.div>
      </div>

      {/* ── Message & Preload Bar ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-md w-full z-10 px-4"
      >
        <div className="inline-block bg-[#1a1a1a] text-[#ffde59] font-['Bangers'] text-xs md:text-sm tracking-widest px-4 py-1 border-2 border-[#ffde59] shadow-[3px_3px_0_#ff007f] -rotate-1">
          {mystical ? '✨ SPIRIT ALCHEMY IN PROGRESS ✨' : '⚡ BANGKOK STREET-POP ENGINE ⚡'}
        </div>

        <p
          className="text-white font-['Chonburi'] text-xl md:text-2xl tracking-wide leading-relaxed"
          style={{ textShadow: '2px 2px 0 #1a1a1a, 0 0 15px rgba(0,240,255,0.6)' }}
        >
          {message}
        </p>

        {progressPercent !== null && (
          <div className="w-full bg-[#1a1a1a]/80 p-1.5 rounded-full border-3 border-white/60 shadow-[6px_6px_0_#ff007f] backdrop-blur-md">
            <div
              className="h-3.5 rounded-full bg-gradient-to-r from-[#ff007f] via-[#ffde59] to-[#00f0ff] transition-all duration-300 ease-out shadow-[0_0_15px_#ffde59]"
              style={{ width: `${Math.max(6, Math.min(100, progressPercent))}%` }}
            />
          </div>
        )}

        {/* Thai Pop Dots */}
        <div className="flex gap-2.5 justify-center pt-2">
          {['#ff007f', '#ffde59', '#00f0ff'].map((color, idx) => (
            <motion.div
              key={color}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.2 }}
              className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ background: color, color }}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
