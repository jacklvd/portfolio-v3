// Hat variants for the site pet. Each hat is a small inline-SVG drawn in the
// pet's own 48×60 coordinate space, anchored so it sits on the head (head top
// is around y≈15, centered at x≈24). Strokes use currentColor so they inherit
// the pet's ink color; fills use the paper background so they read in both
// light and dark themes.

import type { ReactNode } from 'react';

export const HAT_IDS = ['none', 'wizard', 'party', 'bucket', 'crown', 'sprout'] as const;
export type HatId = (typeof HAT_IDS)[number];

export const HAT_LABELS: Record<HatId, string> = {
  none: 'No hat',
  wizard: 'Wizard',
  party: 'Party',
  bucket: 'Bucket',
  crown: 'Crown',
  sprout: 'Sprout',
};

export const HAT_STORAGE_KEY = 'pet-hat';

const ink = 'currentColor';
const paper = 'hsl(var(--background))';

export function HatShape({ id }: { id: HatId }): ReactNode {
  switch (id) {
    case 'wizard': // pointy magician's hat — a nod to the "magic book" theme
      return (
        <g strokeWidth={2} strokeLinejoin="round">
          <path d="M24 -8 L33 15 L15 15 Z" fill={paper} stroke={ink} />
          <path d="M13 15 L35 15" stroke={ink} strokeLinecap="round" />
          <path d="M24 -1 l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z" fill={ink} stroke="none" />
        </g>
      );
    case 'party':
      return (
        <g strokeWidth={2} strokeLinejoin="round">
          <path d="M24 -7 L31 15 L17 15 Z" fill={paper} stroke={ink} />
          <path d="M20 8 h8 M19 12 h10" stroke={ink} strokeLinecap="round" strokeWidth={1.4} />
          <circle cx={24} cy={-7} r={2} fill={ink} stroke="none" />
        </g>
      );
    case 'bucket':
      return (
        <g strokeWidth={2} strokeLinejoin="round">
          <path d="M15 14 L17 4 L31 4 L33 14 Z" fill={paper} stroke={ink} />
          <path d="M12 15 L36 15" stroke={ink} strokeLinecap="round" />
        </g>
      );
    case 'crown':
      return (
        <g strokeWidth={2} strokeLinejoin="round">
          <path d="M14 14 L14 4 L19 9 L24 2 L29 9 L34 4 L34 14 Z" fill={paper} stroke={ink} />
          <circle cx={24} cy={2} r={1.4} fill={ink} stroke="none" />
        </g>
      );
    case 'sprout':
      return (
        <g strokeWidth={2} strokeLinecap="round">
          <path d="M24 14 L24 5" stroke={ink} fill="none" />
          <path d="M24 8 q-7 -1 -7 -7 q7 0 7 7" fill={paper} stroke={ink} />
          <path d="M24 6 q7 -1 7 -7 q-7 0 -7 7" fill={paper} stroke={ink} />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}
