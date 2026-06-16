# Meet-Jack Immersive Parallax Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle, immersive, scroll-driven parallax to `/meet-jack` — a depth-banded ink-doodle backdrop, consistent section reveals, and one hero portrait beat — that feels the same in light and dark mode.

**Architecture:** A `fixed` CSS-3D perspective backdrop holds three doodle "depth bands"; framer-motion `useScroll`/`useTransform` drifts each band a different (small) amount, while static CSS `translateZ`/scale/blur supplies real depth cues. Section reveal helpers (currently duplicated in three files) are extracted to one shared module and applied across all five sections. The About portrait gets a small scroll-linked drift. All motion collapses to static under reduced-motion and scales down on mobile.

**Tech Stack:** Next.js 14 (App Router, `'use client'`), React 18, framer-motion 11, Tailwind. No new dependencies. No test framework exists in this repo, so verification is **type-check (`npx tsc --noEmit`) + lint (`npm run lint`) + a manual scroll check** — there are no unit tests to write for this visual feature.

---

## File Structure

**New**
- `components/effects/reveal.ts` — shared `inView` / `fadeUp` reveal helpers (one responsibility: section-entrance motion props).
- `components/effects/parallax-backdrop.tsx` — the perspective shell + 3 depth bands + enriched doodles (one responsibility: the meet-jack backdrop).

**Modified**
- `app/meet-jack/components/about.tsx` — use shared reveal helpers; add portrait micro-parallax.
- `app/meet-jack/components/experience.tsx` — use shared reveal helper (remove local dup).
- `app/meet-jack/components/projects.tsx` — use shared reveal helper (remove local dup).
- `app/meet-jack/components/publications.tsx` — use shared reveal helper (DRY inlined props).
- `app/meet-jack/components/contact.tsx` — add reveal to section header.
- `app/meet-jack/page.tsx` — swap `<CoverDoodles fixed />` → `<ParallaxBackdrop />`.

**Unchanged:** `components/effects/cover-doodles.tsx` (still used by landing page), `components/stars-background.tsx`, site-pet, dock, scroll-to-top.

---

### Task 1: Shared reveal helper + de-duplicate three sections

`about.tsx`, `experience.tsx`, and `projects.tsx` each define an identical local `inView`. Extract to one module and import it. `about.tsx` also has a local `fadeUp` — move that too.

**Files:**
- Create: `components/effects/reveal.ts`
- Modify: `app/meet-jack/components/about.tsx` (remove local `fadeUp`/`inView`, import shared)
- Modify: `app/meet-jack/components/experience.tsx` (remove local `inView`, import shared)
- Modify: `app/meet-jack/components/projects.tsx` (remove local `inView`, import shared)

- [ ] **Step 1: Create the shared helper**

Create `components/effects/reveal.ts`:

```ts
// Shared section-entrance motion props for the meet-jack sections, so every
// section "settles" into view the same way (gentle rise + fade). Spread onto a
// framer-motion element: <motion.div {...inView(0.1)} />.

// Plays once when the element scrolls into view.
export const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

// Plays immediately on mount — for above-the-fold content.
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});
```

- [ ] **Step 2: Refactor `about.tsx`**

In `app/meet-jack/components/about.tsx`, delete the local `fadeUp` and `inView` consts (the two blocks defining them near the top), and add this import alongside the existing `wavy-frame` import:

```tsx
import { inView, fadeUp } from '@/components/effects/reveal';
```

Leave every `{...fadeUp(...)}` / `{...inView(...)}` usage in the JSX exactly as-is.

- [ ] **Step 3: Refactor `experience.tsx`**

In `app/meet-jack/components/experience.tsx`, delete the local `inView` const block (the `const inView = (delay = 0) => ({ ... });` near the top) and add:

```tsx
import { inView } from '@/components/effects/reveal';
```

Leave all `{...inView(...)}` usages as-is.

- [ ] **Step 4: Refactor `projects.tsx`**

In `app/meet-jack/components/projects.tsx`, delete the local `inView` const block only (keep `itemVariants` and `containerVariants` — they are separate). Add:

```tsx
import { inView } from '@/components/effects/reveal';
```

Leave all `{...inView(...)}` usages as-is.

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (If tsc reports the spread props are incompatible, the helper shape drifted from the originals — re-copy the object literals above verbatim.)

