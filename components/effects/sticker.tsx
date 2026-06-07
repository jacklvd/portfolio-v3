'use client'

import { useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { WavyBorder } from '@/components/effects/wavy-frame'

interface StickerProps {
  label: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: number
  rotate?: number
  children: React.ReactNode
}

// A draggable scrap of paper pinned to the cover — washi tape on top, a wavy
// hand-inked border, a handwritten tab label, and a gentle resting tilt. The
// paper stays cream in both themes (like the guestbook notes), so its contents
// use dark ink colors regardless of light/dark mode.
export function Sticker({
  label,
  top,
  left,
  right,
  bottom,
  width = 200,
  rotate = 0,
  children,
}: StickerProps) {
  const innerControls = useAnimation()
  const dragRef = useRef<HTMLDivElement>(null)

  const shake = async () => {
    await innerControls.start({
      rotate: [rotate, rotate - 4, rotate + 4, rotate - 3, rotate + 3, rotate - 1.5, rotate + 1.5, rotate],
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
      whileDrag={{ scale: 1.05, zIndex: 60 }}
      className="fixed z-20 select-none pointer-events-auto"
      style={{ width, top, left, right, bottom, cursor: 'grab' }}
      data-pet-ledge
    >
      <motion.div animate={innerControls} initial={{ rotate }} className="group relative">
        {/* Washi tape */}
        <span
          aria-hidden
          className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-2 bg-[#e1d6bd]/70 shadow-sm"
        />

        <WavyBorder
          filterId="wavy-frame-sm"
          className="border border-stone-900/15 transition-colors duration-300 group-hover:border-stone-900/30"
        />

        <div className="relative bg-[#f6f1e9] px-1 pb-1 pt-3 text-stone-800 shadow-[3px_5px_14px_rgba(0,0,0,0.12)]">
          {/* Handwritten tab + shake button */}
          <div className="flex items-center justify-between px-3">
            <span className="font-hand text-base leading-none text-stone-500 truncate">
              {label}
            </span>
            <button
              onPointerDown={(e) => {
                e.stopPropagation()
                shake()
              }}
              className="ml-2 text-base leading-none text-stone-400 transition-colors duration-150 hover:text-stone-700"
              aria-label="Shake"
            >
              ×
            </button>
          </div>

          <div className="mt-1 overflow-hidden">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
