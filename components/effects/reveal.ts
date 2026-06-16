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
