/**
 * Header.jsx — Locked Fixed Luxury Hotel Bar Header
 * ─────────────────────────────────────────────────────────────────────────────
 * Contains:
 * - Luxury Hotel Emblem & Name ("GARDEN OF SIAM · 5-STAR LUXURY HOTEL & BAR")
 * - Bilingual Language Switcher (TH / EN)
 * - Quick Navigation Toggle (CMS Admin / Experiences)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { lang, toggleLang } = useLanguage();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#041410]/95 border-b border-[#d4af37]/60 shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-2xl h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between select-none pointer-events-auto transition-all">
      
      {/* ── Left/Center: Logo & Luxury Hotel Name ── */}
      <Link to="/" className="flex items-center gap-2 sm:gap-3 group no-underline">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#047857] to-[#021e14] border border-[#d4af37] flex items-center justify-center text-base sm:text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-transform">
          🍸
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="font-['Cinzel'] text-[#fef08a] font-bold tracking-[0.16em] text-xs sm:text-sm md:text-base uppercase group-hover:text-white transition-colors">
              GARDEN OF SIAM
            </span>
            <span className="hidden xs:inline-block w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
          </div>
          <span className="font-['Cinzel'] text-[#d4af37]/85 tracking-[0.18em] text-[0.55rem] sm:text-[0.65rem] uppercase font-semibold">
            5-STAR LUXURY HOTEL & BAR
          </span>
        </div>
      </Link>

      {/* ── Right: Language Switcher & Admin Quick Toggle ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Language Switcher Pill (`เปลี่ยนภาษา`) */}
        <button
          onClick={toggleLang}
          className="bg-[#0b132b]/90 border border-[#d4af37]/80 hover:border-[#fef08a] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-md backdrop-blur-xl flex items-center gap-1.5 cursor-pointer group transition-all"
          title="Toggle Language / เปลี่ยนภาษา"
        >
          <span className="text-xs sm:text-sm">🌐</span>
          <div className="flex items-center gap-1 font-['Cinzel'] text-[10px] sm:text-xs font-bold tracking-wider">
            <span className={`px-1.5 py-0.5 rounded-full transition-all ${
              lang === 'th' ? 'bg-[#047857] text-[#fef08a] border border-[#d4af37]/60 shadow-sm' : 'text-[#f8fafc]/60 group-hover:text-white'
            }`}>
              TH
            </span>
            <span className="text-[#d4af37]/60">|</span>
            <span className={`px-1.5 py-0.5 rounded-full transition-all ${
              lang === 'en' ? 'bg-[#047857] text-[#fef08a] border border-[#d4af37]/60 shadow-sm' : 'text-[#f8fafc]/60 group-hover:text-white'
            }`}>
              EN
            </span>
          </div>
        </button>

        {/* CMS Admin / Back to Experiences Button */}
        <Link
          to={isAdmin ? '/' : '/admin'}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#043927]/90 hover:bg-[#047857] text-[#fef08a] font-['Cinzel'] tracking-wider text-[10px] sm:text-xs border border-[#d4af37]/80 rounded-full shadow-md backdrop-blur-xl transition-all flex items-center gap-1.5 uppercase font-bold no-underline"
        >
          <span>{isAdmin ? '👑 BAR' : '⚙️ CMS'}</span>
        </Link>
      </div>
    </header>
  );
}
