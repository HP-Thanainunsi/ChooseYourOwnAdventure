/**
 * LoadingScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Two variants:
 *   default  – simple spinner with bouncing dots
 *   mystical – orbiting rings + crystal ball, used while calculating result
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function LoadingScreen({ message = 'Loading…', mystical = false }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-6">

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
        // Clean spinner ring
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/8" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor:  '#a855f7',
              borderRightColor: '#22d3ee',
            }}
          />
        </div>
      )}

      {/* ── Message ──────────────────────────────────────────────────────── */}
      <div className="text-center space-y-4">
        <p className="text-white/50 text-sm font-medium">{message}</p>

        {/* Bouncing dot trio */}
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{
                background:     '#a855f7',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
