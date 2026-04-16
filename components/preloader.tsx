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

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeOutQuart — feels fast at first, slows near 100
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(eased * 100));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        timeoutRef.current = setTimeout(() => setVisible(false), 400);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

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
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-3 select-none"
          exit={{
            y: '-100%',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <span className="text-[0.6rem] tracking-[0.5em] uppercase text-muted-foreground font-light">
            loading
          </span>
          <span className="font-light tabular-nums text-8xl sm:text-9xl leading-none text-foreground">
            {String(count).padStart(3, '0')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
