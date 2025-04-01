/* eslint-disable react/no-unescaped-entities */
import { OrbitingCircles } from '@/components/magicui/orbiting-circles'
import { Writer } from '@/components/typewriter'
import { Icons } from '../components/icons'
import Footer from '@/components/footer'
import Link from 'next/link'
import { User, ArrowRight } from 'lucide-react'

export default function Home() {
  // Fixed positions for social icons (outer orbit)
  const socialPositions = [
    { angle: 45, radius: 190, duration: 20 }, // top-right
    { angle: 135, radius: 190, duration: 20 }, // top-left
    { angle: 225, radius: 190, duration: 20 }, // bottom-left
    { angle: 315, radius: 190, duration: 20 }, // bottom-right
  ]

  return (
    <main className="flex flex-col items-center justify-between p-12 sm:p-14 md:p-18">
      <div className="text-2xl sm:text-4xl md:text-5xl text-black dark:text-white pb-0 sm:pb-8">
        Xin Chào, I'm
      </div>
      <div className="relative flex h-[450px] sm:h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-6xl md:text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-400">
          Jack Vo
        </span>

        {/* GitHub Icon (top) */}
        <OrbitingCircles
          className="size-10 border-none bg-transparent flex items-center justify-center"
          duration={20}
          radius={60}
        >
          <Icons.github className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </OrbitingCircles>

        {/* LinkedIn Icon (right) */}
        <OrbitingCircles
          className="size-10 border-none bg-transparent flex items-center justify-center"
          duration={20}
          radius={150}
        >
          <Icons.linkedin className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </OrbitingCircles>

        {/* Gmail Icon (bottom) */}
        <OrbitingCircles
          className="size-10 border-none bg-transparent flex items-center justify-center"
          duration={20}
          radius={90}
          reverse={true}
        >
          <Icons.gmail className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </OrbitingCircles>

        {/* Instagram Icon (left) */}
        <OrbitingCircles
          className="size-10 border-none bg-transparent flex items-center justify-center"
          duration={20}
          radius={150}
          reverse={true}
        >
          <Icons.instagram className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </OrbitingCircles>

        {/* Tech stack icons (outer orbit) */}
        {socialPositions.map((pos, index) => (
          <OrbitingCircles
            key={`tech-${index}`}
            className="size-8 border-none bg-transparent flex items-center justify-center"
            radius={pos.radius}
            duration={pos.duration}
            reverse={index % 2 === 0}
          >
            {index === 0 && (
              <Icons.react className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            )}
            {index === 1 && (
              <Icons.typescript className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            )}
            {index === 2 && (
              <Icons.tailwindcss className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            )}
            {index === 3 && (
              <Icons.nextjs className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            )}
          </OrbitingCircles>
        ))}
      </div>
      <Writer />

      {/* Simple Call-to-Action Section */}
      <div className="mt-12 text-center max-w-md">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Welcome to my personal space. Explore my journey, experience, and
          projects using the navigation bar below.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/meet-jack"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="h-4 w-4" />
            <span>About Me</span>
            <ArrowRight className="h-4 w-4 opacity-70" />
          </Link>
          <a
            href="https://github.com/jacklvd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            <Icons.github className="h-4 w-4" />
            <span>View GitHub</span>
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
