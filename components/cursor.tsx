'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface AdvancedCursorProps {
  color?: string
  size?: number
  ringSize?: number
  magneticStrength?: number
}

const AdvancedCursor: React.FC<AdvancedCursorProps> = ({
  color,
  size = 8,
  ringSize = 32,
  magneticStrength = 0.3,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [magnetElement, setMagnetElement] = useState<HTMLElement | null>(null)

  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Cursor color based on theme
  const cursorColor =
    color || (isDark ? 'rgba(20, 251, 231, 0.8)' : 'rgba(215, 251, 231, 0.5)')

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (magnetElement) {
        const rect = magnetElement.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Calculate distance to center of element
        const distX = centerX - e.clientX
        const distY = centerY - e.clientY

        // Apply magnetic pull (stronger as you get closer)
        setPosition({
          x: e.clientX + distX * magneticStrength,
          y: e.clientY + distY * magneticStrength,
        })
      } else {
        setPosition({ x: e.clientX, y: e.clientY })
      }

      if (!visible) setVisible(true)
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)
    const onMouseEnter = () => setVisible(true)
    const onMouseLeave = () => setVisible(false)

    // Handle hovering over interactive elements
    const handleElementMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isMagnetic = target.classList.contains('magnetic')

      if (isMagnetic) {
        setMagnetElement(target)
      }

      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.role === 'button' ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true)
      }
    }

    const handleElementMouseLeave = () => {
      setMagnetElement(null)
      setIsHovering(false)
    }

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseover', handleElementMouseEnter)
    document.addEventListener('mouseout', handleElementMouseLeave)

    // Hide default cursor
    document.documentElement.classList.add('custom-cursor')

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseover', handleElementMouseEnter)
      document.removeEventListener('mouseout', handleElementMouseLeave)

      // Restore default cursor
      document.documentElement.classList.remove('custom-cursor')
    }
  }, [visible, magnetElement, magneticStrength])

  // Don't render on server
  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="custom-cursor-element fixed top-0 left-0 rounded-full pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-transform duration-150"
        style={{
          backgroundColor: cursorColor,
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          transform: `translate(${position.x}px, ${position.y}px) scale(${
            isClicking ? 0.6 : isHovering ? 2 : 1
          })`,
        }}
      />

      {/* Cursor ring */}
      <div
        ref={ringRef}
        className="custom-cursor-element fixed top-0 left-0 rounded-full border pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-all duration-300 ease-out"
        style={{
          borderColor: cursorColor,
          width: ringSize,
          height: ringSize,
          opacity: visible ? 0.5 : 0,
          transform: `translate(${position.x}px, ${position.y}px) scale(${
            isClicking ? 0.9 : isHovering ? 1.5 : 1
          })`,
          borderWidth: '1px',
        }}
      />
    </>
  )
}

export default AdvancedCursor
