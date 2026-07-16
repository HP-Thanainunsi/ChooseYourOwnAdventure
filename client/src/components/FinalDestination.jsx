/**
 * FinalDestination.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Full-Screen Finale Component for the gamified drink app.
 *
 * Design Layout (Mobile-First, Full Screen):
 *   1. Background Layer (The Drink): Full-screen cover with slow continuous
 *      scale-up breathing animation and bottom dark gradient overlay.
 *   2. Story Layer (Comic Caption Box): Pop-art narration box with thick black
 *      borders, Chonburi heading, and Mitr body typography.
 *   3. Map & Action Layer (The Destination Ticket): Cyberpunk ticket pinned to
 *      the bottom displaying the Bar Name, retro GPS Coordinates, and a massive
 *      glowing "NAVIGATE TO LOCATION" Google Maps button.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function FinalDestination({
  drinkImage = '/images/drinks/tropical-smoothie.png',
  drinkName = 'THE BANGKOK ALCHEMIST',
  storyText = 'ค่ำคืนอันยาวนานสิ้นสุดลงที่นี่... สปิริตของคุณตรงกับความเย้ายวน ลึกลับ และเต็มไปด้วยชีวิตชีวาของมหานครที่ไม่เคยหลับใหล ดื่มด่ำไปกับรสสัมผัสที่ถูกลิขิตไว้เพื่อคุณโดยเฉพาะ ณ บาร์ลับแห่งนี้',
  barName = 'HIDDEN SPEAKEASY',
  googleMapsUrl = 'https://maps.app.goo.gl/TeensOfThailandBangkok',
  onRestart = null,
}) {
  // Generate or parse retro GPS coordinates based on bar name
  const getCoordinates = (name = '') => {
    if (name.toLowerCase().includes('teens')) return 'LAT: 13.7388° N | LON: 100.5144° E';
    if (name.toLowerCase().includes('tropic')) return 'LAT: 13.7287° N | LON: 100.5165° E';
    if (name.toLowerCase().includes('nana')) return 'LAT: 13.7405° N | LON: 100.5532° E';
    return 'LAT: 13.7394° N | LON: 100.5538° E';
  };

  const coordinates = getCoordinates(barName);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="relative w-full min-h-screen h-screen overflow-hidden bg-[#0d0714] flex flex-col justify-between select-none"
    >
      {/* ─── 1. BACKGROUND LAYER (THE DRINK WITH BREATHING EFFECT) ─────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={drinkImage || '/images/drinks/tropical-smoothie.png'}
          alt={drinkName}
          className="w-full h-full object-cover origin-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0714] via-[#0d0714]/75 to-transparent/30 pointer-events-none" />
        
        {/* Subtle Cyber Grid & Halftone Dots Texture */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffde59 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Top Bar Header & Restart Option */}
      <div className="relative z-20 w-full px-5 pt-6 flex items-center justify-between pointer-events-auto">
        <div className="bg-[#1a1a1a] border-2 border-[#ffde59] px-3.5 py-1.5 rounded-full shadow-[3px_3px_0_#ff007f] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
          <span className="font-['Bangers'] text-white tracking-widest text-xs md:text-sm">
            ⚡ DESTINATION UNLOCKED ⚡
          </span>
        </div>

        {onRestart && (
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={onRestart}
            className="bg-[#ff1616] border-2 border-white text-white font-['Bangers'] text-xs tracking-wider px-4 py-1.5 rounded-full shadow-[3px_3px_0_#1a1a1a] uppercase"
          >
            🔄 PLAY AGAIN
          </motion.button>
        )}
      </div>

      {/* ─── 2. STORY LAYER (COMIC CAPTION BOX) ───────────────────────────── */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 my-auto flex flex-col justify-center pb-32 md:pb-36 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring', damping: 22 }}
          className="bg-[#ffde59]/95 border-4 border-[#1a1a1a] p-6 md:p-8 rounded-3xl shadow-[8px_8px_0_#1a1a1a,0_0_30px_rgba(255,222,89,0.3)] relative"
        >
          {/* Top Issue Tag */}
          <div className="absolute -top-4 left-6 bg-[#ff007f] text-white font-['Bangers'] text-xs md:text-sm tracking-widest px-4 py-1 border-2 border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] -rotate-2 uppercase">
            🍸 FINAL ISSUE • YOUR DESTINED SPIRIT
          </div>

          {/* Heading — 'Chonburi' Font */}
          <h1
            className="font-['Chonburi'] text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] leading-tight mb-3 mt-2"
            style={{
              textShadow: '1.5px 1.5px 0 rgba(255,255,255,0.8)',
            }}
          >
            {drinkName}
          </h1>

          {/* Decorative Divider */}
          <div className="w-16 h-1.5 bg-[#1a1a1a] rounded-full mb-4" />

          {/* Body — 'Mitr' Font */}
          <p className="font-['Mitr'] font-normal text-sm sm:text-base md:text-lg text-[#1a1a1a]/90 leading-relaxed m-0">
            {storyText}
          </p>

          {/* Bottom Right Comic Stamp */}
          <div className="absolute -bottom-3 -right-3 bg-white border-2 border-[#1a1a1a] px-3 py-1 rounded-lg shadow-[2px_2px_0_#1a1a1a] font-['Bangers'] text-xs text-[#1a1a1a] rotate-3">
            ★ BANGKOK NIGHTLIFE ★
          </div>
        </motion.div>
      </div>

      {/* ─── 3. MAP & ACTION LAYER (THE DESTINATION TICKET) ───────────────── */}
      <motion.div
        initial={{ y: 160, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 300, damping: 28 }}
        className="absolute bottom-0 left-0 right-0 z-30 bg-[#1a1a1a] border-t-4 border-[#00f0ff] rounded-t-3xl shadow-[0_-12px_40px_rgba(0,240,255,0.25)] p-5 md:p-7 pointer-events-auto"
      >
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          
          {/* Ticket Header & GPS Coordinates */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-white/15 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff007f] border-2 border-white flex items-center justify-center text-xl shadow-[3px_3px_0_#00f0ff] -rotate-3">
                📍
              </div>
              <div>
                <span className="font-['Outfit'] text-[10px] uppercase font-bold text-white/50 tracking-widest block">
                  SECRET BAR LOCATION
                </span>
                <h2 className="font-['Chonburi'] text-lg sm:text-xl text-white tracking-wide m-0">
                  {barName}
                </h2>
              </div>
            </div>

            {/* Retro GPS Coordinates Tag */}
            <div className="bg-black/60 border border-[#00f0ff]/60 px-3 py-1 rounded-lg text-right sm:text-left self-start sm:self-auto">
              <span className="font-['Orbitron'] font-bold text-[11px] text-[#00f0ff] tracking-widest block">
                {coordinates}
              </span>
            </div>
          </div>

          {/* Massive Glowing "NAVIGATE TO LOCATION" Button */}
          <motion.a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-[#00f0ff] via-[#38b6ff] to-[#ff007f] border-3 border-white text-[#1a1a1a] font-['Bangers'] text-xl sm:text-2xl tracking-widest py-4 px-6 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.6),5px_5px_0_#1a1a1a] flex items-center justify-center gap-3 text-center uppercase cursor-pointer transition-all hover:shadow-[0_0_35px_rgba(255,0,127,0.8),5px_5px_0_#1a1a1a]"
          >
            <span className="text-2xl animate-bounce">🗺️</span>
            <span>NAVIGATE TO LOCATION</span>
            <span className="text-xl">🚀</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
