'use client'

import { useEffect, useRef, useState } from 'react'

const LERP = 0.12 // ring follow speed (0 = no follow, 1 = instant)

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  // Raw cursor position
  const mouse   = useRef({ x: -200, y: -200 })
  // Smoothed ring position
  const ring    = useRef({ x: -200, y: -200 })

  const hovering  = useRef(false)
  const clicking  = useRef(false)
  const rafId     = useRef<number>(0)

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      setVisible(true)
    }

    const onDown = () => {
      clicking.current = true
      applyStates()
    }
    const onUp = () => {
      clicking.current = false
      applyStates()
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const interactive =
        t.tagName === 'A' ||
        t.tagName === 'BUTTON' ||
        !!t.closest('a') ||
        !!t.closest('button') ||
        t.classList.contains('cursor-pointer')
      if (interactive !== hovering.current) {
        hovering.current = interactive
        applyStates()
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseover',  onOver)
    document.documentElement.classList.add('custom-cursor')

    // RAF loop — lerp ring toward mouse each frame
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * LERP
      ring.current.y += (mouse.current.y - ring.current.y) * LERP

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`
      }

      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseover',  onOver)
      document.documentElement.classList.remove('custom-cursor')
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  // Apply scale classes directly via style to avoid re-renders
  function applyStates() {
    if (!dotRef.current || !ringRef.current) return
    const h = hovering.current
    const c = clicking.current

    dotRef.current.style.width  = h ? '12px' : '6px'
    dotRef.current.style.height = h ? '12px' : '6px'
    dotRef.current.style.opacity = c ? '0.4' : '1'

    ringRef.current.style.width   = h ? '52px' : '34px'
    ringRef.current.style.height  = h ? '52px' : '34px'
    ringRef.current.style.opacity = c ? '0.3' : h ? '0.6' : '0.45'
  }

  return (
    <>
      {/* Sharp dot — snaps exactly to cursor */}
      <div
        ref={dotRef}
        data-cursor
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        style={{
          width: 6,
          height: 6,
          opacity: visible ? 1 : 0,
          backgroundColor: 'var(--cursor-color, currentColor)',
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
        }}
      />

      {/* Lagging ring */}
      <div
        ref={ringRef}
        data-cursor
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9997]"
        style={{
          width: 34,
          height: 34,
          opacity: visible ? 0.45 : 0,
          border: '1px solid var(--cursor-color, currentColor)',
          transition: 'width 0.25s ease, height 0.25s ease, opacity 0.2s ease',
        }}
      />
    </>
  )
}
