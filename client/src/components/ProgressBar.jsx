/**
 * ProgressBar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-element progress indicator:
 *   1. Gradient fill bar (left-to-right animation)
 *   2. Step dot row (completed = purple, current = cyan pulse, pending = dim)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function ProgressBar({ current, total }) {
  const fillPct = (current / total) * 100;

  return (
    <div className="space-y-2.5">

      {/* ── Fill bar ─────────────────────────────────────────────────────── */}
      <div className="w-full h-1 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:      `${fillPct}%`,
            background: 'linear-gradient(90deg, #7c3aed, #2563eb, #22d3ee)',
          }}
        />
      </div>

      {/* ── Step dots ────────────────────────────────────────────────────── */}
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }).map((_, i) => {
          const isCompleted = i < current;
          const isCurrent   = i === current;

          return (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out
                ${isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-25 bg-white/30'}
              `}
              style={
                isCompleted
                  ? { background: 'linear-gradient(90deg, #7c3aed, #22d3ee)' }
                  : isCurrent
                  ? { background: '#22d3ee', animation: 'glow 1.5s ease-in-out infinite alternate' }
                  : {}
              }
            />
          );
        })}
      </div>

    </div>
  );
}
