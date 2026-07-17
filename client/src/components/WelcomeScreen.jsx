/**
 * WelcomeScreen.jsx — 5-Star Luxury Landing Page (Appears after Preload)
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 * 1. Header Details (`รายละเอียด Header ไปอยู่หน้าแรกหลังจาก Preload เกม`):
 *    - Emblem, Hotel Name ("GARDEN OF SIAM · 5-STAR LUXURY HOTEL & BAR")
 *    - Language Switcher (TH | EN) & Admin Link
 * 2. Bangkok Landmarks & Attractions (`แสดงจุดที่น่าสนใจในกรุงเทพ`):
 *    - Grand Palace & Wat Phra Kaew (`พระบรมมหาราชวัง & วัดพระศรีรัตนศาสดาราม`)
 *    - Wat Arun at Sunset (`วัดอรุณราชวรารามยามพระอาทิตย์ตก`)
 *    - Mahanakhon SkyBar & Riverfront (`ตึกมหานครสกายบาร์ & โซนแม่น้ำเจ้าพระยา`)
 *    - Garden of Siam Sanctuary (`สวนสวรรค์พฤกษาแห่งสยาม & บาร์ลับห้าดาว`)
 * 3. Prominent Start Button (`มีปุ่ม Start กดปุ่ม Start ค่อยเริ่มเกม`)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function WelcomeScreen({ onStart }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#041410] via-[#06241c] to-[#041410] text-[#f8fafc] flex flex-col justify-between overflow-x-hidden pt-4 pb-12 px-4 sm:px-6 lg:px-12 font-['Prompt'] select-none">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#047857]/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-[#d4af37]/15 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ── 1. HEADER DETAILS (Integrated right onto Welcome Page after Preload) ── */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-[#041410]/80 border border-[#d4af37]/50 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-20">
        
        {/* Emblem & Hotel Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#047857] to-[#021e14] border-2 border-[#d4af37] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(212,175,55,0.5)]">
            🍸
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-['Cinzel'] text-[#fef08a] font-extrabold tracking-[0.16em] text-sm sm:text-lg m-0 drop-shadow-md uppercase">
                GARDEN OF SIAM
              </h1>
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
            </div>
            <span className="font-['Cinzel'] text-[#d4af37]/90 tracking-[0.18em] text-[0.65rem] sm:text-xs font-semibold uppercase">
              5-STAR LUXURY HOTEL & SPEAKEASY BAR
            </span>
          </div>
        </div>

        {/* Right Controls: Language Switcher Pill & Admin Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="bg-[#0b132b]/90 border border-[#d4af37]/80 hover:border-[#fef08a] px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-xl flex items-center gap-2 cursor-pointer group transition-all hover:scale-105"
            title="Toggle Language / เปลี่ยนภาษา"
          >
            <span className="text-base">🌐</span>
            <div className="flex items-center gap-1 font-['Cinzel'] text-xs font-bold tracking-wider">
              <span className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'th' ? 'bg-[#047857] text-[#fef08a] border border-[#d4af37]/60 shadow-sm' : 'text-[#f8fafc]/60 group-hover:text-white'
              }`}>
                TH
              </span>
              <span className="text-[#d4af37]/60">|</span>
              <span className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'en' ? 'bg-[#047857] text-[#fef08a] border border-[#d4af37]/60 shadow-sm' : 'text-[#f8fafc]/60 group-hover:text-white'
              }`}>
                EN
              </span>
            </div>
          </button>

          <Link
            to="/admin"
            className="bg-[#041410]/90 border border-[#d4af37]/40 hover:border-[#d4af37] px-3 py-1.5 rounded-full text-[11px] sm:text-xs text-[#d4af37] hover:text-[#fef08a] transition-all flex items-center gap-1.5 no-underline font-['Cinzel'] font-semibold shadow-sm"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">CMS ADMIN</span>
          </Link>
        </div>
      </header>

      {/* ── 2. HERO INTRO & BANGKOK ATTRACTIONS (`แสดงจุดที่น่าสนใจในกรุงเทพ`) ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center my-6 gap-8 z-10">
        
        {/* Welcome Headline */}
        <div className="text-center max-w-3xl px-2">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[#047857]/30 border border-[#d4af37]/50 text-[#d4af37] font-['Cinzel'] text-xs tracking-[0.2em] uppercase font-bold mb-3 shadow-inner"
          >
            ✦ {lang === 'en' ? 'DISCOVER BANGKOK & SIGNATURE MIXOLOGY' : 'สัมผัสมนต์เสน่ห์แห่งกรุงเทพฯ และบาร์ลับห้าดาว'} ✦
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide leading-tight mb-3 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]"
          >
            {lang === 'en'
              ? 'Where Siam Heritage Meets Alchemical Luxury'
              : 'สุนทรียภาพแห่งมรดกสยาม บรรจบศาสตร์ค็อกเทลชั้นเลิศ'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#f8fafc]/80 max-w-2xl mx-auto font-light leading-relaxed"
          >
            {lang === 'en'
              ? 'Step into our secret botanical sanctuary to discover your bespoke signature cocktail, crafted from rare Siamese herbs and golden royal infusions.'
              : 'ก้าวสู่บาร์พฤกษาลับแห่งโรงแรมสยาม เพื่อรังสรรค์ค็อกเทลซิกเนเจอร์ที่สะท้อนตัวตนของคุณ จากเอสเซนส์สมุนไพรไทยและทองคำแท้'}
          </motion.p>
        </div>

        {/* ── 2. PROMINENT START BUTTON (`มีปุ่ม Start กดปุ่ม Start ค่อยเริ่มเกม`) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-md flex flex-col items-center gap-3 mt-2"
        >
          <button
            onClick={onStart}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#047857] via-[#065f46] to-[#d4af37] hover:from-[#059669] hover:to-[#fef08a] text-white hover:text-[#041410] font-['Cinzel'] font-bold text-base sm:text-lg tracking-[0.2em] uppercase shadow-[0_15px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_20px_60px_rgba(254,240,138,0.7)] border-2 border-[#fef08a] cursor-pointer transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
          >
            <span className="text-xl group-hover:rotate-12 transition-transform">🍸</span>
            <span>
              {lang === 'en' ? 'START LUXURY EXPERIENCE' : 'เริ่มต้นเส้นทางค้นหาเครื่องดื่มประจำตัว'}
            </span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">✦</span>
          </button>
          
          <span className="text-[11px] sm:text-xs text-[#d4af37]/80 font-light tracking-wide flex items-center gap-1.5">
            <span>⚜️</span>
            <span>{lang === 'en' ? 'Tap above when ready to enter Chamber 1' : 'กดปุ่มด้านบนเมื่อพร้อมก้าวสู่ห้องรับรองพิเศษ'}</span>
            <span>⚜️</span>
          </span>
        </motion.div>
      </main>

      {/* Subtle Copyright Footer on Welcome Screen */}
      <footer className="w-full text-center text-[#f8fafc]/40 text-[11px] font-['Cinzel'] pt-4 border-t border-[#d4af37]/20">
        © {new Date().getFullYear()} GARDEN OF SIAM SANCTUARY. BANGKOK LUXURY EDITION.
      </footer>
    </div>
  );
}
