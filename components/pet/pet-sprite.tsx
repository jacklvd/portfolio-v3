// Presentational ink-doodle creature. Pure SVG, no state of its own — the
// parent (SitePet / PetLoader) drives it via:
//   - `mode`   → sets a `.pet--{mode}` class that CSS keyframes hook into
//   - `blink`  → momentarily squashes the eyes
//   - `facing` → flips horizontally so it looks where it walks
//   - `hat`    → which hat to wear
// Cursor eye-tracking is done by the parent setting the CSS custom properties
// `--pet-eye-x` / `--pet-eye-y` on an ancestor; the pupils read them.
//
// Colors come from the theme: the body is "paper" (--background) with a
// "currentColor" ink outline (the parent sets text color to --foreground), so
// it reads as a hand-drawn doodle in both light and dark mode. The body outline
// borrows the global `wavy-frame-sm` displacement filter for a hand-inked wobble.

import { HatShape, type HatId } from './hats';

export type PetMode = 'idle' | 'walk' | 'drag' | 'hop' | 'dizzy' | 'sleep';

export function PetSprite({
  mode = 'idle',
  blink = false,
  facing = 1,
  hat = 'none',
  wobble = true,
  className = '',
}: {
  mode?: PetMode;
  blink?: boolean;
  facing?: 1 | -1;
  hat?: HatId;
  wobble?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 60"
      className={`pet pet--${mode} ${blink ? 'pet--blink' : ''} ${className}`}
      style={{ transform: `scaleX(${facing})` }}
      aria-hidden
      focusable="false"
    >
      <g className="pet-bob">
        {/* Legs (behind the body) */}
        <g className="pet-legs" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
          <line className="pet-leg pet-leg-l" x1={19} y1={44} x2={19} y2={55} />
          <line className="pet-leg pet-leg-r" x1={29} y1={44} x2={29} y2={55} />
        </g>

        {/* Body blob — wobbly hand-drawn outline */}
        <path
          className="pet-outline"
          d="M16 15 C 10 15 8 21 8 28 L 8 39 C 8 46 12 47 17 47 L 31 47 C 36 47 40 46 40 39 L 40 28 C 40 21 38 15 32 15 Z"
          fill="hsl(var(--background))"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinejoin="round"
          style={wobble ? { filter: 'url(#wavy-frame-sm)' } : undefined}
        />

        {/* Stubby arms */}
        <g stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path className="pet-arm pet-arm-l" d="M9 32 q-3 2 -3 5" fill="none" />
          <path className="pet-arm pet-arm-r" d="M39 32 q3 2 3 5" fill="none" />
        </g>

        {/* Face */}
        <g className="pet-eyes">
          <g className="pet-pupils" fill="currentColor">
            <circle cx={19.5} cy={29} r={2.4} />
            <circle cx={28.5} cy={29} r={2.4} />
          </g>
        </g>
        <path
          className="pet-mouth"
          d="M21 36 q3 2.6 6 0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        />

        {/* Hat */}
        {hat !== 'none' && (
          <g className="pet-hat">
            <HatShape id={hat} />
          </g>
        )}
      </g>
    </svg>
  );
}
