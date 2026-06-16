# Immersive Subtle Parallax — `/meet-jack`

**Date:** 2026-06-15
**Status:** Design approved, pending spec review
**Branch:** `feat/meet-jack-parallax`

## Goal

Make the `/meet-jack` page feel like reading *into* a magic book rather than a flat
document, by adding a **subtle, immersive, scroll-driven parallax** layer. "Immersive"
(combine atmospheric depth + section reveals + one hero beat) at a deliberately
**subtle** intensity (the page should "breathe," never feel busy or seasick).

Both light and dark mode must share the **same general feeling** — identical motion,
depth structure, and timing; only the palette differs (ink-on-paper vs. chalk-among-stars).

## Decisions (from brainstorming)

- **Scope:** D — all-in immersive (backdrop depth bands + section reveals + hero portrait beat).
- **Intensity:** A — subtle & dreamy. Backdrop bands drift ~20–80px over the *whole* page.
- **Backdrop material:** A — enrich the backdrop with more faint doodles, grouped into depth bands.
- **Tech:** framer-motion `useScroll` + `useTransform` as the base, with a **CSS 3D perspective
  shell on top** for genuine depth cues (the hybrid the user asked for).
- **Both modes:** parallax + enriched doodles apply equally in light and dark.

## Layer stack (back → front)

1. `StarsBackground` (`components/stars-background.tsx`) — **untouched.** Furthest static
   plane, dark-mode only. The new backdrop sits in front of it.
2. **`ParallaxBackdrop`** *(new)* — replaces `<CoverDoodles fixed />` on meet-jack only.
   `fixed inset-0 z-0` perspective shell holding 3 depth bands of faint ink doodles.
3. Page content (`<main>` sections) — gentle scroll-reveals; About portrait micro-parallax.
4. Site-pet / dock / scroll-to-top button — **untouched**, front layer.

`CoverDoodles` stays in use on the landing page (`app/page.tsx`) — unchanged.

## Mechanism — the hybrid

**Why nesting is required:** CSS `translateZ` and framer-motion's scroll `y` both write the
element's `transform` property. On the same node, framer-motion clobbers the CSS. So they are
**nested**: CSS owns the static *depth look*; framer-motion owns the *scroll motion*.

```
ParallaxBackdrop (fixed inset-0 z-0; perspective:1000px; transform-style:preserve-3d)
└─ band (×3)            ← static CSS depth: translateZ(-N) + compensating scale,
   │                       plus lower opacity + slight blur for far bands
   └─ motion.div        ← framer-motion: y = useTransform(scrollYProgress,[0,1],[0,-driftₙ])
      └─ doodles…       ← positioned top:-10% … 110% so drift reveals fresh ink
```

- One shared `useScroll()` → `scrollYProgress` (0→1 over the whole page) drives all bands.
- **Drift per band (subtle):** far ≈ 20px, mid ≈ 45px, near ≈ 80px over the full scroll.
  Far drifts least (reads as "more distant"); near drifts most.
- **Static depth (CSS 3D):** far band `translateZ(-300px) scale(1.3)`, mid `-150px scale(1.15)`,
  near `translateZ(0)` (exact values tuned in implementation). Far bands also get
  `opacity` falloff + a small `blur()` so depth reads even when motion is subtle.
- Doodles span `top: -10% … 110%` within each band so continuous drift keeps revealing
  fresh ink rather than the same few marks.

## What gets enriched / added

### Backdrop doodles
Extend the existing `CoverDoodles` vocabulary (crescent moon, constellation, sparkle) with a
few more faint flourishes distributed across the 3 bands:
- extra sparkles at varied sizes,
- one or two small hand-drawn wavy ink-swirls/flourishes,
- a far-back single faint "ink wash" blob (soft radial) on the deepest band.

All doodles are low-opacity `currentColor` → theme-adaptive automatically (foreground ink on
paper in light, foreground chalk among stars in dark) — **except** the far-back ink-wash blob,
which is the one mode-aware element: it needs a faint light tint in dark mode so it doesn't
disappear into black. Implement via a `dark:` variant, not by abandoning `currentColor` elsewhere.

### Section reveals
`app/meet-jack/components/about.tsx` already defines `fadeUp` / `inView` motion helpers
(rise + fade, `viewport once`, `-60px` margin, 0.7s cubic-bezier). **Extract these into one
shared helper** (`components/effects/reveal.ts`) and apply the same gentle rise/fade
consistently to Experience, Projects, Publications, and Guestbook section wrappers — so
arriving at each section feels like a page settling. No layout changes; wraps only. About keeps
its current (now-shared) behavior.

### Hero micro-parallax
The About portrait drifts ~12–20px slower than its container as it scrolls past — one quiet
"showpiece" beat. Subtle; not a large move. Implemented with the same `useScroll`/`useTransform`
pattern, scoped to the portrait element.

## Guards (required, not optional)

- **Reduced motion:** `useReducedMotion()` (framer-motion) collapses *all* drift, reveals, and
  the portrait beat to static. Doodles still render (enriched, static). Single switch covering
  backdrop + reveals + hero.
- **Mobile:** drift distances scale down hard (toward ~0) below the page's existing mobile
  breakpoint (`<= 375px` logic already in `page.tsx`; reuse/raise as appropriate). Static CSS
  perspective depth may remain since it costs nothing per-frame. Goal: phones stay smooth.
- **Performance:** transform/opacity only (compositor-friendly), `will-change: transform` on the
  drifting bands, a **single** shared `useScroll` progress value for the page (not one per band).
- **Both modes:** verify the effect reads in light *and* dark; motion/structure identical, only
  palette differs.

## Files

**New**
- `components/effects/parallax-backdrop.tsx` — perspective shell + 3 depth bands + enriched doodles.
- `components/effects/reveal.ts` — shared `fadeUp` / `inView` reveal helpers (extracted from `about.tsx`).

**Edit**
- `app/meet-jack/page.tsx` — swap `<CoverDoodles fixed />` → `<ParallaxBackdrop />`.
- `app/meet-jack/components/about.tsx` — import shared reveal helpers; add portrait micro-parallax.
- `app/meet-jack/components/experience.tsx`, `projects.tsx`, `publications.tsx`, `contact.tsx`
  — wrap section roots with the shared reveal helper (light touch).

**Unchanged**
- `components/effects/cover-doodles.tsx` (still used by landing page).
- `components/stars-background.tsx`, site-pet, dock, scroll-to-top.

## Non-goals (YAGNI)

- No pinned/sticky scroll sections, no horizontal scroll, no big cinematic slides (that was
  intensity C, rejected).
- No new animation dependency (framer-motion only).
- No changes to the landing page parallax.
- No coupling to the site-pet RAF loop (rejected approach #2).

## Success criteria

- Scrolling `/meet-jack` shows faint doodles drifting at visibly different depths without
  feeling busy; sections rise gently into view; the About portrait has one subtle parallax beat.
- Identical motion/structure and "magic book" feeling in light and dark mode.
- Reduced-motion users see a static (but still enriched) backdrop, no drift.
- No visible jank on a mid-range phone; main-thread stays clear (transform/opacity only).
