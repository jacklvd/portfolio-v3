'use client';

// Hand-drawn ink flourishes for the landing "book cover": a crescent moon, a
// small constellation joined by a wavy line, and a few sparkles. Everything is
// stroked in currentColor at low opacity, so it reads as faint ink on paper in
// light mode and faint chalk among the stars in dark mode. Purely decorative.

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-8 -8 16 16" className={className} aria-hidden>
      <path
        d="M0 -7 Q1 -1 7 0 Q1 1 0 7 Q-1 1 -7 0 Q-1 -1 0 -7 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CoverDoodles({ fixed = false }: { fixed?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden text-foreground ${
        // `fixed` mirrors StarsBackground's layering so it sits behind page
        // content as a persistent backdrop; the default `absolute` keeps it
        // scoped to the landing hero.
        fixed ? 'fixed inset-0 z-0' : 'absolute inset-0 z-[1]'
      }`}
    >
      {/* Crescent moon, top-left */}
      <svg
        className="absolute left-[8%] top-[15%] h-10 w-10 opacity-25 sm:h-14 sm:w-14"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
      >
        <path d="M27 5a16 16 0 1 0 7 23A13 13 0 0 1 27 5Z" />
      </svg>

      {/* Constellation, top-right */}
      <svg
        className="absolute right-[8%] top-[18%] h-24 w-36 opacity-20 sm:h-28 sm:w-44"
        viewBox="0 0 160 110"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M12 84 Q30 70 48 66 Q67 74 86 78 Q103 56 120 40 Q135 52 150 58"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {[
          [12, 84],
          [48, 66],
          [86, 78],
          [120, 40],
          [150, 58],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.8} fill="currentColor" stroke="none" />
        ))}
      </svg>

      <Sparkle className="absolute left-[18%] top-[34%] h-3 w-3 opacity-25 sm:h-4 sm:w-4" />
      <Sparkle className="absolute right-[22%] top-[62%] h-4 w-4 opacity-20 sm:h-5 sm:w-5" />
      <Sparkle className="absolute left-[30%] bottom-[18%] h-2.5 w-2.5 opacity-20" />
    </div>
  );
}
