'use client';

// Pet-themed preloader: the ink-doodle creature walks across a progress line
// while a counter ticks to 100, then the whole screen slides away. Drop-in
// replacement for the old <Preloader> — same `onComplete` contract.

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetSprite } from './pet-sprite';
import { HAT_STORAGE_KEY, type HatId, HAT_IDS } from './hats';

interface PetLoaderProps {
  onComplete: () => void;
}

export default function PetLoader({ onComplete }: PetLoaderProps) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hat, setHat] = useState<HatId>('none');
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HAT_STORAGE_KEY) as HatId | null;
      if (saved && HAT_IDS.includes(saved)) setHat(saved);
    } catch {
      /* ignore */
    }

    const duration = 2200;
    const startTime = performance.now();
    const tick = (nowTs: number) => {
      const t = Math.min((nowTs - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(eased * 100));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else timeoutRef.current = setTimeout(() => setVisible(false), 450);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="pet-loader"
          className="fixed inset-0 z-[9999] flex select-none flex-col items-center justify-center gap-10 bg-background"
          exit={{ y: '-100%', transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
        >
          <span className="font-light tabular-nums text-7xl leading-none text-foreground sm:text-8xl">
            {String(count).padStart(3, '0')}
          </span>

          {/* Walk track */}
          <div className="w-64 sm:w-80">
            {/* The bar is the pet's "floor": it stands on top and walks along
                the leading edge of the fill as it grows. */}
            <div className="relative h-[3px] w-full">
              <div className="h-full w-full overflow-hidden bg-foreground/10">
                <motion.div
                  className="h-full origin-left bg-foreground"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: count / 100 }}
                  transition={{ duration: 0, ease: 'linear' }}
                />
              </div>
              <div
                className="absolute text-foreground"
                style={{
                  left: `calc(${count}% - 24px)`,
                  bottom: 'calc(100% - 5px)', // seat the feet on the line
                  transition: 'left 0.05s linear',
                }}
              >
                <PetSprite mode="walk" facing={1} hat={hat} className="h-12 w-12" />
              </div>
            </div>
            <span className="mt-3 block text-right text-[0.6rem] font-light uppercase tracking-[0.5em] text-muted-foreground">
              loading
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
