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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BANGKOK_ATTRACTIONS = [
  {
    id: 'grand-palace',
    titleTh: 'พระบรมมหาราชวัง & วัดพระศรีรัตนศาสดาราม',
    titleEn: 'Grand Palace & Wat Phra Kaew',
    subtitleTh: 'มรดกความงามคู่บ้านคู่เมือง สถาปัตยกรรมไทยชั้นยอดที่ส่องประกายสีทองอร่าม',
    subtitleEn: 'The sacred heart of Siam, showcasing majestic golden spires and exquisite royal architecture.',
    image: '/images/stages/morning-bangkok.png',
    fallbackIcon: '🏛️',
    tagTh: 'ประวัติศาสตร์ & ศิลปะชั้นสูง',
    tagEn: 'ROYAL HERITAGE',
  },
  {
    id: 'wat-arun',
    titleTh: 'วัดอรุณราชวราราม ยามอัสดงริมเจ้าพระยา',
    titleEn: 'Wat Arun · Temple of Dawn Reflections',
    subtitleTh: 'พระปรางค์ประดับกระเบื้องเคลือบเบญจรงค์ สัญลักษณ์แห่งความงามเหนือกาลเวลาฝั่งธนบุรี',
    subtitleEn: 'Iconic porcelain-encrusted prang standing gracefully by the Chao Phraya River at twilight.',
    image: '/images/stages/nana-speakeasy.png',
    fallbackIcon: '🌅',
    tagTh: 'สถาปัตยกรรมริมน้ำ',
    tagEn: 'ICONIC LANDMARK',
  },
  {
    id: 'mahanakhon-skybar',
    titleTh: 'มหานครสกายบาร์ & แสงสียามราตรี',
    titleEn: 'Mahanakhon SkyBar & Modern Skyline',
    subtitleTh: 'จุดชมวิวระดับท็อป 360 องศา สัมผัสมนต์เสน่ห์แห่งมหานครที่ไม่เคยหลับใหล',
    subtitleEn: 'Bangkok’s architectural pinnacle offering panoramic rooftop cocktails above the glittering clouds.',
    image: '/images/stages/sukhumvit-bts.png',
    fallbackIcon: '🏙️',
    tagTh: 'ไลฟ์สไตล์เหนือระดับ',
    tagEn: 'ROOFTOP LUXURY',
  },
  {
    id: 'garden-of-siam',
    titleTh: 'สวนสวรรค์พฤกษาแห่งสยาม & บาร์ลับห้าดาว',
    titleEn: 'Garden of Siam · 5-Star Speakeasy Bar',
    subtitleTh: 'โอเอซิสส่วนตัวใจกลางเมือง รังสรรค์เครื่องดื่มเฉพาะบุคคลจากเอสเซนส์สมุนไพรไทยโบราณ',
    subtitleEn: 'An intimate botanical sanctuary crafting personalized alchemy from rare Thai herbs & royal elixirs.',
    image: '/images/drinks/crystal-coupe.png',
    fallbackIcon: '🍸',
    tagTh: 'ประสบการณ์ค็อกเทลลับ',
    tagEn: 'SIGNATURE SANCTUARY',
  },
];

export default function WelcomeScreen({ onStart }) {
  const { lang, toggleLang } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

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
              ? 'Embark on a curated sensory journey through Bangkok’s most celebrated landmarks before entering our secret lounge to discover your custom botanical elixir.'
              : 'สำรวจจุดเช็คอินระดับตำนานของกรุงเทพมหานคร ก่อนก้าวสู่บาร์พฤกษาลับแห่งโรงแรม เพื่อรังสรรค์ค็อกเทลซิกเนเจอร์ที่สะท้อนตัวตนของคุณ'}
          </motion.p>
        </div>

        {/* Bangkok Highlights Interactive Grid (`จุดที่น่าสนใจในกรุงเทพ`) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {BANGKOK_ATTRACTIONS.map((item, idx) => {
            const isSelected = activeTab === idx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border text-left ${
                  isSelected
                    ? 'border-[#fef08a] shadow-[0_0_30px_rgba(212,175,55,0.45)] scale-[1.02] bg-[#06241c]/90'
                    : 'border-[#d4af37]/35 hover:border-[#d4af37]/80 bg-[#041410]/70 hover:bg-[#06241c]/60'
                } backdrop-blur-xl flex flex-col justify-between p-4 min-h-[220px] sm:min-h-[260px]`}
              >
                {/* Image or High-End Gradient Icon Box */}
                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden mb-3 bg-[#021812] border border-[#d4af37]/30 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={lang === 'en' ? item.titleEn : item.titleTh}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041410] via-transparent to-transparent opacity-60" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#041410]/80 border border-[#d4af37]/60 font-['Cinzel'] text-[9px] sm:text-[10px] text-[#fef08a] font-bold tracking-wider uppercase shadow-md">
                    {lang === 'en' ? item.tagEn : item.tagTh}
                  </span>
                </div>

                {/* Card Title & Description */}
                <div>
                  <h3 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#fef08a] group-hover:text-white transition-colors leading-snug mb-1">
                    {lang === 'en' ? item.titleEn : item.titleTh}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#f8fafc]/75 font-light leading-relaxed line-clamp-2 m-0">
                    {lang === 'en' ? item.subtitleEn : item.subtitleTh}
                  </p>
                </div>

                {/* Subtle Active Highlight Dot */}
                {isSelected && (
                  <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-[#d4af37] font-['Cinzel'] font-bold">
                    <span>✦ ACTIVE</span>
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── 3. PROMINENT START BUTTON (`มีปุ่ม Start กดปุ่ม Start ค่อยเริ่มเกม`) ── */}
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
