/**
 * VintageOverlay.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Subtle animated film-grain & CRT-scanline overlay across the entire app
 * to give it a vintage Thai comic book / Street-Pop cyberpunk vibe.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';

export default function VintageOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden select-none">
      
      {/* ── CRT Scanlines ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.06] sm:opacity-[0.08]"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* ── Animated Vintage Film Grain Noise / Halftone Dots ────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at center, #000 1px, transparent 1.5px)`,
          backgroundSize: '6px 6px',
        }}
      />

      {/* ── Subtle Vignette Frame for Comic Book Immersion ───────────────── */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(15, 10, 24, 0.75) 100%)',
        }}
      />
    </div>
  );
}
