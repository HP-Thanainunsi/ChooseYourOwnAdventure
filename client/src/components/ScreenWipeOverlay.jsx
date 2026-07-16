/**
 * ScreenWipeOverlay.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Stylized comic-style speed-line screen wipe triggered when a user makes a choice.
 * Wipes across the screen before revealing the next story segment or drink result.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScreenWipeOverlay({ isWiping, text = '⚡ BANGKOK STREET-POP ENGINE... ⚡' }) {
  return (
    <AnimatePresence>
      {isWiping && (
        <motion.div
          initial={{ x: '-100%', opacity: 1 }}
          animate={{ x: '0%', opacity: 1 }}
          exit={{ x: '100%', opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="fixed inset-0 z-[70] pointer-events-auto flex items-center justify-center overflow-hidden bg-[#1a1a1a]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #ffde59 0, #ffde59 20px, #1a1a1a 20px, #1a1a1a 40px)`,
            backgroundSize: '200% 200%',
          }}
        >
          {/* Inner High-Contrast Halftone Banner */}
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: [1, 1.1, 1], rotate: [-5, 3, -3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="bg-white border-8 border-[#1a1a1a] rounded-3xl px-8 py-6 shadow-[12px_12px_0_#ff007f] relative max-w-xl text-center mx-4"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#ff007f] text-white font-['Bangers'] text-base tracking-widest px-6 py-1 border-4 border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] -rotate-2 uppercase whitespace-nowrap">
              💥 THAI STREET ALCHEMY 💥
            </div>

            <h2 className="font-['Chonburi'] text-2xl sm:text-4xl text-[#1a1a1a] tracking-wide leading-tight mt-2">
              {text}
            </h2>

            {/* Speed line bursts */}
            <div className="flex gap-4 justify-center mt-4 text-3xl">
              <span className="animate-bounce">⚡</span>
              <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>🌶️</span>
              <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🛺</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