- [ ] **Step 6: Commit**

```bash
git add components/effects/reveal.ts app/meet-jack/components/about.tsx app/meet-jack/components/experience.tsx app/meet-jack/components/projects.tsx
git commit -m "refactor: extract shared section reveal helpers"
```

---

### Task 2: Apply shared reveal to Publications and Contact

`publications.tsx` inlines the same motion props (DRY them); `contact.tsx`'s section header has no reveal (add one).

**Files:**
- Modify: `app/meet-jack/components/publications.tsx`
- Modify: `app/meet-jack/components/contact.tsx`

- [ ] **Step 1: DRY the Publications header**

In `app/meet-jack/components/publications.tsx`, add the import (next to the existing `wavy-frame` import):

```tsx
import { inView } from '@/components/effects/reveal';
```

Replace the eyebrow `<motion.p>` opening tag's inline `initial`/`whileInView`/`viewport`/`transition` props with `{...inView()}`, and the `<motion.h2>`'s with `{...inView(0.05)}`. Concretely, the two tags become:

```tsx
      <motion.p
        {...inView()}
        className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground mb-3"
      >
        04 — Research
      </motion.p>
      <motion.h2
        {...inView(0.05)}
        className="font-title text-5xl md:text-6xl text-foreground mb-12 md:mb-16"
      >
        Publications.
      </motion.h2>
```

Leave the per-publication `<motion.div>` (the `index * 0.08` stagger) untouched — its timing differs intentionally.

- [ ] **Step 2: Add a reveal to the Contact header**

In `app/meet-jack/components/contact.tsx`, add the import (next to the existing `wavy-frame` import):

```tsx
import { inView } from '@/components/effects/reveal';
```

`motion` is already imported. Change the plain `<header>` (currently `<header className="mb-12 md:mb-16">`) into a `motion.header` with the reveal:

```tsx
      <motion.header {...inView()} className="mb-12 md:mb-16">
        <p className="mb-3 text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
          Say hello
        </p>
        <h2 className="font-title text-5xl text-foreground md:text-6xl">The Guestbook</h2>
        <p className="mt-3 max-w-md font-hand text-2xl text-muted-foreground">
          Leave a note before you go — pin it to the board for everyone to see.
        </p>
      </motion.header>
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/meet-jack/components/publications.tsx app/meet-jack/components/contact.tsx
git commit -m "feat: consistent section reveals across publications and guestbook"
```

---

### Task 3: ParallaxBackdrop component

