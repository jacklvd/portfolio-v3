// import Image from 'next/image'
import OrbitingCircles from '@/app/components/magicui/orbiting'
import { Writer } from '@/app/components/ui/typewriter'
import { Icons } from './components/icons'
import React from 'react'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-16 sm:p-20 md:p-24">
      <div className="text-2xl sm:text-4xl md:text-5xl text-black pb-0 sm:pb-8">
        Xin Chào, I'm
      </div>
      <div className="relative flex h-[450px] sm:h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-6xl md:text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
          Jack Vo
        </span>

        {/* Inner Circles */}
        <OrbitingCircles
          className="size-[30px] border-none bg-transparent"
          duration={20}
          delay={20}
          radius={80}
        >
          <Icons.instagram />
        </OrbitingCircles>
        <OrbitingCircles
          className="size-[30px] border-none bg-transparent"
          duration={20}
          delay={10}
          radius={80}
        >
          <Icons.linkedin />
        </OrbitingCircles>

        {/* Outer Circles (reverse) */}
        <OrbitingCircles
          className="size-[50px] border-none bg-transparent"
          radius={190}
          duration={20}
          reverse
        >
          <Icons.gmail />
        </OrbitingCircles>
        <OrbitingCircles
          className="size-[50px] border-none bg-transparent"
          radius={190}
          duration={20}
          delay={20}
          reverse
        >
          <Icons.github />
        </OrbitingCircles>
      </div>
      <Writer />
    </main>
  )
}
