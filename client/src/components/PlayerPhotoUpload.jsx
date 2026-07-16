/**
 * PlayerPhotoUpload.jsx — Thai-Comic Book / Pop Art 3D Parallax Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   onConfirm (uploadedUrl: string) => void
 *   onSkip    () => void (optional fallback)
 *
 * Design Theme:
 *   • Thai-Comic Book / Pop Art style with vibrant cyan, magenta, gold & halftone dots.
 *   • Headers use 'Chonburi' font (`font-['Chonburi']`).
 *
 * Features:
 *   1. Upload Input: A stylized file input button that looks like a comic book
 *      'BAM!' or 'CLICK!' sticker. Triggers file selector & POST /api/upload-photo.
 *   2. 3D Comic Display: Once image URL is returned, hides upload button and
 *      displays the uploaded image inside a 3D parallax hero card.
 *   3. Framer Motion 3D Effect:
 *      • Container with perspective: 1000px and transformStyle: preserve-3d.
 *      • Retro halftone comic background as the base layer (`translateZ(0px)`).
 *      • Uploaded user image on top, wrapped in thick black border + white comic frame
 *        with slight rotation (`rotateZ(-3deg)`) and `translateZ(50px)` to pop out in 3D.
 *      • Mouse-move & Device Orientation dynamic 3D tilting.
 *   4. Stylized 'CONFIRM' button to proceed to the next game state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function PlayerPhotoUpload({ onConfirm, onSkip }) {
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const fileInputRef                  = useRef(null);

  // ─── 3D Parallax Tilt Motion Values ─────────────────────────────────────────
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });

  // Handle Mouse Move over the card container for smooth 3D tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation angles (max 18 degrees)
    const rX = (mouseY / (rect.height / 2)) * -18;
    const rY = (mouseX / (rect.width / 2)) * 18;

    rotateX.set(rX);
    rotateY.set(rY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Support mobile gyroscope / deviceorientation for dynamic 3D tilt
  useEffect(() => {
    const handleOrientation = (e) => {
      if (!uploadedUrl) return;
      if (e.beta !== null && e.gamma !== null) {
        // beta is pitch (-180 to 180), gamma is roll (-90 to 90)
        const rX = Math.max(-18, Math.min(18, (e.beta - 45) * -0.5));
        const rY = Math.max(-18, Math.min(18, e.gamma * 0.5));
        rotateX.set(rX);
        rotateY.set(rY);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [uploadedUrl, rotateX, rotateY]);

  // ─── File Upload Handler ────────────────────────────────────────────────────
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    // Create local object URL for instant preview / reliable fallback
    const localPreviewUrl = URL.createObjectURL(file);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.imageUrl) {
          setUploadedUrl(data.imageUrl);
          setLoading(false);
          return;
        }
      }
      // If server route isn't available yet or fails, fallback to local data URL / object URL
      setUploadedUrl(localPreviewUrl);
    } catch (err) {
      console.warn('Upload API fallback to local image:', err);
      setUploadedUrl(localPreviewUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (uploadedUrl && onConfirm) {
      onConfirm(uploadedUrl);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-x-hidden">
      
      {/* Hidden file selector */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header — Chonburi font */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center max-w-lg mb-6"
      >
        <div className="inline-block bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-xs sm:text-sm tracking-[0.2em] px-3 py-1 border-2 border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] -rotate-2 mb-2">
          ★ THAI COMIC HERO REGISTRATION ★
        </div>
        <h2
          className="text-3xl sm:text-4xl font-['Chonburi'] tracking-wide text-white uppercase leading-snug"
          style={{
            textShadow: '2px 2px 0 #1a1a1a, 4px 4px 0 #ff1616, 6px 6px 0 #1a1a1a',
          }}
        >
          {uploadedUrl ? 'YOUR HERO IDENTITY!' : 'UPLOAD HERO PHOTO'}
        </h2>
        <p className="font-['Outfit'] text-white/75 text-sm mt-1">
          {uploadedUrl
            ? 'Tilt your mouse or device to experience the 3D pop-art parallax effect!'
            : 'Snap or select a photo to generate your custom 3D comic character card.'}
        </p>
      </motion.div>

      {/* ─── STATE 1: UPLOAD BUTTON ('BAM!' / 'CLICK!' STICKER) ─────────────── */}
      {!uploadedUrl && !loading && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center justify-center my-6 gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.08, rotate: -4 }}
            whileTap={{ scale: 0.94, rotate: 2 }}
            onClick={handleFileClick}
            className="group relative cursor-pointer flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl border-4 border-white bg-gradient-to-br from-[#ff1616] via-[#ff2a85] to-[#ff9100] shadow-[0_0_0_4px_#1a1a1a,8px_8px_0_#1a1a1a,0_0_40px_rgba(255,42,133,0.6)] -rotate-2 transition-transform max-w-xs text-center"
          >
            {/* Corner Crop Marks */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-3 border-l-3 border-white/80" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-3 border-r-3 border-white/80" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-3 border-l-3 border-white/80" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-3 border-r-3 border-white/80" />

            {/* Halftone background inside sticker */}
            <div
              className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)',
                backgroundSize: '10px 10px',
              }}
            />

            {/* Camera Emoji & Comic Text */}
            <span className="text-6xl sm:text-7xl filter drop-shadow-[3px_4px_0_#1a1a1a] mb-3 group-hover:scale-110 transition-transform">
              📸
            </span>
            <div className="font-['Bangers'] text-white text-2xl sm:text-3xl tracking-widest uppercase filter drop-shadow-[2px_2px_0_#1a1a1a]">
              💥 CLICK! UPLOAD 💥
            </div>
            <div className="font-['Bangers'] text-[#ffde59] text-sm tracking-wider mt-1 filter drop-shadow-[1px_1px_0_#1a1a1a]">
              SELECT IMAGE OR TAKE SELFIE
            </div>
          </motion.button>

          {error && (
            <p className="font-['Bangers'] text-[#ffde59] bg-[#ff1616] px-4 py-1 border-2 border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]">
              ⚠️ {error}
            </p>
          )}

          {onSkip && (
            <button
              onClick={onSkip}
              className="font-['Bangers'] text-white/50 hover:text-white underline tracking-widest text-sm transition-colors cursor-pointer"
            >
              SKIP PHOTO & USE DEFAULT CHARACTER →
            </button>
          )}
        </motion.div>
      )}

      {/* ─── STATE 2: LOADING / UPLOADING COMIC BURST ───────────────────────── */}
      {loading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1], rotate: [-5, 5, -3] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="my-14 bg-[#ffde59] border-4 border-[#1a1a1a] shadow-[6px_6px_0_#1a1a1a] p-8 text-center rounded-2xl max-w-sm"
        >
          <div className="text-5xl mb-2 animate-bounce">⚡</div>
          <div className="font-['Bangers'] text-2xl text-[#1a1a1a] tracking-widest uppercase">
            UPLOADING HERO DATA...
          </div>
          <div className="font-['Outfit'] text-xs text-[#1a1a1a]/70 font-semibold mt-1">
            Printing halftone comic colors...
          </div>
        </motion.div>
      )}

      {/* ─── STATE 3: 3D PARALLAX COMIC DISPLAY (POST-UPLOAD) ───────────────── */}
      {uploadedUrl && !loading && (
        <div className="flex flex-col items-center gap-6 w-full max-w-md my-2">
          
          {/* 3D Perspective Container (`perspective: 1000px`) */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full sm:w-[340px] h-[430px] sm:h-[460px] relative cursor-pointer flex items-center justify-center"
            style={{ perspective: '1000px' }}
          >
            {/* Preserve-3D Card */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="w-full h-full relative rounded-2xl transition-shadow duration-300"
            >
              {/* ── BASE LAYER (Retro Halftone Comic Background) `translateZ(0px)` ── */}
              <div
                className="absolute inset-0 rounded-2xl border-4 border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a,0_0_50px_rgba(56,182,255,0.4)] overflow-hidden flex flex-col justify-between p-4"
                style={{
                  background: 'linear-gradient(145deg, #00f5ff 0%, #ff007f 100%)',
                  transform: 'translateZ(0px)',
                }}
              >
                {/* Halftone Dot Texture Layer */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #1a1a1a 2px, transparent 2px)',
                    backgroundSize: '12px 12px',
                  }}
                />

                {/* Starburst Action Burst in Base Layer */}
                <div
                  className="absolute -top-20 -right-20 w-64 h-64 bg-[#ffde59] opacity-90 pointer-events-none"
                  style={{
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    transform: 'rotate(15deg)',
                  }}
                />

                {/* Top Strip Header inside Base Layer */}
                <div className="relative z-10 flex items-center justify-between border-b-3 border-[#1a1a1a] pb-2 bg-white/90 px-3 py-1.5 rounded-lg shadow-[2px_2px_0_#1a1a1a]">
                  <span className="font-['Bangers'] text-[#1a1a1a] tracking-wider text-sm">
                    ✦ HERO IDENTITY CARD ✦
                  </span>
                  <span className="font-['Bangers'] text-[#ff1616] text-xs px-1.5 py-0.5 bg-[#ffde59] border border-[#1a1a1a]">
                    THAI COMIC #01
                  </span>
                </div>

                {/* Bottom Footer inside Base Layer */}
                <div className="relative z-10 mt-auto pt-2 flex items-center justify-between bg-[#1a1a1a] text-white px-3 py-2 rounded-lg border-2 border-white shadow-[3px_3px_0_#ffde59]">
                  <div>
                    <div className="font-['Chonburi'] text-xs tracking-wider text-[#ffde59] uppercase">
                      SIAMESE HERO
                    </div>
                    <div className="font-['Outfit'] text-[10px] text-white/70">
                      CERTIFIED SPIRIT MATCH
                    </div>
                  </div>
                  <div className="font-['Bangers'] text-xl text-[#00f5ff]">
                    ⚡ VIP ⚡
                  </div>
                </div>
              </div>

              {/* ── TOP LAYER (Uploaded User Image) `translateZ(50px)` & `rotateZ(-3deg)` ── */}
              <div
                className="absolute top-[65px] left-1/2 -translate-x-1/2 w-[82%] h-[260px] sm:h-[285px] p-2.5 bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(0,0,0,0.7)] rounded-xl flex flex-col items-center justify-center overflow-hidden"
                style={{
                  transform: 'translateZ(50px) rotateZ(-3deg)',
                }}
              >
                {/* Uploaded Photo Image */}
                <div className="w-full h-full relative overflow-hidden rounded-lg border-2 border-[#1a1a1a]">
                  <img
                    src={uploadedUrl}
                    alt="Player Hero"
                    className="w-full h-full object-cover origin-center"
                  />
                  {/* Subtle Comic Contrast / Scanline overlay on photo */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-15"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px)',
                      backgroundSize: '100% 4px',
                    }}
                  />
                </div>

                {/* Photo frame caption label */}
                <div className="w-full text-center mt-1 font-['Bangers'] text-xs text-[#1a1a1a] tracking-widest uppercase">
                  ★ SPECIAL EDITION PHOTO ★
                </div>
              </div>

              {/* ── PARALLAX ACCENT STICKER `translateZ(80px)` ── */}
              <div
                className="absolute -top-3 -left-3 z-30 bg-[#ff1616] text-white font-['Bangers'] text-lg sm:text-xl px-3 py-1 border-3 border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] tracking-widest uppercase rounded-lg"
                style={{
                  transform: 'translateZ(80px) rotateZ(-12deg)',
                }}
              >
                💥 BAM!
              </div>

              {/* ── PARALLAX RETRO BADGE `translateZ(70px)` ── */}
              <div
                className="absolute bottom-16 -right-3 z-30 bg-[#ffde59] text-[#1a1a1a] font-['Bangers'] text-sm px-2.5 py-1 border-3 border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] tracking-wider uppercase rounded-md"
                style={{
                  transform: 'translateZ(70px) rotateZ(8deg)',
                }}
              >
                ⭐ LEGEND ⭐
              </div>
            </motion.div>
          </div>

          {/* Action Buttons: Confirm / Re-upload */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs mt-2">
            
            {/* Re-upload button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFileClick}
              className="w-full sm:w-auto py-2.5 px-4 bg-white text-[#1a1a1a] font-['Bangers'] text-sm tracking-wider uppercase border-3 border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] rounded-lg cursor-pointer"
            >
              📸 CHANGE PHOTO
            </motion.button>

            {/* Stylized 'CONFIRM' Button */}
            <motion.button
              whileHover={{ scale: 1.06, rotate: 2 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleConfirm}
              className="w-full flex-1 py-3 px-5 bg-gradient-to-r from-[#00f5ff] via-[#38b6ff] to-[#ff007f] text-white font-['Bangers'] text-lg tracking-widest uppercase border-4 border-white shadow-[0_0_0_3px_#1a1a1a,4px_4px_0_#1a1a1a] rounded-xl cursor-pointer"
            >
              ⚡ CONFIRM HERO ⚡
            </motion.button>
          </div>
        </div>
      )}

    </div>
  );
}
