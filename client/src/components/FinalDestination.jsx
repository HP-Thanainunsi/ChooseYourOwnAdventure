/**
 * FinalDestination.jsx — 5-Star Hotel Bar Sanctuary Invitation (Garden of Siam)
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Full-Screen Finale Component for the Gamified Drink App.
 *
 * Design Layout (Glassmorphism, Gold, Silk & Elegant Typography):
 *   1. Background Layer: Full-screen cocktail aesthetic with slow breathing scale
 *      and deep emerald/midnight gold silk overlay.
 *   2. Royal Invitation Panel: Frosted glass (`backdrop-blur-2xl border border-[#d4af37]`)
 *      with gold foil typography (`Cinzel` & `Prompt`) and silk shimmer.
 *   3. The Brass Key Concierge Pass (Pinned at bottom): Pinned luxury pass with
 *      Coordinates, Bar Name, and an elegant 'CONCIERGE NAVIGATION' button (`target="_blank"`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function FinalDestination({
  drinkImage = '/images/drinks/tropical-smoothie.png',
  drinkName = 'THE BANGKOK ALCHEMIST',
  storyText = 'ค่ำคืนอันยาวนานสิ้นสุดลงที่นี่... สปิริตของคุณตรงกับความเย้ายวน ลึกลับ และเต็มไปด้วยชีวิตชีวาของมหานครที่ไม่เคยหลับใหล ดื่มด่ำไปกับรสสัมผัสที่ถูกลิขิตไว้เพื่อคุณโดยเฉพาะ ณ บาร์ลับระดับ 5 ดาวแห่งนี้',
  barName = 'THE GARDEN OF SIAM · SPEAKEASY',
  googleMapsUrl = 'https://maps.app.goo.gl/TeensOfThailandBangkok',
  onRestart = null,
}) {
  // Generate or parse retro coordinates
  const getCoordinates = (name = '') => {
    if (name.toLowerCase().includes('teens')) return 'LAT 13.7388° N · LON 100.5144° E';
    if (name.toLowerCase().includes('tropic')) return 'LAT 13.7287° N · LON 100.5165° E';
    if (name.toLowerCase().includes('nana')) return 'LAT 13.7405° N · LON 100.5532° E';
    return 'LAT 13.7394° N · LON 100.5538° E';
  };

  const coordinates = getCoordinates(barName);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="relative w-full min-h-screen h-screen overflow-hidden bg-[#041410] flex flex-col justify-between select-none font-['Prompt']"
    >
      {/* ─── 1. BACKGROUND LAYER (LUXURY COCKTAIL ATMOSPHERE) ──────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={drinkImage || '/images/drinks/tropical-smoothie.png'}
          alt={drinkName}
          className="w-full h-full object-cover origin-center opacity-85"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Silk & Gold Dust Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041410] via-[#041410]/85 to-[#041410]/40 pointer-events-none" />
        
        {/* Golden Silk Shimmer Texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(212,175,55,0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Header Bar & Re-experience Action */}
      <div className="relative z-20 w-full px-5 pt-6 flex items-center justify-between pointer-events-auto">
        <div className="bg-[#043927]/90 border border-[#d4af37]/60 px-4 py-1.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#fef08a] animate-ping" />
          <span className="font-['Cinzel'] text-[#d4af37] tracking-[0.2em] text-xs font-bold uppercase">
            ✦ SANCTUARY DESTINATION UNLOCKED ✦
          </span>
        </div>

        {onRestart && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="bg-[#1c130d]/90 border border-[#d4af37]/80 text-[#fef08a] font-['Cinzel'] text-xs tracking-[0.15em] px-4 py-1.5 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:bg-[#043927] transition-all uppercase font-semibold"
          >
            ✦ RE-EXPERIENCE
          </motion.button>
        )}
      </div>

      {/* ─── 2. ROYAL INVITATION PANEL (GLASSMORPHISM) ─────────────────────── */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 my-auto flex flex-col justify-center pb-32 md:pb-36 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', damping: 22 }}
          className="bg-[#043927]/85 border-2 border-[#d4af37] p-6 md:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] backdrop-blur-2xl relative"
        >
          {/* Top Royal Badge */}
          <div className="absolute -top-4 left-6 bg-[#1c130d] text-[#fef08a] font-['Cinzel'] text-xs tracking-[0.25em] px-5 py-1.5 rounded-full border border-[#d4af37] shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-bold uppercase">
            ✦ MEMBERS ONLY · ROYAL INVITATION ✦
          </div>

          {/* Drink Name Heading — Elegant Serif */}
          <h1 className="font-['Cinzel'] text-2xl sm:text-3xl md:text-4xl text-[#fef08a] tracking-wider mb-3 mt-3 font-bold uppercase drop-shadow-md">
            {drinkName}
          </h1>

          {/* Gold Silk Divider */}
          <div className="w-20 h-0.5 bg-gradient-to-r from-[#d4af37] to-transparent rounded-full mb-4" />

          {/* Body Text — Clean Thai Prompt */}
          <p className="font-['Prompt'] font-light text-sm sm:text-base md:text-lg text-[#f8fafc]/90 leading-relaxed m-0">
            {storyText}
          </p>

          {/* Bottom Stamp */}
          <div className="absolute -bottom-3.5 right-6 bg-[#0b132b] border border-[#d4af37] px-4 py-1 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-['Cinzel'] text-xs text-[#d4af37] tracking-[0.2em] font-semibold uppercase">
            ✦ 5-STAR LUXURY BAR ✦
          </div>
        </motion.div>
      </div>

      {/* ─── 3. THE CONCIERGE BRASS KEY PASS (PINNED AT BOTTOM) ─────────────── */}
      <motion.div
        initial={{ y: 160, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 300, damping: 28 }}
        className="absolute bottom-0 left-0 right-0 z-30 bg-[#041410]/95 border-t-2 border-[#d4af37] rounded-t-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-2xl p-5 md:p-7 pointer-events-auto"
      >
        <div className="max-w-xl mx-auto flex flex-col gap-4.5">
          
          {/* Ticket Header & Coordinates */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#043927] border border-[#d4af37] flex items-center justify-center text-xl shadow-md">
                🗝️
              </div>
              <div>
                <span className="font-['Cinzel'] text-[10px] uppercase font-bold text-[#d4af37] tracking-[0.2em] block">
                  SECRET CONCIERGE DESTINATION
                </span>
                <h2 className="font-['Cinzel'] text-lg sm:text-xl text-[#fef08a] font-bold tracking-wide m-0">
                  {barName}
                </h2>
              </div>
            </div>

            {/* Gold Coordinates Tag */}
            <div className="bg-[#1c130d]/90 border border-[#d4af37]/60 px-3.5 py-1.5 rounded-xl text-right sm:text-left self-start sm:self-auto shadow-inner">
              <span className="font-['Cinzel'] font-semibold text-[11px] text-[#fef08a] tracking-widest block">
                {coordinates}
              </span>
            </div>
          </div>

          {/* Concierge Navigation Button */}
          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#047857] via-[#043927] to-[#d4af37] border border-[#fef08a] text-white font-['Cinzel'] text-base sm:text-lg tracking-[0.2em] font-bold py-4 px-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3 text-center uppercase cursor-pointer transition-all hover:brightness-110"
          >
            <span className="text-xl">🛎️</span>
            <span>REQUEST CONCIERGE NAVIGATION</span>
            <span className="text-xl">✨</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
