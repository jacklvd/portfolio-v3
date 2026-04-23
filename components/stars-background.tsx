'use client'
import { useMemo } from 'react'

type Star = {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function StarsBackground() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 160 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3 + 1) * 100,
      y: seededRandom(i * 3 + 2) * 100,
      size: seededRandom(i * 3 + 3) * 2 + 0.5,
      delay: seededRandom(i * 7 + 4) * 6,
      duration: seededRandom(i * 5 + 5) * 4 + 3,
      opacity: seededRandom(i * 11 + 6) * 0.5 + 0.3,
    }))
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block overflow-hidden">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
