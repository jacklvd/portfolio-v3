import type { ReactNode } from 'react';

/**
 * Defines the SVG turbulence/displacement filters that warp a straight border
 * line into a gentle hand-drawn wave. Render this ONCE per app (it's mounted
 * globally in client-app-content). It outputs nothing visible.
 *
 *  - `wavy-frame`     strong wave, for large surfaces (project cards, photo)
 *  - `wavy-frame-sm`  gentle wave, for small/medium elements (buttons, chips)
 *    so a tiny badge doesn't wobble as hard as a big card.
 */
export function WavyFilterDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        <filter id="wavy-frame" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="wavy-frame-sm" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * A border-only layer with a wavy filter applied. Pass the actual border /
 * shadow / radius styling via `className` so it can adapt to any element
 * (frame, button, chip). The filter warps the border AND any box-shadow on it,
 * so neo-brutalist offset shadows ripple along with the line.
 */
export function WavyBorder({
  className = '',
  filterId = 'wavy-frame',
}: {
  className?: string;
  filterId?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ filter: `url(#${filterId})` }}
    />
  );
}

/**
 * Wavy border + offset "pressed" shadow for the neo-brutalist buttons. Drop it
 * as the first child of a `group relative` button/link and remove that element's
 * own border/shadow — the text stays crisp, only the frame goes wavy.
 */
export function WavyButtonBorder() {
  return (
    <WavyBorder
      filterId="wavy-frame-sm"
      className="border border-foreground shadow-[4px_4px_#121212] dark:shadow-[4px_4px_#e5e5e5] transition-all duration-100 group-hover:shadow-[1px_1px_#121212] dark:group-hover:shadow-[1px_1px_#e5e5e5]"
    />
  );
}

// Pre-built smooth sine path for horizontal dividers (constant, built once).
const DIVIDER_WIDTH = 1200;
const DIVIDER_PATH = (() => {
  const period = 44;
  const amp = 3;
  const mid = 6;
  let d = `M0 ${mid}`;
  for (let x = 0; x < DIVIDER_WIDTH; x += period) {
    d += ` q ${period / 4} ${-amp} ${period / 2} 0 q ${period / 4} ${amp} ${period / 2} 0`;
  }
  return d;
})();

/** A hand-drawn wavy horizontal divider line (replaces a flat border rule). */
export function WavyDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${DIVIDER_WIDTH} 12`}
      preserveAspectRatio="none"
      className={`block w-full h-3 text-foreground/20 ${className}`}
    >
      <path
        d={DIVIDER_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Wraps card content in a hand-drawn wavy frame. The frame line lives on its
 * own filtered layer so the image/text inside stay sharp.
 *
 * The content is inset (matted) from the frame by a small margin so the image's
 * straight edge no longer overlaps and fights the wavy line — it reads as an
 * illustration plate mounted inside the frame, like a printed book page.
 */
export function WavyCard({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative h-full p-2 sm:p-2.5">
      <WavyBorder className="rounded-[1.4rem] border border-foreground/25 transition-colors duration-300 group-hover:border-foreground/50" />
      <div
        className={`relative h-full overflow-hidden rounded-[0.85rem] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