The core. A `fixed inset-0 z-0` perspective shell with three doodle depth bands. Static CSS depth (translateZ + scale + blur + opacity) on each band; framer-motion `y` drift on a nested inner layer (separate nodes so the two transforms don't collide). Drift collapses to 0 under reduced motion and scales down on mobile.

**Files:**
- Create: `components/effects/parallax-backdrop.tsx`

- [ ] **Step 1: Create the component**

Create `components/effects/parallax-backdrop.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

// Faint hand-drawn ink doodles arranged into three depth bands that drift at
// different speeds as the page scrolls, behind the meet-jack content. CSS 3D
// perspective gives each band a real "distance" (scale + blur + opacity falloff)
// while framer-motion drives the subtle scroll drift. Every mark is drawn in
// currentColor so it stays theme-adaptive — ink on paper in light, chalk among
// the stars in dark — in both modes identically. Purely decorative.

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-8 -8 16 16" className={className} aria-hidden>
      <path d="M0 -7 Q1 -1 7 0 Q1 1 0 7 Q-1 1 -7 0 Q-1 -1 0 -7 Z" fill="currentColor" />
    </svg>
  );
}

function Swirl({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 30 Q14 6 28 20 Q40 32 52 12" />
    </svg>
  );
}

function Moon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden
    >
      <path d="M27 5a16 16 0 1 0 7 23A13 13 0 0 1 27 5Z" />
    </svg>
  );
}

function Constellation({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} fill="none" stroke="currentColor" aria-hidden>
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
  );
}

// Static CSS depth lives on the outer div; framer-motion y-drift lives on the
// inner motion.div. Keeping them on separate nodes prevents the two transforms
// from overwriting each other (both write `transform`).
function Band({
  drift,
  depthClass,
  children,
}: {
  drift: MotionValue<number>;
  depthClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`absolute inset-0 ${depthClass}`}>
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: drift }}>
        {children}
      </motion.div>
    </div>
  );
}

export function ParallaxBackdrop() {
  const prefersReduced = useReducedMotion();
  const [isSmall, setIsSmall] = useState(false);
  const { scrollYProgress } = useScroll();

  // Scale drift down on small screens (cheap + smooth on phones). SSR-safe:
  // defaults to false on the server, corrected on mount. It's an aria-hidden
  // decorative layer, so any first-paint difference is invisible.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const factor = prefersReduced ? 0 : isSmall ? 0.35 : 1;

  // Subtle drift over the full page scroll (0 -> 1). Far moves least, near most.
  const farDrift = useTransform(scrollYProgress, [0, 1], [0, -20 * factor]);
  const midDrift = useTransform(scrollYProgress, [0, 1], [0, -45 * factor]);
  const nearDrift = useTransform(scrollYProgress, [0, 1], [0, -80 * factor]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-foreground"
      style={{ perspective: '1000px' }}
    >
      {/* Far band — deepest, faintest, softest, pushed back + scaled to compensate */}
      <Band
        drift={farDrift}
        depthClass="opacity-[0.12] blur-[1px] [transform:translateZ(-300px)_scale(1.3)]"
      >
        {/* The one mode-aware element: a faint ink-wash blob. currentColor would
            read as dark-on-dark, so it uses an explicit light tint in dark mode. */}
        <div className="absolute left-[12%] top-[24%] h-72 w-72 rounded-full bg-foreground/[0.04] blur-3xl dark:bg-white/[0.05]" />
        <Constellation className="absolute right-[10%] top-[12%] h-24 w-36" />
        <Sparkle className="absolute left-[24%] top-[64%] h-3 w-3" />
        <Sparkle className="absolute right-[28%] top-[88%] h-4 w-4" />
      </Band>

      {/* Mid band */}
      <Band drift={midDrift} depthClass="opacity-[0.18] [transform:translateZ(-150px)_scale(1.15)]">
        <Moon className="absolute left-[8%] top-[8%] h-12 w-12" />
        <Swirl className="absolute right-[14%] top-[40%] h-10 w-16" />
        <Sparkle className="absolute left-[40%] top-[30%] h-4 w-4" />
        <Sparkle className="absolute left-[18%] top-[104%] h-3 w-3" />
        <Sparkle className="absolute right-[8%] top-[72%] h-5 w-5" />
      </Band>

      {/* Near band — closest, sharpest, drifts most */}
      <Band drift={nearDrift} depthClass="opacity-25">
        <Sparkle className="absolute left-[30%] top-[16%] h-4 w-4" />
        <Sparkle className="absolute right-[20%] top-[54%] h-5 w-5" />
        <Swirl className="absolute left-[6%] top-[80%] h-8 w-14" />
        <Sparkle className="absolute right-[34%] top-[110%] h-3 w-3" />
      </Band>
    </div>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/effects/parallax-backdrop.tsx
git commit -m "feat: parallax backdrop with depth-banded ink doodles"
```

---

### Task 4: Wire the backdrop into the meet-jack page

**Files:**
- Modify: `app/meet-jack/page.tsx`

- [ ] **Step 1: Swap the import**

In `app/meet-jack/page.tsx`, replace the line:

```tsx
import { CoverDoodles } from '@/components/effects/cover-doodles';
```

with:

```tsx
import { ParallaxBackdrop } from '@/components/effects/parallax-backdrop';
```

- [ ] **Step 2: Swap the usage**

In the same file, replace:

```tsx
				<CoverDoodles fixed />
```

with:

```tsx
				<ParallaxBackdrop />
```

(Leave `SectionNav`, `main`, `Footer`, and the scroll-to-top button untouched.)

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (`CoverDoodles` is still imported/used by `app/page.tsx`, so its file stays.)

- [ ] **Step 4: Commit**

```bash
git add app/meet-jack/page.tsx
git commit -m "feat: use ParallaxBackdrop on meet-jack page"
```

---

### Task 5: About portrait micro-parallax

One quiet hero beat: the portrait drifts ~16px slower than its container as it scrolls past. Scroll-linked to the portrait's own position; collapses to 0 under reduced motion.

**Files:**
- Modify: `app/meet-jack/components/about.tsx`

- [ ] **Step 1: Add imports and the scroll hook**

In `app/meet-jack/components/about.tsx`, update the framer-motion import to include the scroll hooks, and add `useRef`:

```tsx
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useState, useRef } from 'react';
```

(Merge with the existing `react` import rather than duplicating it — the file currently imports `useState` from `'react'`; add `useRef` there.)

Inside the `About` component body, just after `const [expanded, setExpanded] = useState(false);`, add:

```tsx
  const portraitRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress: portraitProgress } = useScroll({
    target: portraitRef,
    offset: ['start end', 'end start'],
  });
  const portraitY = useTransform(
    portraitProgress,
    [0, 1],
    prefersReduced ? [0, 0] : [16, -16],
  );
```

- [ ] **Step 2: Attach the ref and drift**

In the JSX, find the portrait wrapper:

```tsx
          <div className="group relative aspect-[3/4] p-2">
```

Add the ref:

```tsx
          <div ref={portraitRef} className="group relative aspect-[3/4] p-2">
```

Then change the inner image wrapper from a plain `<div>` to a `motion.div` carrying the drift. Replace:

```tsx
            <div className="relative h-full w-full overflow-hidden rounded-[0.85rem]">
```

with:

```tsx
            <motion.div
              style={{ y: portraitY }}
              className="relative h-full w-full overflow-hidden rounded-[0.85rem] will-change-transform"
            >
```

and its matching closing `</div>` (the one right before the `{/* Magic pop: sparkles ... */}` comment) with `</motion.div>`.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/meet-jack/components/about.tsx
git commit -m "feat: subtle scroll parallax on about portrait"
```

---

### Task 6: Full verification (build + manual scroll check, both modes)

No unit tests exist for visual code; this task is the real verification gate.

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds, no type errors, no lint failures.

- [ ] **Step 2: Manual scroll check — light mode**

Run: `npm run dev`, open `http://localhost:3000/meet-jack` in light mode. Confirm:
- faint doodles are visible and drift at *different* speeds as you scroll (far slowest, near fastest);
- far-band doodles look slightly smaller/softer (depth reads);
- each section (About → Experience → Projects → Publications → Guestbook) rises + fades in once on arrival;
- the About portrait drifts subtly as it passes;
- no jank, no horizontal scrollbar, doodles never intercept clicks (backdrop is `pointer-events-none`).

- [ ] **Step 2b: Manual scroll check — dark mode**

Toggle dark mode. Confirm the *same* motion and depth read against the starfield, and the far-back ink-wash blob is faintly visible (light tint) rather than invisible. Motion/structure should feel identical to light mode — only palette differs.

- [ ] **Step 3: Reduced-motion check**

Enable OS "Reduce motion" (macOS: System Settings → Accessibility → Display → Reduce motion), reload `/meet-jack`. Confirm: doodles still render (enriched, static), but there is no scroll drift, no portrait drift, and sections appear without the rise animation.

- [ ] **Step 4: Mobile check**

In devtools, switch to a ≤640px viewport (e.g. iPhone SE). Confirm drift is much smaller/calmer and scrolling stays smooth.

- [ ] **Step 5: Final commit (only if any fixes were needed above)**

```bash
git add -A
git commit -m "fix: parallax verification adjustments"
```

If no fixes were needed, skip this step — the feature is already committed task-by-task.

---

## Notes for the implementer

- **Why nesting in `Band`:** CSS `translateZ`/`scale` and framer-motion's `y` both write the element's `transform`. On one node framer-motion wins and the depth is lost. Outer div = static depth, inner `motion.div` = drift.
- **The scale values compensate perspective foreshortening:** at `perspective: 1000px`, `translateZ(-300px)` shrinks an element to ~0.77×, so `scale(1.3)` restores its apparent size; `translateZ(-150px)` → `scale(1.15)`. Tweak to taste, but keep far bands at lower opacity so depth reads even though motion is subtle.
- **Don't add `transform-style: preserve-3d`** anywhere here — the bands are direct children of the perspective root and use only a single 3D transform, so it's unnecessary, and it can interact badly with the `blur()` filter on the far band.
- **Tuning:** the drift magnitudes (20/45/80) and doodle positions are the dials. If the effect feels too faint, raise the *near* drift before touching the others; if too busy, lower opacity rather than removing doodles.
