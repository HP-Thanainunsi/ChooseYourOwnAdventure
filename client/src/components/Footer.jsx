/**
 * Footer.jsx — Locked Fixed Luxury Hotel Bar Footer
 * ─────────────────────────────────────────────────────────────────────────────
 * Contains:
 * - Copyright info (`Footer copy right`)
 * - Application Version (`version`)
 * - Developer attribution (`ผู้พัฒนา`)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[90] bg-[#041410]/95 border-t border-[#d4af37]/50 shadow-[0_-5px_25px_rgba(0,0,0,0.95)] backdrop-blur-2xl h-8 sm:h-9 px-3 sm:px-6 flex items-center justify-between select-none pointer-events-auto transition-all font-['Prompt'] text-[9px] sm:text-[11px] text-[#f8fafc]/75">
      
      {/* Left: Copyright */}
      <div className="flex items-center gap-1.5 truncate">
        <span className="text-[#d4af37]">©</span>
        <span className="font-light tracking-wide truncate">
          {lang === 'en'
            ? '2026 Garden of Siam Speakeasy. All Rights Reserved.'
            : '2026 Garden of Siam Speakeasy สงวนลิขสิทธิ์ทุกประการ'}
        </span>
      </div>

      {/* Right: Version & Developer */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-light">
        <span className="text-[#fef08a] font-['Cinzel'] font-bold tracking-wider">
          v1.0.0-PROD
        </span>
        <span className="text-[#d4af37]/40 hidden xs:inline">•</span>
        <span className="hidden xs:inline-block text-[#d4af37] tracking-wider truncate">
          {lang === 'en'
            ? 'Dev: Master Mixologist & AI Team'
            : 'ผู้พัฒนา: Master Mixologist & AI Team'}
        </span>
      </div>
    </footer>
  );
}
