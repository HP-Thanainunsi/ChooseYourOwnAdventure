/**
 * DrinkResult.jsx — 5-Star Hotel Signature Elixir Reveal (Garden of Siam)
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   result    { drink: { id, name, description, image_url, abv, sweetness, location_id, location },
 *               location: { id, name, address, latitude, longitude, google_maps_link },
 *               totalScore: number }
 *   onRestart () => void
 *
 * Design & Interactions:
 *   1. 3D Interactive Reveal: Rises with fluid spring physics tilting dynamically
 *      with mouse/touch movement (`useMotionValue`, `useSpring`, `useTransform`).
 *   2. Luxury Elixir Profile: Frosted glass panel (`backdrop-blur-2xl`), royal gold
 *      accents (`#d4af37`), ABV & Sweetness dials, and Siamese botanical notes.
 *   3. Transition to Concierge Pass: Clicking "UNLOCK SANCTUARY PASS" transitions smoothly
 *      to the `FinalDestination` component.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import FinalDestination from './FinalDestination';
import { useLanguage } from '../context/LanguageContext';

export default function DrinkResult({ result, onRestart }) {
  const { lang, getLocalized } = useLanguage();
  const [showDestination, setShowDestination] = useState(false);

  const drink = result?.drink || {
    name: 'THE GARDEN OF SIAM · SIGNATURE ELIXIR',
    description: 'เครื่องดื่มพิเศษที่ปรุงขึ้นจากจิตวิญญาณแห่งการผจญภัยของคุณ ผสมผสานความเย้ายวนของใบเตยหอมสุโขทัยและความลึกลับของอำพันรัตติกาล',
    image_url: '/images/drinks/tropical-smoothie.png',
    abv: '16.5%',
    sweetness: '3 / 5',
  };

  const location = result?.location || drink.location || {
    name: 'THE GARDEN OF SIAM · SPEAKEASY',
    address: 'ซอยลับย่านทรงวาด กรุงเทพมหานคร',
    google_maps_link: 'https://maps.app.goo.gl/TeensOfThailandBangkok',
  };

  const drinkName = getLocalized(drink, 'name') || drink.name;
  const drinkDesc = getLocalized(drink, 'description') || drink.description;
  const locationName = getLocalized(location, 'name') || location.name;

  // ── 3D Tilt Physics ────────────────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 150, damping: 20 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  if (showDestination) {
    return (
      <FinalDestination
        drinkImage={drink.image_url}
        drinkName={drinkName}
        storyText={drinkDesc}
        barName={locationName}
        googleMapsUrl={location.google_maps_link}
        onRestart={onRestart}
      />
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full bg-[#041410] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-['Prompt']"
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#043927]/30 via-[#041410] to-[#041410] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-6"
      >
        <div className="inline-block bg-[#043927]/90 border border-[#d4af37]/60 rounded-full px-5 py-1.5 shadow-md mb-2">
          <span className="font-['Cinzel'] text-[#d4af37] text-xs tracking-[0.25em] font-bold uppercase">
            ✦ {lang === 'th' ? 'ผลลัพธ์จากมาสเตอร์มิกซ์โซโลจิสต์' : 'MASTER MIXOLOGIST REVEAL'} ✦
          </span>
        </div>
        <h2 className="font-['Cinzel'] text-xl sm:text-2xl text-[#fef08a] tracking-[0.18em] font-bold uppercase m-0">
          {lang === 'th' ? 'ค็อกเทลซิกเนเจอร์ประจำตัวคุณ' : 'YOUR SIGNATURE ELIXIR'}
        </h2>
      </motion.div>

      {/* 3D Interactive Elixir Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.2 }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-[#d4af37]/80 bg-[#041410]/85 p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_45px_rgba(212,175,55,0.2)] backdrop-blur-2xl flex flex-col items-center gap-6"
      >
        {/* Inner Gold Frame Border */}
        <div className="absolute inset-3 border border-[#d4af37]/30 rounded-2xl pointer-events-none" />

        {/* Drink Image Display */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-[#d4af37] p-2 bg-gradient-to-b from-[#043927] to-[#041410] shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center overflow-hidden">
          <motion.img
            src={drink.image_url}
            alt={drinkName}
            className="w-full h-full object-cover rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Drink Name & Description */}
        <div className="text-center z-10 px-2">
          <h3 className="font-['Cinzel'] text-2xl sm:text-3xl text-[#fef08a] tracking-wider font-bold uppercase m-0 drop-shadow-md">
            {drinkName}
          </h3>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-3" />
          <p className="font-['Prompt'] text-xs sm:text-sm text-[#f8fafc]/90 font-light leading-relaxed m-0">
            {drinkDesc}
          </p>
        </div>

        {/* Elixir Metrics (ABV & Sweetness) */}
        <div className="w-full grid grid-cols-2 gap-3 z-10">
          <div className="bg-[#043927]/60 border border-[#d4af37]/50 rounded-2xl p-3 text-center shadow-inner">
            <span className="font-['Cinzel'] text-[0.65rem] text-[#d4af37] tracking-[0.15em] block font-semibold uppercase">
              ✦ {lang === 'th' ? 'ระดับแอลกอฮอล์ (ABV)' : 'SPIRIT STRENGTH (ABV)'}
            </span>
            <span className="font-['Cinzel'] text-lg sm:text-xl text-[#fef08a] font-bold mt-0.5 block">
              {drink.abv || '15%'}
            </span>
          </div>
          <div className="bg-[#043927]/60 border border-[#d4af37]/50 rounded-2xl p-3 text-center shadow-inner">
            <span className="font-['Cinzel'] text-[0.65rem] text-[#d4af37] tracking-[0.15em] block font-semibold uppercase">
              ✦ {lang === 'th' ? 'ระดับความหวาน' : 'SWEETNESS LEVEL'}
            </span>
            <span className="font-['Cinzel'] text-lg sm:text-xl text-[#fef08a] font-bold mt-0.5 block">
              {drink.sweetness || 'Moderate'}
            </span>
          </div>
        </div>

        {/* Action Button: Unlock Concierge Sanctuary Pass */}
        <motion.button
          onClick={() => setShowDestination(true)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 px-6 rounded-2xl border border-[#fef08a] bg-gradient-to-r from-[#047857] via-[#043927] to-[#d4af37] text-white font-['Cinzel'] text-sm sm:text-base tracking-[0.2em] font-bold shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2.5 z-10 uppercase cursor-pointer"
        >
          <span>{lang === 'th' ? '🗝️ ปลดล็อกบัตรเชิญเข้าบาร์ลับ' : '🗝️ UNLOCK SANCTUARY PASS'}</span>
          <span>✨</span>
        </motion.button>
      </motion.div>

      {/* Bottom Re-try Button */}
      {onRestart && (
        <button
          onClick={onRestart}
          className="mt-6 font-['Cinzel'] text-xs text-[#d4af37]/70 hover:text-[#fef08a] tracking-[0.2em] uppercase transition-all z-10 font-semibold cursor-pointer"
        >
          {lang === 'th' ? '[ ✦ กลับสู่ล็อบบี้ต้อนรับ ✦ ]' : '[ ✦ RETURN TO CONCIERGE LOBBY ✦ ]'}
        </button>
      )}
    </div>
  );
}
