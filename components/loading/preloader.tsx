'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = 2200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(eased * 100));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else timeoutRef.current = setTimeout(() => setVisible(false), 400);
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
          key="preloader"
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8 select-none"
          exit={{ y: '-100%', transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
        >
          <span className="font-light tabular-nums text-8xl sm:text-9xl leading-none text-foreground">
            {String(count).padStart(3, '0')}
          </span>

          {/* Energy bar */}
          <div className="w-48 flex flex-col gap-2">
            <div className="w-full h-[3px] bg-foreground/10 overflow-hidden">
              <motion.div
                className="h-full bg-foreground origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: count / 100 }}
                transition={{ duration: 0, ease: 'linear' }}
              />
            </div>
            <span className="text-[0.6rem] tracking-[0.5em] uppercase text-muted-foreground font-light text-right">
              loading
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
