/**
 * LoadingScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Two variants:
 *   default  – simple spinner with bouncing dots
 *   mystical – orbiting rings + crystal ball, used while calculating result
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function LoadingScreen({ message = 'Loading…', mystical = false, progressPercent = null }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-6 bg-[#1a1a1a]">

      {/* ── Visual indicator ─────────────────────────────────────────────── */}
      {mystical ? (
        // Orbiting rings with crystal ball
        <div className="relative flex items-center justify-center w-32 h-32">
          <div
            className="absolute rounded-full border border-purple-500/20 w-32 h-32 animate-spin-slow"
            style={{ animationDuration: '6s' }}
          />
          <div
            className="absolute rounded-full border border-cyan-500/15 w-24 h-24 animate-spin-slow"
            style={{ animationDuration: '4s', animationDirection: 'reverse' }}
          />
          <div
            className="absolute rounded-full border border-purple-400/10 w-16 h-16 animate-spin-slow"
            style={{ animationDuration: '3s' }}
          />
          <span className="text-5xl animate-float relative z-10"
            style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.8))' }}>
            🔮
          </span>
        </div>
      ) : (
        // Comic Pop-Art / Neon indicator
        <div className="relative flex flex-col items-center">
          <div className="text-6xl mb-4 animate-bounce">⚡🎮</div>
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
              style={{
                borderTopColor:  '#ff1616',
                borderRightColor: '#ffde59',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Message & Preload Bar ────────────────────────────────────────── */}
      <div className="text-center space-y-4 max-w-sm w-full">
        <p className="text-white font-['Chonburi'] text-lg md:text-xl tracking-wide">{message}</p>

        {progressPercent !== null && (
          <div className="w-full bg-white/10 p-1 rounded-full border-2 border-white/30 shadow-[4px_4px_0_#1a1a1a]">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#ff1616] via-[#ffde59] to-[#00ff88] transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, Math.min(100, progressPercent))}%` }}
            />
          </div>
        )}

        {/* Bouncing dot trio */}
        <div className="flex gap-2 justify-center pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                background:     i === 0 ? '#ff1616' : i === 1 ? '#ffde59' : '#00ff88',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
