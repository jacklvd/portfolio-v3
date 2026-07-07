# "The Book Opens" — cinematic landing entrance

**Date:** 2026-07-07
**Goal:** One choreographed opening sequence on first paint: preloader becomes the book's
cover and physically opens onto the hero, whose elements reveal in storybook order.

## Timeline (~2.5s after count hits 100)

| t | Beat |
|------|------|
| 0.0s | Pet reaches 100, sprints off the right edge of the screen (~0.9s) |
| 0.9s | Loader content fades (0.2s); the two cover halves hinge open at a center spine (`rotateY` ±~70° with parent `perspective`, soft gradient shadow at the spine), fading as they swing. ~0.9s |
| 0.9s | `entranceOpen` fires as the covers start moving — hero choreography begins *behind* them |
| +0.15s | Wavy hero frame fades/scales in ("ink blots in") |
| then | Greeting → "Jack Vo" letter-by-letter (stagger, y+blur per char) → divider clip-path sweep (draws left→right) → typewriter mounts (starts typing at reveal) → CTA → socials, all via one parent variant with `staggerChildren` |
| ~1.2s | Stickers cascade in one at a time: spring drop from `y:-24` (paper landing) |
| ~1.5s | Doodles + 3D scene fade in; site pet mounts (enters as if the loader pet stepped into the book) |

## Changes (5 files, no new deps)

- `context/entrance-context.tsx` (new): tiny `EntranceProvider` + `useEntranceOpen()` boolean.
- `components/pet/pet-loader.tsx`: phases `loading → walkoff → open`. Root gets
  `perspective`; two absolute half-screen `bg-background` panels (`origin-right` /
  `origin-left`) carry the exit `rotateY`; content layer exits with a fast fade.
  New prop `onOpen` fires when the split starts. Component stays mounted and renders
  null after `AnimatePresence` exit completes.
- `components/client-app-content.tsx`: owns `entranceOpen` state, provides context,
  keeps `PetLoader` mounted, gates `SitePet` on `entranceOpen`.
- `app/page.tsx`: replace ad-hoc `fadeUp` delays with parent/child variants gated on
  `useEntranceOpen()`. Title split into per-letter `aria-hidden` spans + `sr-only`
  full name. Stickers/doodles/scene render only once open, with staggered delays.
- `components/effects/sticker.tsx`: optional `enterDelay` prop; entrance becomes a
  spring drop (`y:-24 → 0`).

## Non-goals / handled cases

- **Reduced motion:** existing `MotionConfig reducedMotion="user"` degrades transforms
  to fades. Verify only.
- **Mobile:** same sequence; stickers already hidden on mobile so that beat skips itself.
- **Repeat visits:** full sequence every visit (existing commented-out `has_visited`
  code remains the escape hatch if it gets annoying).
- **Skipped:** sound, camera dolly, real 3D book, per-visit variation.
