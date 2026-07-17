/**
 * LangSwitcher.jsx — Floating Luxury Bilingual Toggle Button
 * ─────────────────────────────────────────────────────────────────────────────
 * Allows users to instantly toggle between Thai (`TH`) and English (`EN`).
 * Floating glassmorphism pill placed on the top-right of the screen.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function LangSwitcher() {
  const { lang, toggleLang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-4 right-4 z-50 pointer-events-auto select-none"
    >
      <button
        onClick={toggleLang}
        className="bg-[#041410]/90 border border-[#d4af37]/80 hover:border-[#fef08a] px-3.5 py-1.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.25)] backdrop-blur-2xl flex items-center gap-2 cursor-pointer group transition-all"
        title="Toggle Language / เปลี่ยนภาษา"
      >
        <span className="text-sm">🌐</span>
        <div className="flex items-center gap-1 font-['Cinzel'] text-xs font-bold tracking-wider">
          <span className={`px-2 py-0.5 rounded-full transition-all ${
            lang === 'th' ? 'bg-[#047857] text-[#fef08a] border border-[#d4af37]/60 shadow-sm' : 'text-[#f8fafc]/60 group-hover:text-white'
          }`}>
            🇹🇭 TH
          </span>
          <span className="text-[#d4af37]/60">|</span>
          <span className={`px-2 py-0.5 rounded-full transition-all ${
            lang === 'en' ? 'bg-[#047857] text-[#fef08a] border border-[#d4af37]/60 shadow-sm' : 'text-[#f8fafc]/60 group-hover:text-white'
          }`}>
            🇬🇧 EN
          </span>
        </div>
      </button>
    </motion.div>
  );
}
