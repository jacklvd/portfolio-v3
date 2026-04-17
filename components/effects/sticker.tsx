'use client'

import { useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface StickerProps {
  label: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: number
  children: React.ReactNode
}

export function Sticker({
  label,
  top,
  left,
  right,
  bottom,
  width = 200,
  children,
}: StickerProps) {
  const innerControls = useAnimation()
  const dragRef = useRef<HTMLDivElement>(null)

  const shake = async () => {
    await innerControls.start({
      rotate: [0, -4, 4, -3, 3, -1.5, 1.5, 0],
      x: [0, -6, 6, -4, 4, -2, 2, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    })
  }

  return (
    <motion.div
      ref={dragRef}
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileDrag={{ scale: 1.04, zIndex: 60 }}
      className="fixed z-20 select-none pointer-events-auto"
      style={{ width, top, left, right, bottom, cursor: 'grab' }}
    >
      <motion.div animate={innerControls}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-t-md bg-foreground/[0.06] border border-b-0 border-foreground/10 backdrop-blur-sm">
          <span className="text-[0.5rem] tracking-[0.25em] uppercase text-muted-foreground font-light truncate">
            {label}
          </span>
          <button
            onPointerDown={(e) => { e.stopPropagation(); shake() }}
            className="text-muted-foreground/60 hover:text-foreground transition-colors duration-150 leading-none ml-2 text-base"
            aria-label="Shake"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="rounded-b-md border border-foreground/10 bg-background/60 backdrop-blur-sm overflow-hidden">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}
