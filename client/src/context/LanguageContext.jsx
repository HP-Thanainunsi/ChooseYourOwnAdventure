/**
 * LanguageContext.jsx — Bilingual Support (Thai & English Togglable)
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides dynamic language switching (`th` | `en`) across the 5-Star Hotel Bar app.
 * Supports static dictionary translations + dynamic database model fallback (`label_en`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const DICTIONARY = {
  // ── StartScreen ──
  start_title: {
    th: 'THE GARDEN OF SIAM',
    en: 'THE GARDEN OF SIAM',
  },
  start_subtitle: {
    th: 'เริ่มต้นการผจญภัยในบาร์ลับระดับ 5 ดาวแห่งสยาม',
    en: 'Begin Your 5-Star Speakeasy Journey in Siam',
  },
  start_tagline: {
    th: '✦ BESPOKE COCKTAIL DESTINATION · MEMBERS ONLY ✦',
    en: '✦ BESPOKE COCKTAIL DESTINATION · MEMBERS ONLY ✦',
  },
  start_button: {
    th: '👉 แตะเพื่อเริ่มสำรวจเส้นทางของคุณ',
    en: '👉 TOUCH TO EXPLORE YOUR PATHWAY',
  },
  start_footer: {
    th: '👑 ถ่ายทอดเอกลักษณ์สยามร่วมสมัย · ประสบการณ์อินเทอร์แอคทีฟระดับลักชูรี',
    en: '👑 Contemporary Siamese Heritage · A Luxury Interactive Experience',
  },

  // ── SwipeGame (Stage 1) ──
  swipe_selection: {
    th: '✨ ตัวเลือกต้อนรับที่',
    en: '✨ WELCOME SELECTION',
  },
  swipe_of: {
    th: 'จาก',
    en: 'OF',
  },
  swipe_header: {
    th: '✦ SCENE I : THE LOBBY WELCOME ✦',
    en: '✦ SCENE I : THE LOBBY WELCOME ✦',
  },
  swipe_sub: {
    th: '“ ยินดีต้อนรับสู่ The Garden of Siam กรุณาเลือกเครื่องดื่มรับรองสำหรับค่ำคืนนี้... ”',
    en: '“ Welcome to The Garden of Siam. Please select your refreshing welcome ritual tonight... ”',
  },
  swipe_badge_left: {
    th: '✦ เลือกตัวเลือกที่ 1 ✦',
    en: '✦ SELECT OPTION I ✦',
  },
  swipe_badge_right: {
    th: '✦ เลือกตัวเลือกที่ 2 ✦',
    en: '✦ SELECT OPTION II ✦',
  },
  swipe_btn_left: {
    th: '✦ ปัดซ้าย (OPTION I)',
    en: '✦ SWIPE LEFT (OPTION I)',
  },
  swipe_btn_right: {
    th: 'ปัดขวา (OPTION II) ✦',
    en: 'SWIPE RIGHT (OPTION II) ✦',
  },

  // ── MixologyGame (Stage 2) ──
  mix_title: {
    th: '✨ ห้องทดลองผสมโอสถ · โคจรรอบโหลแก้ว ✨',
    en: '✨ ORBITAL BOTANICAL ALCHEMY · MULTI-INFUSION ✨',
  },
  mix_desc: {
    th: 'กดคลิก หรือ ลากวัตถุดิบลอยตัวรอบๆ โหลแก้ว (Surrounding Botanicals) ลงโถแก้วใสเบญจรงค์ตรงกลาง เพื่อปรุงสูตรลับเฉพาะคุณ',
    en: 'Click or Drag surrounding floating botanicals into the central Benjarong Crystal Jar to brew your bespoke secret elixir.',
  },
  mix_vessel_status_single: {
    th: '✦ ผสม 1 ส่วนผสม ✦',
    en: '✦ SINGLE INFUSION ✦',
  },
  mix_vessel_status_multi: {
    th: '✦ ผสมรวม',
    en: '✦ BLENDED',
  },
  mix_vessel_botanicals: {
    th: 'สมุนไพร ✦',
    en: 'BOTANICALS ✦',
  },
  mix_clear_all: {
    th: '[ ✕ ล้างส่วนผสมทั้งหมด ]',
    en: '[ ✕ CLEAR ALL BOTANICALS ]',
  },
  mix_confirm_btn: {
    th: '⚱️ ยืนยันการผสมโอสถ',
    en: '⚱️ CONFIRM ALCHEMY',
  },
  mix_ingredients_word: {
    th: 'ส่วนผสม',
    en: 'INGREDIENTS',
  },

  // ── TarotGame (Stage 3) ──
  tarot_title: {
    th: '✨ วงล้อคำทำนายแห่งโชคชะตา · การ์ดลอยหมุนเป็นวงกลม ✨',
    en: '✨ CIRCULAR WHEEL OF DESTINY · ROTATING TAROT ✨',
  },
  tarot_desc_spin: {
    th: 'การ์ดยันต์มงคลกำลังลอยหมุนเป็นวงกลมรอบตัวคุณ... แตะคลิกเลือกการ์ดหนึ่งใบเพื่อเปิดคำทำนาย',
    en: 'Sacred Yantra cards orbit around you... Touch or click one card to unveil your destiny.',
  },
  tarot_desc_flip: {
    th: '✦ การ์ดหยุดหมุน และกำลังเปิดเผยชะตากรรมแห่งเครื่องดื่มซิกเนเจอร์ของคุณ... ✦',
    en: '✦ Orbit paused. Revealing your signature destiny elixir... ✦',
  },
  tarot_card_path: {
    th: '✦ เส้นทางที่',
    en: '✦ PATHWAY #',
  },
  tarot_card_touch: {
    th: 'แตะเพื่อเปิดคำทำนาย',
    en: 'Touch to reveal destiny',
  },
  tarot_confirming: {
    th: '✦ กำลังยืนยันคำทำนาย...',
    en: '✦ CONFIRMING DESTINY...',
  },

  // ── DrinkResult ──
  result_header: {
    th: '✦ เปิดเผยสูตรโอสถซิกเนเจอร์ของคุณ ✦',
    en: '✦ REVEALING YOUR SIGNATURE ELIXIR ✦',
  },
  result_abv: {
    th: 'ระดับแอลกอฮอล์ (ABV)',
    en: 'ALCOHOL CONTENT (ABV)',
  },
  result_sweetness: {
    th: 'ระดับความหวาน',
    en: 'SWEETNESS LEVEL',
  },
  result_notes: {
    th: 'เครื่องกลิ่นอายพฤกษาไทยในสูตรของคุณ',
    en: 'SIAMESE BOTANICAL NOTES IN YOUR BREW',
  },
  result_note_1: {
    th: '✨ สกัดเย็นกลิ่นดอกมะลิตุ๊ดตู่และใบเตยสุโขทัย หอมสดชื่นเป็นเอกลักษณ์',
    en: '✨ Cold-pressed Siamese jasmine & Sukhothai pandan infusion',
  },
  result_note_2: {
    th: '🌿 รมควันไม้สักทองและเปลือกอบเชยป่า เพิ่มมิติความลึกล้ำชวนหลงใหล',
    en: '🌿 Smoked over golden teakwood & wild mountain cinnamon embers',
  },
  result_note_3: {
    th: '🍯 ตัดปลายลิ้นด้วยน้ำผึ้งเดือนห้าและมะนาวคาเฟียร์ ม่านรสสัมผัสกลมกล่อม',
    en: '🍯 Layered with wild forest honey and sparkling kaffir lime zest',
  },
  result_unlock_btn: {
    th: '🗝️ ปลดล็อกบัตรเชิญและพิกัดบาร์ลับ',
    en: '🗝️ UNLOCK SANCTUARY PASS & LOCATION',
  },

  // ── FinalDestination ──
  final_unlocked: {
    th: '✦ ปลดล็อกพิกัดบาร์ลับระดับ 5 ดาว ✦',
    en: '✦ SANCTUARY DESTINATION UNLOCKED ✦',
  },
  final_reexperience: {
    th: '✦ สัมผัสประสบการณ์อีกครั้ง',
    en: '✦ RE-EXPERIENCE',
  },
  final_badge: {
    th: '✦ สมาชิกพิเศษ · บัตรเชิญระดับราชสำนัก ✦',
    en: '✦ MEMBERS ONLY · ROYAL INVITATION ✦',
  },
  final_bar_stamp: {
    th: '✦ บาร์ลับสุดหรูระดับ 5 ดาว ✦',
    en: '✦ 5-STAR LUXURY SPEAKEASY BAR ✦',
  },
  final_secret_pass: {
    th: 'บัตรผ่านเข้าสู่วิหารลับแห่งสยาม',
    en: 'SECRET CONCIERGE DESTINATION PASS',
  },
  final_nav_btn: {
    th: '📍 เปิดนำทางด้วย GOOGLE MAPS',
    en: '📍 NAVIGATE WITH GOOGLE MAPS',
  },
  final_nav_sub: {
    th: 'นำพาสู่พิกัดจริง · THE GARDEN OF SIAM SPEAKEASY',
    en: 'Direct navigation to · THE GARDEN OF SIAM SPEAKEASY',
  },

  // ── General / Fallbacks ──
  loading: {
    th: 'กำลังโหลดประสบการณ์...',
    en: 'Loading Luxury Experience...',
  },
};

const LanguageContext = createContext({
  lang: 'th',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
  getLocalized: (item, field) => '',
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('th');

  // Load preferred language from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('gos_lang_pref');
    if (saved === 'th' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const next = lang === 'th' ? 'en' : 'th';
    setLang(next);
    localStorage.setItem('gos_lang_pref', next);
  };

  // Translation lookup helper
  const t = (key) => {
    if (DICTIONARY[key] && DICTIONARY[key][lang]) {
      return DICTIONARY[key][lang];
    }
    return key;
  };

  // Dynamic database record translation helper (e.g., item.label vs item.label_en)
  const getLocalized = (item, field) => {
    if (!item) return '';
    if (lang === 'en' && item[`${field}_en`]) {
      return item[`${field}_en`];
    }
    return item[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
